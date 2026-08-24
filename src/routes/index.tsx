import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { TimerCard, type TimerEntry } from "@/components/timer";
import { RecentEntries, type TimeEntry } from "@/components/recent-entries";
import { Sidebar } from "@/components/sidebar";
import { AiSetupBar } from "@/components/ai-setup-bar";
import { AiAddModal } from "@/components/ai-add-modal";
import { GeneratedPlan } from "@/components/generated-plan";
import { cn } from "@/lib/utils";
import { buildPlanFromPrompt } from "@/lib/ai-parse";
import {
  consumeReopenRequest,
  loadState,
  saveState,
  REOPEN_EVENT,
  type DraftPlan,
} from "@/lib/onboarding-storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Focus" },
      { name: "description", content: "Track your time and focus with a clean, modern dashboard." },
      { property: "og:title", content: "Dashboard — Focus" },
      {
        property: "og:description",
        content: "Track your time and focus with a clean, modern dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [hydrated, setHydrated] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DraftPlan | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [timerEntry, setTimerEntry] = useState<TimerEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const approvedRef = useRef(false);

  // Load persisted setup state on first client render.
  useEffect(() => {
    const saved = loadState();
    if (saved && (saved.prompt || saved.entries.length > 0)) {
      setPrompt(saved.prompt);
      setCalendarConnected(saved.calendarConnected);
      setPlan(saved.plan);
      setEntries(saved.entries);
      setTimerEntry(saved.timerEntry);
      approvedRef.current = saved.approved;
      setShowSetup(!saved.approved);
    }
    if (consumeReopenRequest()) {
      setPlan(null);
      setShowSetup(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      prompt,
      calendarConnected,
      plan,
      entries,
      timerEntry,
      approved: approvedRef.current,
    });
  }, [hydrated, prompt, calendarConnected, plan, entries, timerEntry]);

  const rerun = useCallback(() => {
    setPlan(null);
    setLoading(false);
    approvedRef.current = false;
    setShowSetup(true);
  }, []);

  useEffect(() => {
    window.addEventListener(REOPEN_EVENT, rerun);
    return () => window.removeEventListener(REOPEN_EVENT, rerun);
  }, [rerun]);

  const handleSubmit = (value: string) => {
    setPrompt(value);
    setPlan(null);
    setLoading(true);
    window.setTimeout(() => {
      setPlan(buildPlanFromPrompt(value));
      setLoading(false);
    }, 2000);
  };

  const handleApprove = () => {
    if (!plan) return;
    setEntries(plan.entries);
    const next: TimerEntry = {
      id: "approved-timer",
      title: `Working on ${plan.project || "your project"}`,
      project: plan.project || "Main project",
      client: plan.client || "Client",
      tags: plan.tags.slice(0, 1),
      billable: true,
    };
    setTimerEntry(next);
    setActiveTimer(next.id);
    approvedRef.current = true;
    setShowSetup(false);
    toast.success("Workspace created!", {
      description:
        "We added your new client, project, and tasks to the left sidebar.",
      duration: 2000,
    });
  };

  const hasWorkspace = entries.length > 0;

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
            {showSetup && !plan && (
              <AiSetupBar
                loading={loading}
                calendarConnected={calendarConnected}
                onSubmit={handleSubmit}
                onConnectCalendar={() => setCalendarConnected((v) => !v)}
              />
            )}
            {showSetup && plan && (
              <GeneratedPlan
                plan={plan}
                calendarConnected={calendarConnected}
                onChange={setPlan}
                onApprove={handleApprove}
                onDismiss={rerun}
              />
            )}
            <TimerCard entry={timerEntry} activeTimer={activeTimer} onTimerToggle={setActiveTimer} />
            <RecentEntries
              entries={entries}
              trackedLabel={entries.length === 0 ? "0m tracked" : "3h 5m tracked"}
              plannedLabel={entries.length === 0 ? "Nothing planned" : "4h 45m planned"}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
