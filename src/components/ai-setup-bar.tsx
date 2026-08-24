import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export const QUICK_PILLS = [
  { label: "Freelance Designer ($85/hr)", prompt: "Freelance design work for Northwind Studio at $85/hr" },
  { label: "DevOps Consultant ($120/hr)", prompt: "DevOps consulting for Acme Cloud at $120/hr" },
  { label: "Game Translator ($45/hr)", prompt: "Translating Cyber Knight for Indie Gamers at $45/hr" },
];

interface AiSetupBarProps {
  loading: boolean;
  onSubmit: (prompt: string) => void;
}

export function AiSetupBar({ loading, onSubmit }: AiSetupBarProps) {
  const [value, setValue] = useState("");

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
            onSubmit={(e) => {
              e.preventDefault();
              if (value.trim()) onSubmit(value.trim());
            }}
            className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-panel px-4 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Tell us what you're working on today"
              placeholder="Tell us what you're working on today (e.g., 'Translating Cyber Knight for Indie Gamers at $45/hr')."
              className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="sm" disabled={!value.trim()} className="gap-1.5">
              Generate <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

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
