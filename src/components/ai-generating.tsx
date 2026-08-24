import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stages = [
  { label: "Reading your project details", detail: "Parsing answers from setup" },
  { label: "Creating client card & billable rate", detail: "Setting default billing" },
  { label: "Parsing your schedule into time entries", detail: "Mapping blocks to entries" },
  { label: "Suggesting task tags", detail: "Grouping similar work" },
  { label: "Preparing your dashboard", detail: "Almost there" },
];

export function AiGenerating({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= stages.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const progress = Math.min(100, Math.round((step / stages.length) * 100));
  const currentStage = stages[Math.min(step, stages.length - 1)]!;

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

        <div className="mt-6 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Stage {Math.min(step + 1, stages.length)} of {stages.length} · {currentStage.detail}
          </span>
          <span className="text-foreground">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className="mt-6 space-y-3">
          {stages.map((stage, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li
                key={stage.label}
                className={cn(
                  "flex items-center gap-3 text-sm transition-colors",
                  done || active ? "text-foreground" : "text-muted-foreground/60",
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
                {stage.label}
              </li>
            );
          })}
        </ul>

        <div className="mt-7 flex justify-center">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel and edit answers
          </Button>
        </div>
      </div>
    </div>
  );
}
