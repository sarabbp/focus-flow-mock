import { Clock, MoreHorizontal, Tag, DollarSign } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimeEntry {
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
}

const entries: TimeEntry[] = [
  {
    id: "1",
    title: "Explore Lovable",
    project: "Toggl Home Assignment",
    client: "Sara",
    duration: "1h",
    start: "2:00 PM",
    end: "3:00 PM",
    tags: ["Today"],
    billable: true,
    color: "bg-timer/10 text-timer",
  },
  {
    id: "2",
    title: "Lunch",
    project: "Personal",
    client: "—",
    duration: "45m",
    start: "1:00 PM",
    end: "1:45 PM",
    tags: [],
    billable: false,
    color: "bg-muted text-muted-foreground",
  },
  {
    id: "3",
    title: "Explore Toggl Focus",
    project: "Toggl Home Assignment",
    client: "Sara",
    duration: "1h",
    start: "11:30 AM",
    end: "12:30 PM",
    tags: ["Research"],
    billable: true,
    color: "bg-timer/10 text-timer",
  },
  {
    id: "4",
    title: "Start prototype",
    project: "Toggl Home Assignment",
    client: "Sara",
    duration: "2h",
    start: "9:00 AM",
    end: "11:00 AM",
    tags: ["Design"],
    billable: true,
    color: "bg-timer/10 text-timer",
  },
  {
    id: "5",
    title: "Email & planning",
    project: "Admin",
    client: "—",
    duration: "30m",
    start: "8:30 AM",
    end: "9:00 AM",
    tags: [],
    billable: false,
    color: "bg-muted text-muted-foreground",
  },
];

export function RecentEntries() {
  return (
    <section className="rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Recent time entries</h2>
          <p className="text-sm text-muted-foreground">Today &middot; 5h 15m tracked</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>4h 45m planned</span>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="group flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-panel"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className={cn("h-2.5 w-2.5 rounded-full", entry.color.split(" ")[0])} />
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
    </section>
  );
}
