import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Clock,
  DollarSign,
  CalendarClock,
  MoreHorizontal,
  Tag,
  Inbox,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { projectColor } from "@/lib/project-colors";
import { durationToMinutes, parseClock } from "@/lib/schedule";

export interface TimeEntry {
  id: string;
  title: string;
  project: string;
  client: string;
  duration: string;
  start: string;
  end: string;
  tags: string[];
  billable: boolean;
  color: string;
  /** Working day index this entry is scheduled on (0 = Monday). */
  day?: number;
  /** Optional hourly rate used to estimate billable value. */
  hourlyRate?: number;
}

interface TodaysPlanProps {
  entries: TimeEntry[];
  trackedMinutes: number;
}

function formatMinutes(value: number): string {
  const h = Math.floor(value / 60);
  const m = value % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function StatPill({
  icon: Icon,
  label,
  value,
  title,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-secondary/40 p-3"
      title={title ?? value}
    >
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="truncate text-sm font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

export function TodaysPlan({ entries, trackedMinutes }: TodaysPlanProps) {
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const plannedMinutes = useMemo(
    () => entries.reduce((sum, e) => sum + durationToMinutes(e.duration), 0),
    [entries],
  );

  const nextUp = useMemo(() => {
    const currentDecimal = now.getHours() + now.getMinutes() / 60;
    return [...entries]
      .sort((a, b) => (parseClock(a.start) ?? 0) - (parseClock(b.start) ?? 0))
      .find((e) => (parseClock(e.start) ?? 0) > currentDecimal);
  }, [entries, now]);

  const billableTotal = useMemo(() => {
    return Math.round(
      entries
        .filter((e) => e.billable && e.hourlyRate)
        .reduce((sum, e) => sum + (durationToMinutes(e.duration) * e.hourlyRate!) / 60, 0),
    );
  }, [entries]);

  const hasEntries = entries.length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Today’s Plan & Progress</h2>
            <p className="text-sm text-muted-foreground">
              {hasEntries
                ? "Overview of your scheduled focus blocks"
                : "No tasks scheduled yet — start with the AI setup above"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Show {entries.length} scheduled tasks
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatPill
            icon={Clock}
            label="Tracked"
            value={`${formatMinutes(trackedMinutes)} / ${formatMinutes(plannedMinutes)}`}
            title={`${formatMinutes(trackedMinutes)} tracked out of ${formatMinutes(plannedMinutes)} planned`}
          />
          <StatPill
            icon={CalendarClock}
            label="Next Up"
            value={
              nextUp
                ? `${nextUp.title} at ${nextUp.start}`
                : hasEntries
                  ? "All done for now"
                  : "—"
            }
          />
          <StatPill
            icon={DollarSign}
            label="Billable"
            value={billableTotal > 0 ? `$${billableTotal}` : "—"}
            title={billableTotal > 0 ? `Estimated billable value: $${billableTotal}` : "No billable rate set"}
          />
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 border-t border-border px-6 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">No time entries yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Start the timer above and your entries will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="group flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-panel"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className={cn("h-2.5 w-2.5 rounded-full", projectColor(entry.project).dot)} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">{entry.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="bg-secondary/60 px-1.5 py-0 font-normal text-secondary-foreground"
                        >
                          {entry.project}
                        </Badge>
                        <span>{entry.client}</span>
                        {entry.tags.length > 0 && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="inline-flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {entry.tags.join(", ")}
                            </span>
                          </>
                        )}
                        {entry.billable && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <DollarSign className="h-3 w-3" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">
                      {entry.start} – {entry.end}
                    </span>
                    <span className="w-12 text-right font-medium tabular-nums text-foreground">
                      {entry.duration}
                    </span>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-secondary-foreground group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
