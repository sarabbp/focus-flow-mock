import { CheckCircle2, DollarSign, Play, Sparkles, Tag, User, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OnboardingAnswers } from "@/components/onboarding-modal";

interface GeneratedPlanProps {
  answers: OnboardingAnswers;
  suggestedTags: string[];
  onApprove: () => void;
  onDismiss: () => void;
}

export function GeneratedPlan({ answers, suggestedTags, onApprove, onDismiss }: GeneratedPlanProps) {
  const rate = answers.rate.trim() ? `$${answers.rate.trim()}/h` : "Rate not set";

  return (
    <section className="rounded-2xl border border-primary/30 bg-background p-6 shadow-sm ring-1 ring-primary/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-active text-sidebar-active-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Your workspace is ready</h2>
            <p className="text-sm text-muted-foreground">
              Generated from your setup — review it, then start tracking in one click.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Dismiss suggestions"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <User className="h-3.5 w-3.5" /> Client
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">{answers.client}</div>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> {rate} · Billable by default
          </div>
        </div>
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" /> Project
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">{answers.project}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {answers.calendarConnected ? "Calendar connected" : "Schedule imported"} · 3 suggested entries
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Tag className="h-3.5 w-3.5" /> Suggested task tags
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/70 font-normal text-secondary-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={onApprove} className="gap-1.5">
          <Play className="h-4 w-4 fill-current" /> Approve &amp; start timer
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          I'll set it up myself
        </button>
      </div>
    </section>
  );
}
