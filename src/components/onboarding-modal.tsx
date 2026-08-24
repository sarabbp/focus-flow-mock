import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarCheck,
  Check,
  DollarSign,
  Folder,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface OnboardingAnswers {
  role: string;
  project: string;
  client: string;
  rate: string;
  schedule: string;
  calendarConnected: boolean;
}

const steps = [
  { title: "What do you do?", subtitle: "Describe your role so we can tailor projects and tags.", icon: Briefcase },
  { title: "Client name & rate", subtitle: "Used to calculate billable amounts automatically.", icon: DollarSign },
  { title: "What's your main project?", subtitle: "We'll set it up as your default tracking project.", icon: Folder },
  {
    title: "Connect calendar or paste schedule",
    subtitle: "Focus turns your schedule into suggested time entries.",
    icon: CalendarCheck,
  },
];

export function OnboardingModal({
  onComplete,
  initial,
  onCancel,
}: {
  onComplete: (answers: OnboardingAnswers) => void;
  initial?: OnboardingAnswers | null | undefined;
  onCancel?: (() => void) | undefined;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    initial ?? {
      role: "",
      project: "",
      client: "",
      rate: "",
      schedule: "",
      calendarConnected: false,
    },
  );

  const set = <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const lastStep = steps.length - 1;

  const canContinue =
    step === 0
      ? answers.role.trim().length > 0
      : step === 1
        ? answers.client.trim().length > 0
        : step === 2
          ? answers.project.trim().length > 0
          : answers.calendarConnected || answers.schedule.trim().length > 0;

  const current = steps[step]!;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Set up Focus</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close setup"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 px-6 pt-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-secondary")}
            />
          ))}
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sidebar-active text-sidebar-active-foreground">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{current.title}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{current.subtitle}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <div className="space-y-2">
                <Label htmlFor="role">Your role</Label>
                <Textarea
                  id="role"
                  autoFocus
                  rows={3}
                  placeholder="e.g. Freelance product designer working on web apps and brand systems"
                  value={answers.role}
                  onChange={(e) => set("role", e.target.value)}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Freelance designer", "Web developer", "Marketing consultant"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("role", s)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
                <div className="space-y-2">
                  <Label htmlFor="client">Client name</Label>
                  <Input
                    id="client"
                    autoFocus
                    placeholder="e.g. Northwind Studio"
                    value={answers.client}
                    onChange={(e) => set("client", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly rate</Label>
                  <Input
                    id="rate"
                    inputMode="decimal"
                    placeholder="85"
                    value={answers.rate}
                    onChange={(e) => set("rate", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="project">Project name</Label>
                <Input
                  id="project"
                  autoFocus
                  placeholder="e.g. Website redesign"
                  value={answers.project}
                  onChange={(e) => set("project", e.target.value)}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Website redesign", "Brand identity", "Mobile app MVP"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("project", s)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => set("calendarConnected", !answers.calendarConnected)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    answers.calendarConnected
                      ? "border-primary bg-sidebar-active"
                      : "border-border hover:bg-secondary/60",
                  )}
                >
                  <CalendarCheck
                    className={cn(
                      "h-4.5 w-4.5",
                      answers.calendarConnected ? "text-sidebar-active-foreground" : "text-muted-foreground",
                    )}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Connect Google Calendar</div>
                    <div className="text-xs text-muted-foreground">
                      {answers.calendarConnected ? "Connected" : "Import meetings as entries"}
                    </div>
                  </div>
                  {answers.calendarConnected && <Check className="h-4 w-4 text-sidebar-active-foreground" />}
                </button>

                <div className="space-y-2">
                  <Label htmlFor="schedule">Or paste your schedule</Label>
                  <Textarea
                    id="schedule"
                    rows={4}
                    placeholder={"9:00 Client kickoff call\n10:30 Design system work\n14:00 Landing page build"}
                    value={answers.schedule}
                    onChange={(e) => set("schedule", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-panel px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            disabled={!canContinue}
            onClick={() => (step === lastStep ? onComplete(answers) : setStep((s) => s + 1))}
            className="gap-1.5"
          >
            {step === lastStep ? "Generate my dashboard" : "Continue"}
            {step === lastStep ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
