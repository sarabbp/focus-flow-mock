import type { TimeEntry } from "@/components/recent-entries";

export interface WorkSettings {
  /** Decimal hours, e.g. 9 or 8.5 */
  startHour: number;
  endHour: number;
  /** 0 = Monday … 6 = Sunday */
  weekdays: number[];
  lunchStart: number;
  lunchEnd: number;
  /** Minimum break between two tasks, in minutes */
  gapMinutes: number;
}

export const DEFAULT_WORK_SETTINGS: WorkSettings = {
  startHour: 9,
  endHour: 17,
  weekdays: [0, 1, 2, 3, 4],
  lunchStart: 13,
  lunchEnd: 14,
  gapMinutes: 10,
};

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "1h 30m" / "45m" / "2h" -> minutes */
export function durationToMinutes(value: string): number {
  const h = /(\d+)\s*h/i.exec(value)?.[1];
  const m = /(\d+)\s*m/i.exec(value)?.[1];
  const total = (h ? Number(h) * 60 : 0) + (m ? Number(m) : 0);
  return total > 0 ? total : 30;
}

/** 9.5 -> "9:30 AM" */
export function formatClock(hoursDecimal: number): string {
  const total = Math.round(hoursDecimal * 60);
  const h24 = Math.floor(total / 60);
  const mins = total % 60;
  const suffix = h24 < 12 ? "AM" : "PM";
  const display = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${display}:${String(mins).padStart(2, "0")} ${suffix}`;
}

/** "9:30 AM" -> 9.5 */
export function parseClock(value: string): number | null {
  const m = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const period = m[3]?.toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h + min / 60;
}

function hasLunch(s: WorkSettings) {
  return s.lunchEnd > s.lunchStart;
}

/** Does [start, start+hours) fit inside the working window without hitting lunch? */
function fits(start: number, hours: number, s: WorkSettings) {
  if (start < s.startHour || start + hours > s.endHour) return false;
  if (!hasLunch(s)) return true;
  return start >= s.lunchEnd || start + hours <= s.lunchStart;
}

/** Nudge a start time out of the lunch block. */
function afterLunch(start: number, s: WorkSettings) {
  return hasLunch(s) && start > s.lunchStart && start < s.lunchEnd ? s.lunchEnd : start;
}

/**
 * Pack `incoming` entries into the configured working window, continuing after
 * whatever `existing` already occupies. Always leaves the configured gap
 * between tasks, never schedules across the lunch block, and rolls over to the
 * next configured working day when a task would spill past the end of day.
 */
export function scheduleEntries(
  existing: TimeEntry[],
  incoming: TimeEntry[],
  settings: WorkSettings = DEFAULT_WORK_SETTINGS,
): TimeEntry[] {
  const s = settings;
  const gap = s.gapMinutes / 60;
  const days = s.weekdays.length ? [...s.weekdays].sort((a, b) => a - b) : [0];

  const cursors = new Map<number, number>();
  for (const entry of existing) {
    const day = entry.day ?? days[0]!;
    const end = parseClock(entry.end);
    if (end === null) continue;
    cursors.set(day, Math.max(cursors.get(day) ?? s.startHour, end + gap));
  }

  let di = 0;
  return incoming.map((entry) => {
    const hours = durationToMinutes(entry.duration) / 60;
    let day = days[di]!;
    let start = afterLunch(Math.max(cursors.get(day) ?? s.startHour, s.startHour), s);
    if (!fits(start, hours, s) && hasLunch(s) && start < s.lunchStart) start = s.lunchEnd;

    while (!fits(start, hours, s) && di < days.length - 1) {
      di += 1;
      day = days[di]!;
      start = s.startHour;
      if (!fits(start, hours, s) && hasLunch(s) && start < s.lunchStart) start = s.lunchEnd;
    }

    if (!fits(start, hours, s)) {
      start = afterLunch(Math.max(s.startHour, Math.min(start, s.endHour - hours)), s);
    }

    const end = start + hours;
    cursors.set(day, end + gap);
    return { ...entry, day, start: formatClock(start), end: formatClock(end) };
  });
}

/** Re-pack every entry in order — used after reordering tasks. */
export function rescheduleAll(entries: TimeEntry[], settings = DEFAULT_WORK_SETTINGS) {
  return scheduleEntries([], entries, settings);
}

/**
 * Move one entry to (roughly) a new day/time, snapping to the nearest valid
 * slot: inside working hours, outside lunch, and at least `gapMinutes` away
 * from the neighbouring entries on that day.
 */
export function moveEntryToSlot(
  entries: TimeEntry[],
  id: string,
  day: number,
  desiredStart: number,
  settings: WorkSettings = DEFAULT_WORK_SETTINGS,
): TimeEntry[] {
  const s = settings;
  const gap = s.gapMinutes / 60;
  const target = entries.find((e) => e.id === id);
  if (!target) return entries;
  const hours = durationToMinutes(target.duration) / 60;

  const others = entries
    .filter((e) => e.id !== id && (e.day ?? s.weekdays[0]) === day)
    .map((e) => ({ start: parseClock(e.start) ?? 0, end: parseClock(e.end) ?? 0 }))
    .sort((a, b) => a.start - b.start);

  const snap = (v: number) => Math.round(v * 12) / 12; // 5-minute grid
  const collides = (start: number) =>
    others.find((o) => start < o.end + gap && start + hours > o.start - gap);

  const search = (from: number) => {
    let start = afterLunch(snap(Math.max(from, s.startHour)), s);
    for (let i = 0; i < 60; i += 1) {
      if (!fits(start, hours, s)) {
        if (hasLunch(s) && start < s.lunchEnd) {
          start = s.lunchEnd;
          continue;
        }
        return null;
      }
      const clash = collides(start);
      if (!clash) return start;
      start = afterLunch(snap(clash.end + gap), s);
    }
    return null;
  };

  const start = search(desiredStart) ?? search(s.startHour);
  if (start === null) return entries;

  return entries.map((e) =>
    e.id === id
      ? { ...e, day, start: formatClock(start), end: formatClock(start + hours) }
      : e,
  );
}

// Legacy named exports kept for compatibility.
export const WORK_START = DEFAULT_WORK_SETTINGS.startHour;
export const WORK_END = DEFAULT_WORK_SETTINGS.endHour;
export const WORK_DAYS = 5;
