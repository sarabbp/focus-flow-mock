import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const tasks = [
  "Reading your project details",
  "Creating client card & billable rate",
  "Parsing your schedule into time entries",
  "Suggesting task tags",
  "Preparing your dashboard",
];

export function AiGenerating({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= tasks.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const progress = Math.min(100, Math.round((step / tasks.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <span className="absolute inset-2 rounded-full bg-primary/10" />
            <Sparkles className="relative h-6 w-6 animate-pulse text-primary" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            Building your dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Focus AI is turning your setup into a ready-to-track workspace.
          </p>
        </div>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className="mt-6 space-y-3">
          {tasks.map((task, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li
                key={task}
                className={cn(
                  "flex items-center gap-3 text-sm transition-colors",
                  done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground/60",
                )}
              >
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                ) : active ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <span className="h-5 w-5 rounded-full border border-border" />
                )}
                {task}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
