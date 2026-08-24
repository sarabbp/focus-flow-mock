import { useEffect, useState } from "react";
import { Play, Pause, Square, Tag, DollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TimerCardProps {
  activeTimer: string | null;
  onTimerToggle: (id: string | null) => void;
}

const currentEntry = {
  id: "explore-toggl-focus",
  title: "Explore Toggl Focus",
  project: "Toggl Home Assignment",
  client: "Sara",
  tags: ["Research"],
  billable: true,
};

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimerCard({ activeTimer, onTimerToggle }: TimerCardProps) {
  const [elapsed, setElapsed] = useState(54 * 60 + 27);

  useEffect(() => {
    if (activeTimer !== currentEntry.id) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const isRunning = activeTimer === currentEntry.id;

  return (
    <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <input
            type="text"
            defaultValue={currentEntry.title}
            className="w-full bg-transparent text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="What are you working on?"
          />
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge
              variant="secondary"
              className="bg-secondary/80 font-normal text-secondary-foreground"
            >
              {currentEntry.project}
            </Badge>
            <span className="text-muted-foreground/70">•</span>
            <span>{currentEntry.client}</span>
            <span className="text-muted-foreground/70">•</span>
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {currentEntry.tags.join(", ")}
            </span>
            {currentEntry.billable && (
              <>
                <span className="text-muted-foreground/70">•</span>
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Billable
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatElapsed(elapsed)}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTimerToggle(isRunning ? null : currentEntry.id)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                isRunning
                  ? "bg-timer-muted text-timer-foreground hover:bg-timer"
                  : "bg-timer text-timer-foreground hover:bg-timer-muted",
              )}
            >
              {isRunning ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onTimerToggle(null)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <Square className="h-5 w-5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
