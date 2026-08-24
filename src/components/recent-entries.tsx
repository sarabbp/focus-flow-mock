import { Clock, MoreHorizontal, Tag, DollarSign, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { projectColor } from "@/lib/project-colors";

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
}

interface RecentEntriesProps {
  entries: TimeEntry[];
  trackedLabel?: string;
  plannedLabel?: string;
}

export function RecentEntries({
  entries,
  trackedLabel = "0m tracked",
  plannedLabel = "0m planned",
}: RecentEntriesProps) {
  return (
    <section className="rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Recent time entries</h2>
          <p className="text-sm text-muted-foreground">Today &middot; {trackedLabel}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{plannedLabel}</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">No time entries yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Start the timer above and your entries will show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
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
    </section>
  );
}
