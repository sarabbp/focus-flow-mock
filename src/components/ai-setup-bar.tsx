import { useState } from "react";
import { AlertCircle, ArrowRight, Info, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export const QUICK_PILLS = [
  { label: "Freelance Designer ($85/hr)", prompt: "Freelance design work for Northwind Studio at $85/hr" },
  { label: "DevOps Consultant ($120/hr)", prompt: "DevOps consulting for Acme Cloud at $120/hr" },
  { label: "Game Translator ($45/hr)", prompt: "Translating Cyber Knight for Indie Gamers at $45/hr" },
];

interface AiSetupBarProps {
  loading: boolean;
  onSubmit: (prompt: string) => void;
}

const MAX_LENGTH = 240;

/** Blocking problems — the prompt can't be parsed at all. */
function getError(value: string): string | null {
  const text = value.trim();
  if (!text) return "Add a short description of what you're working on.";
  if (text.length < 12)
    return "That's a bit short — include the work, the client, and your rate (e.g. “Translating Cyber Knight for Indie Gamers at $45/hr”).";
  if (text.length > MAX_LENGTH) return `Keep it under ${MAX_LENGTH} characters.`;
  if (!/[a-zA-Z]{3}/.test(text)) return "Use words, not just numbers or symbols.";
  return null;
}

/** Non-blocking hints — it will work, but the result will be less complete. */
function getHints(value: string): string[] {
  const text = value.trim();
  if (!text) return [];
  const hints: string[] = [];
  if (!/\d+\s*(\$|usd|eur|€|£)?\s*(\/|per)?\s*(h|hr|hour)/i.test(text) && !/[$€£]\s*\d/.test(text))
    hints.push("no hourly rate detected — add “at $45/hr” to bill this project");
  if (!/\b(for|with|client)\b/i.test(text))
    hints.push("no client detected — add “for Acme Studio” so we can group your work");
  return hints;
}

export function AiSetupBar({ loading, onSubmit }: AiSetupBarProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const error = getError(value);
  const hints = getHints(value);
  const showError = touched && error !== null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.07] via-background to-background p-8 shadow-lg shadow-primary/10 ring-1 ring-primary/20">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Focus AI setup
      </div>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
        ⚡ Quick Start: Build your workspace in 30 seconds
      </h2>

      {loading ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-panel px-4 py-5">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              AI is parsing client, rate, and generating task cards...
            </p>
            <p className="text-xs text-muted-foreground">This takes just a moment.</p>
          </div>
        </div>
      ) : (
        <>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              setTouched(true);
              if (!getError(value)) onSubmit(value.trim());
            }}
            className={cn(
              "mt-4 flex items-center gap-2 rounded-xl border border-border bg-panel px-4 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15",
              showError && "border-destructive/60 focus-within:border-destructive focus-within:ring-destructive/15",
            )}
          >
            <input
              value={value}
              maxLength={MAX_LENGTH}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-label="Tell us what you're working on today"
              aria-invalid={showError}
              aria-describedby="ai-setup-help"
              placeholder="Tell us what you're working on today (e.g., 'Translating Cyber Knight for Indie Gamers at $45/hr')."
              className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="sm" className="gap-1.5">
              Generate <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div id="ai-setup-help" aria-live="polite" className="mt-2 space-y-1">
            {showError ? (
              <p className="flex items-start gap-1.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Include the <span className="text-foreground">task</span>, the{" "}
                <span className="text-foreground">client</span>, and your{" "}
                <span className="text-foreground">hourly rate</span> — we use them to create the
                project, tasks, and billing.
              </p>
            )}
            {!showError &&
              hints.map((hint) => (
                <p key={hint} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {hint}
                </p>
              ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {QUICK_PILLS.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => onSubmit(pill.prompt)}
                className="rounded-full border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                {pill.label}
              </button>
            ))}
          </div>


        </>
      )}
    </section>
  );
}
