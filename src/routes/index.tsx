import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { TimerCard, type TimerEntry } from "@/components/timer";
import { TodaysPlan, type TimeEntry } from "@/components/recent-entries";
import { Sidebar } from "@/components/sidebar";
import { AiSetupBar } from "@/components/ai-setup-bar";
import { AiAddModal } from "@/components/ai-add-modal";
import { GeneratedPlan } from "@/components/generated-plan";
import { cn } from "@/lib/utils";
import { buildPlanFromPrompt } from "@/lib/ai-parse";
import { rescheduleAll, scheduleEntries } from "@/lib/schedule";
import { useWorkSettings } from "@/lib/work-settings";
import { WorkSettingsDialog } from "@/components/work-settings-dialog";
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
  const [plans, setPlans] = useState<DraftPlan[]>([]);
  const [showSetup, setShowSetup] = useState(true);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [timerEntry, setTimerEntry] = useState<TimerEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, update: updateSettings } = useWorkSettings();
  const [addMode, setAddMode] = useState(false);
  const approvedRef = useRef(false);
  const addModeRef = useRef(false);

  // Load persisted setup state on first client render.
  useEffect(() => {
    const saved = loadState();
    if (saved && (saved.prompt || saved.entries.length > 0)) {
      setPrompt(saved.prompt);
      setCalendarConnected(saved.calendarConnected);
      setPlan(saved.plan);
      setPlans(saved.plans);
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
      plans,
      entries,
      timerEntry,
      approved: approvedRef.current,
    });
  }, [hydrated, prompt, calendarConnected, plan, plans, entries, timerEntry]);

  const rerun = useCallback(() => {
    setPlan(null);
    setLoading(false);
    addModeRef.current = false;
    setAddMode(false);
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
    const adding = addModeRef.current;
    const suffix = `p${plans.length + 1}`;
    const newEntries = scheduleEntries(
      adding ? entries : [],
      plan.entries.map((entry) => ({
        ...entry,
        id: adding ? `${entry.id}-${suffix}` : entry.id,
      })),
      settings,
    );

    setEntries((prev) => (adding ? [...prev, ...newEntries] : newEntries));
    setPlans((prev) => (adding ? [...prev, plan] : [plan]));

    const next: TimerEntry = {
      id: adding ? `timer-${suffix}` : "approved-timer",
      title: `Working on ${plan.project || "your project"}`,
      project: plan.project || "Main project",
      client: plan.client || "Client",
      tags: plan.tags.slice(0, 1),
      billable: true,
    };
    setTimerEntry(next);
    setActiveTimer(next.id);
    approvedRef.current = true;
    addModeRef.current = false;
    setAddMode(false);
    setShowSetup(false);
    const sameClient =
      adding &&
      plans.some((p) => p.client.trim().toLowerCase() === plan.client.trim().toLowerCase());
    toast.success(adding ? "Project added!" : "Workspace created!", {
      description: adding
        ? sameClient
          ? `Added ${plan.project} and its tasks under ${plan.client}.`
          : `Added ${plan.client} with ${plan.project} and its tasks.`
        : "We added your new client, project, and tasks to the left sidebar.",
      duration: 2000,
    });
  };

  const hasWorkspace = entries.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAddOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleAiAdd = (value: string) => {
    addModeRef.current = true;
    setAddMode(true);
    setShowSetup(true);
    handleSubmit(value);
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
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Clock className="h-3.5 w-3.5" />
              Working hours
            </button>
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
              <AiSetupBar loading={loading} onSubmit={handleSubmit} />

            )}
            {showSetup && plan && (
              <GeneratedPlan
                plan={plan}
                calendarConnected={calendarConnected}
                settings={settings}
                existingEntries={addMode ? entries : []}
                onChange={setPlan}
                onApprove={handleApprove}
                onDismiss={rerun}
              />
            )}
            <div
              className={cn(
                "space-y-3 transition-opacity duration-500",
                !hasWorkspace && "opacity-50",
              )}
            >
              {hasWorkspace && !showSetup && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI Add Project
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Premium

                    </span>
                    <kbd className="rounded border border-primary/30 px-1 font-sans text-[10px] text-primary/80">
                      ⌘K
                    </kbd>

                  </button>
                </div>
              )}
              <TimerCard
                entry={timerEntry}
                activeTimer={activeTimer}
                onTimerToggle={setActiveTimer}
              />
            </div>
            <TodaysPlan entries={entries} trackedMinutes={Math.floor(trackedSeconds / 60)} />
          </div>
        </div>
      </main>
      <AiAddModal open={addOpen} onOpenChange={setAddOpen} onSubmit={handleAiAdd} />
      <WorkSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={(next) => {
          updateSettings(next);
          setEntries((prev) => (prev.length ? rescheduleAll(prev, next) : prev));
          toast.success("Working hours updated", {
            description: "Existing and future tasks were rescheduled around lunch and your buffer.",
            duration: 2500,
          });
        }}
      />
    </div>
  );
}
