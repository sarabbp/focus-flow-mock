import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  CalendarDays,
  Columns2,
  List,
  LayoutGrid,
  Settings,
  PanelRight,
  Play,
  DollarSign,
  AtSign,
  Plus,
  Hash,
  Minus,
  UtensilsCrossed,
  Clock,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Sidebar } from "@/components/sidebar";
import { WorkSettingsDialog } from "@/components/work-settings-dialog";
import { cn } from "@/lib/utils";
import { loadState, saveState } from "@/lib/onboarding-storage";
import { useWorkSettings } from "@/lib/work-settings";
import {
  WEEKDAY_LABELS,
  formatClock,
  moveEntryToSlot,
  parseClock,
  rescheduleAll,
  type WorkSettings,
} from "@/lib/schedule";
import type { TimeEntry } from "@/components/recent-entries";
import { projectColor } from "@/lib/project-colors";

export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "Timer — Focus" },
      { name: "description", content: "Track your week in a calendar timer view." },
      { property: "og:title", content: "Timer — Focus" },
      { property: "og:description", content: "Track your week in a calendar timer view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimerPage,
});

function formatTotal(minutes: number) {
  if (minutes <= 0) return "–";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function hourLabel(h: number) {
  const suffix = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

const ROW_HEIGHT = 64; // matches h-16
const MONDAY_DATE = 24;

function TimerPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const { settings, update } = useWorkSettings();

  useEffect(() => {
    const saved = loadState();
    if (saved?.entries?.length) setEntries(saved.entries);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: TimeEntry[]) => {
    setEntries(next);
    const saved = loadState();
    if (saved) saveState({ ...saved, entries: next });
  }, []);

  const applySettings = (next: WorkSettings) => {
    update(next);
    if (entries.length) persist(rescheduleAll(entries, next));
    toast.success("Working hours updated", {
      description: "Your schedule was recalculated with the new hours, buffer and lunch block.",
      duration: 2500,
    });
  };

  const gridStart = Math.min(7, Math.floor(settings.startHour) - 1);
  const gridEnd = Math.max(19, Math.ceil(settings.endHour) + 1);
  const hours = Array.from({ length: gridEnd - gridStart }, (_, i) => i + gridStart);
  const hasLunch = settings.lunchEnd > settings.lunchStart;

  const days = (settings.weekdays.length ? settings.weekdays : [0]).map((weekday) => ({
    weekday,
    label: WEEKDAY_LABELS[weekday] ?? "Day",
    date: MONDAY_DATE + weekday,
    active: weekday === 0,
  }));

  const positioned = entries
    .map((entry) => {
      const start = parseClock(entry.start);
      const end = parseClock(entry.end);
      if (start === null || end === null || end <= start) return null;
      return { entry, start, end, minutes: (end - start) * 60, day: entry.day ?? 0 };
    })
    .filter((v): v is NonNullable<typeof v> => !!v);

  const loggedMinutes = positioned.reduce((sum, p) => sum + p.minutes, 0);
  const dayTotals = days.map(({ weekday }) =>
    positioned.filter((p) => p.day === weekday).reduce((sum, p) => sum + p.minutes, 0),
  );

  /** Buffer strips between consecutive tasks on a day. */
  const buffersFor = (weekday: number) => {
    const sorted = positioned.filter((p) => p.day === weekday).sort((a, b) => a.start - b.start);
    const out: { key: string; start: number; end: number }[] = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const gapStart = sorted[i]!.end;
      const gapEnd = sorted[i + 1]!.start;
      if (gapEnd - gapStart > 0.001 && gapEnd - gapStart <= 1.01) {
        if (hasLunch && gapStart < settings.lunchEnd && gapEnd > settings.lunchStart) continue;
        out.push({ key: `${sorted[i]!.entry.id}-buffer`, start: gapStart, end: gapEnd });
      }
    }
    return out;
  };

  const handleDrop = (weekday: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = (e.clientY - rect.top) / ROW_HEIGHT + gridStart;
    const next = moveEntryToSlot(entries, dragId, weekday, offset, settings);
    const moved = next.find((entry) => entry.id === dragId);
    const before = entries.find((entry) => entry.id === dragId);
    setDragId(null);
    if (!moved || (moved.start === before?.start && moved.day === before?.day)) {
      toast("Kept at the nearest valid slot", {
        description: "That time clashed with lunch, another task, or your buffer.",
      });
      return;
    }
    persist(next);
    toast.success(`Moved to ${WEEKDAY_LABELS[weekday]} ${moved.start}`, {
      description: `Snapped to keep the ${settings.gapMinutes}m buffer and lunch block clear.`,
      duration: 2500,
    });
  };

  const lunchLabel = hasLunch
    ? `Lunch · ${formatClock(settings.lunchStart)} – ${formatClock(settings.lunchEnd)}`
    : "";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Row 1 — timer bar */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-3">
          <input
            className="flex-1 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-foreground/90"
            placeholder="What are you working on?"
          />
          <div className="flex items-center gap-2">
            <Chip icon={AtSign} label="Task" />
            <Chip icon={Plus} label="Project" />
            <Chip icon={Hash} label="Tags" />
            <button
              type="button"
              aria-label="Billable"
              className="flex h-8 w-8 items-center justify-center rounded-full text-timer hover:bg-secondary"
            >
              <DollarSign className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <span className="px-3 text-lg font-medium tabular-nums text-foreground">0:00:00</span>
            <button
              type="button"
              aria-label="Start timer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-timer text-timer-foreground transition-colors hover:bg-timer-muted"
            >
              <Play className="h-5 w-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Row 2 — date nav + view controls */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center rounded-lg border border-border">
            <button
              type="button"
              aria-label="Previous week"
              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-muted-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 border-x border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              This week • W35
            </button>
            <button
              type="button"
              aria-label="Next week"
              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              {days.length} Days
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex items-center rounded-lg border border-border">
              <ViewToggle icon={CalendarDays} label="Calendar view" active />
              <ViewToggle icon={Columns2} label="Split view" />
              <ViewToggle icon={List} label="List view" />
              <ViewToggle icon={LayoutGrid} label="Grid view" />
            </div>
            <button
              type="button"
              aria-label="Working hours settings"
              onClick={() => setSettingsOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Toggle panel"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Row 3 — logged / planned bars */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-2 text-xs">
          <span className="font-medium text-muted-foreground">Logged</span>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-3/4 rounded-full bg-timer" />
          </div>
          <span className="font-semibold text-foreground">{formatTotal(loggedMinutes)}</span>
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
            <Clock className="h-3 w-3" /> {formatClock(settings.startHour)} – {formatClock(settings.endHour)}
          </span>
          {hasLunch && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
              <UtensilsCrossed className="h-3 w-3" /> {lunchLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
            {settings.gapMinutes}m buffer between tasks
          </span>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="ml-auto inline-flex items-center gap-1 font-medium text-foreground hover:text-timer"
          >
            Edit working hours
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="flex border-b border-border">
          <div className="flex w-20 flex-shrink-0 items-center justify-center gap-1 text-muted-foreground">
            <button type="button" aria-label="Zoom out" className="hover:text-foreground">
              <Minus className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Zoom in" className="hover:text-foreground">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {days.map((day, dayIndex) => (
            <div
              key={day.label}
              className="flex flex-1 items-baseline justify-center gap-2 border-l border-border py-2"
            >
              <span
                className={cn(
                  "text-2xl font-semibold tabular-nums",
                  day.active ? "text-timer" : "text-foreground",
                )}
              >
                {day.date}
              </span>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    day.active ? "text-timer" : "text-muted-foreground",
                  )}
                >
                  {day.label}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    day.active ? "font-semibold text-timer" : "text-muted-foreground",
                  )}
                >
                  {formatTotal(dayTotals[dayIndex] ?? 0)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex flex-1 overflow-y-auto">
          <div className="flex w-full">
            {/* hour gutter */}
            <div className="w-20 flex-shrink-0">
              {hours.map((h) => (
                <div key={h} className="relative h-16">
                  <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                    {hourLabel(h)}
                  </span>
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day.label}
                className="relative flex-1 border-l border-border"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(day.weekday, e)}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className={cn(
                      "h-16 border-b border-border/60",
                      h >= Math.floor(settings.startHour) && h < settings.endHour
                        ? "bg-background"
                        : "bg-secondary/60",
                    )}
                  />
                ))}

                {/* Lunch block */}
                {hasLunch && (
                  <div
                    className="pointer-events-none absolute left-1 right-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-secondary"
                    style={{
                      top: (settings.lunchStart - gridStart) * ROW_HEIGHT,
                      height: Math.max((settings.lunchEnd - settings.lunchStart) * ROW_HEIGHT - 2, 18),
                    }}
                  >
                    <UtensilsCrossed className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">{lunchLabel}</span>
                  </div>
                )}

                {/* Buffer strips */}
                {buffersFor(day.weekday).map((buffer) => (
                  <div
                    key={buffer.key}
                    className="pointer-events-none absolute left-1 right-1 flex items-center justify-center rounded-sm bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,var(--color-border)_4px,var(--color-border)_5px)]"
                    style={{
                      top: (buffer.start - gridStart) * ROW_HEIGHT,
                      height: Math.max((buffer.end - buffer.start) * ROW_HEIGHT, 12),
                    }}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {Math.round((buffer.end - buffer.start) * 60)}m buffer
                    </span>
                  </div>
                ))}

                {positioned
                  .filter((p) => p.day === day.weekday)
                  .map(({ entry, start, end }) => {
                    const color = projectColor(entry.project);
                    return (
                    <div
                      key={entry.id}
                      draggable
                      onDragStart={() => setDragId(entry.id)}
                      onDragEnd={() => setDragId(null)}
                      title="Drag to reschedule — buffer and lunch rules are enforced"
                      className={cn(
                        "absolute left-1 right-1 cursor-grab overflow-hidden rounded-md border px-2 py-1 text-left active:cursor-grabbing",
                        color.border,
                        color.bg,
                        dragId === entry.id && "opacity-50 ring-2 ring-primary/40",
                      )}
                      style={{
                        top: (start - gridStart) * ROW_HEIGHT,
                        height: Math.max((end - start) * ROW_HEIGHT - 2, 20),
                      }}
                    >
                      <p className={cn("truncate text-xs font-semibold", color.text)}>
                        {entry.title}
                      </p>
                      <p className={cn("truncate text-[11px] opacity-80", color.text)}>
                        {entry.start} – {entry.end} · {entry.duration}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{entry.project}</p>
                    </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
        {!hydrated && null}
      </main>

      <WorkSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={applySettings}
      />
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: typeof AtSign; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
    </button>
  );
}

function ViewToggle({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof List;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-8 w-9 items-center justify-center first:rounded-l-lg last:rounded-r-lg",
        active ? "bg-sidebar-active text-timer" : "text-muted-foreground hover:bg-secondary",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
