import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { TimerCard, type TimerEntry } from "@/components/timer";
import { RecentEntries, type TimeEntry } from "@/components/recent-entries";
import { Sidebar } from "@/components/sidebar";
import { OnboardingModal, type OnboardingAnswers } from "@/components/onboarding-modal";
import { AiGenerating } from "@/components/ai-generating";
import { GeneratedPlan } from "@/components/generated-plan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Focus" },
      { name: "description", content: "Track your time and focus with a clean, modern dashboard." },
      { property: "og:title", content: "Dashboard — Focus" },
      { property: "og:description", content: "Track your time and focus with a clean, modern dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Phase = "onboarding" | "generating" | "ready";

const SUGGESTED_TAGS = ["Deep work", "Client call", "Revisions", "Admin"];

function buildEntries(answers: OnboardingAnswers): TimeEntry[] {
  const client = answers.client.trim() || "Client";
  const project = answers.project.trim() || "Main project";
  return [
    {
      id: "gen-1",
      title: "Kickoff call",
      project,
      client,
      duration: "30m",
      start: "9:00 AM",
      end: "9:30 AM",
      tags: ["Client call"],
      billable: true,
      color: "bg-timer/10 text-timer",
    },
    {
      id: "gen-2",
      title: "Discovery & notes",
      project,
      client,
      duration: "1h 15m",
      start: "10:30 AM",
      end: "11:45 AM",
      tags: ["Deep work"],
      billable: true,
      color: "bg-timer/10 text-timer",
    },
    {
      id: "gen-3",
      title: "Weekly admin",
      project: "Admin",
      client: "—",
      duration: "20m",
      start: "2:00 PM",
      end: "2:20 PM",
      tags: ["Admin"],
      billable: false,
      color: "bg-muted text-muted-foreground",
    },
  ];
}

function Dashboard() {
  const [phase, setPhase] = useState<Phase>("onboarding");
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [timerEntry, setTimerEntry] = useState<TimerEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  const handleComplete = (a: OnboardingAnswers) => {
    setAnswers(a);
    setPhase("generating");
  };

  const handleGenerated = () => {
    setPhase("ready");
    setShowPlan(true);
  };

  const handleApprove = () => {
    if (!answers) return;
    const generated = buildEntries(answers);
    setEntries(generated);
    const next: TimerEntry = {
      id: "approved-timer",
      title: `Working on ${answers.project.trim() || "your project"}`,
      project: answers.project.trim() || "Main project",
      client: answers.client.trim() || "Client",
      tags: ["Deep work"],
      billable: true,
    };
    setTimerEntry(next);
    setActiveTimer(next.id);
    setShowPlan(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold tracking-tight text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Today, Aug 24</div>
            <div className="h-6 w-px bg-border" />
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              SG
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <TimerCard entry={timerEntry} activeTimer={activeTimer} onTimerToggle={setActiveTimer} />
            {showPlan && answers && (
              <GeneratedPlan
                answers={answers}
                suggestedTags={SUGGESTED_TAGS}
                onApprove={handleApprove}
                onDismiss={() => setShowPlan(false)}
              />
            )}
            <RecentEntries
              entries={entries}
              trackedLabel={entries.length === 0 ? "0m tracked" : "2h 5m tracked"}
              plannedLabel={entries.length === 0 ? "Nothing planned" : "4h 45m planned"}
            />
          </div>
        </div>
      </main>

      {phase === "onboarding" && <OnboardingModal onComplete={handleComplete} />}
      {phase === "generating" && <AiGenerating onDone={handleGenerated} />}
    </div>
  );
}
