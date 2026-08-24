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
} from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

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

const days = [
  { date: 24, label: "Mon", total: "1h 24m", active: true },
  { date: 25, label: "Tue", total: "–" },
  { date: 26, label: "Wed", total: "–" },
  { date: 27, label: "Thu", total: "–" },
  { date: 28, label: "Fri", total: "–" },
];

const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 → 19:00

function hourLabel(h: number) {
  const suffix = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

const WORK_START = 9;
const WORK_END = 17;

function TimerPage() {
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
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              5 Days
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
              aria-label="Settings"
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
          <span className="font-semibold text-foreground">1h 24m</span>
          <span className="ml-2 font-medium text-muted-foreground">Planned</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-5/6 rounded-full bg-timer" />
          </div>
          <span className="font-semibold text-foreground">4h 45m</span>
          <button type="button" className="ml-2 inline-flex items-center gap-1 font-medium text-foreground hover:text-timer">
            View reports
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
          {days.map((day) => (
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
                  {day.total}
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
              <div key={day.label} className="flex-1 border-l border-border">
                {hours.map((h) => (
                  <div
                    key={h}
                    className={cn(
                      "h-16 border-b border-border/60",
                      h >= WORK_START && h < WORK_END ? "bg-background" : "bg-secondary/60",
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
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
