import type { TimeEntry } from "@/components/recent-entries";

export const WORK_START = 9; // 9:00 AM
export const WORK_END = 17; // 5:00 PM
export const WORK_DAYS = 5; // Mon–Fri
export const LUNCH_START = 13; // 1:00 PM
export const LUNCH_END = 14; // 2:00 PM
export const GAP_MINUTES = 10; // minimum break between tasks

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

function parseClock(value: string): number | null {
  const m = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const period = m[3]?.toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h + min / 60;
}

/** Next free time per working day, given already-scheduled entries. */
function occupancy(existing: TimeEntry[]): number[] {
  const cursors = Array.from({ length: WORK_DAYS }, () => WORK_START);
  for (const entry of existing) {
    const day = Math.min(Math.max(entry.day ?? 0, 0), WORK_DAYS - 1);
    const end = parseClock(entry.end);
    if (end !== null && end > cursors[day]!) cursors[day] = end;
  }
  return cursors;
}

/**
 * Pack `incoming` entries into 9am–5pm working days, continuing after whatever
 * `existing` already occupies. Anything that would spill past 5pm moves to the
 * next available day.
 */
export function scheduleEntries(existing: TimeEntry[], incoming: TimeEntry[]): TimeEntry[] {
  const cursors = occupancy(existing);
  let day = cursors.findIndex((c) => c < WORK_END);
  if (day < 0) day = 0;

  return incoming.map((entry) => {
    const minutes = durationToMinutes(entry.duration);
    const hours = minutes / 60;

    while (day < WORK_DAYS - 1 && cursors[day]! + hours > WORK_END) day += 1;
    // Last day: clamp so entries stay inside the working window.
    const start = Math.min(cursors[day]!, WORK_END - hours);
    const end = start + hours;
    cursors[day] = end;

    return { ...entry, day, start: formatClock(start), end: formatClock(end) };
  });
}
