import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronsUpDown,
  CircleSlash,
  Clock,
  Folder,
  Group,
  Layers,
  LayoutGrid,
  List,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Circle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { loadState } from "@/lib/onboarding-storage";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Focus" },
      { name: "description", content: "Track tasks on a board grouped by status." },
      { property: "og:title", content: "Tasks — Focus" },
      { property: "og:description", content: "Track tasks on a board grouped by status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

interface TaskCard {
  id: string;
  title: string;
  status: StatusKey;
  duration?: string;
  project: string;
  client: string;
  billable?: boolean;
  today?: boolean;
}

type StatusKey = "todo" | "progress" | "blocked" | "done";

const statuses: { key: StatusKey; label: string; icon: typeof Circle; tone: string }[] = [
  { key: "todo", label: "Todo", icon: Circle, tone: "text-muted-foreground" },
  { key: "progress", label: "In Progress", icon: Loader2, tone: "text-timer" },
  { key: "blocked", label: "Blocked", icon: CircleSlash, tone: "text-destructive" },
  { key: "done", label: "Done", icon: CheckCircle2, tone: "text-emerald-600" },
];

function TasksPage() {
  const [tasks, setTasks] = useState<TaskCard[]>([]);

  useEffect(() => {
    const plans = loadState()?.plans ?? [];
    if (plans.length === 0) return;
    setTasks(
      plans.flatMap((plan, planIndex) =>
        plan.entries.map((entry, i) => ({
          id: `${entry.id}-${planIndex}`,
          title: entry.title,
          status: (i === 0 ? "progress" : "todo") as StatusKey,
          duration: entry.duration,
          project: plan.project || "Project",
          client: plan.client || "Client",
          billable: entry.billable,
          today: true,
        })),
      ),
    );
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <div className="flex items-center justify-between px-6 pt-5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Tasks <span className="text-muted-foreground">· Board</span>
          </h1>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pt-4">
          <div className="flex items-center gap-2">
            <Chip icon={Layers} label="Saved views" trailing />
            <Chip icon={SlidersHorizontal} label="Filters" active />
            <Chip icon={Group} label="Group by:" value="Status" />
            <Chip icon={ChevronsUpDown} label="Sort by" />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button type="button" aria-label="List view" className="hover:text-foreground">
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Board view"
              className="rounded-md bg-secondary p-1 text-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Search" className="hover:text-foreground">
              <Search className="h-4 w-4" />
            </button>
            <button type="button" aria-label="AI suggestions" className="hover:text-foreground">
              <Sparkles className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Settings" className="hover:text-foreground">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Filter
          </button>
        </div>

        <div className="mt-4 flex flex-1 gap-4 overflow-x-auto px-6 pb-8">
          {statuses.map((status) => {
            const items = tasks.filter((t) => t.status === status.key);
            return (
              <div key={status.key} className="flex w-[280px] flex-shrink-0 flex-col">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <status.icon className={`h-4 w-4 ${status.tone}`} />
                  <span className="text-sm font-semibold text-foreground">{status.label}</span>
                  <span className="text-sm text-muted-foreground">{items.length}</span>
                </div>
                <div className="mt-3 flex flex-1 flex-col gap-3 rounded-xl bg-panel/60 p-2">
                  {items.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-xl border border-border bg-background p-3 shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        <status.icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${status.tone}`} />
                        <h2
                          className={`text-sm font-semibold text-foreground ${
                            status.key === "done" ? "line-through opacity-70" : ""
                          }`}
                        >
                          {task.title}
                        </h2>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Meta icon={status.icon} label={status.label} />
                        {task.today && <Meta label="Today" tone="text-primary" />}
                        {task.duration && <Meta icon={Clock} label={task.duration} />}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Meta icon={Folder} label={task.project} tone="text-primary" />
                        <Meta label={task.client} />
                        {task.billable && <Meta label="$" />}
                      </div>
                    </article>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-1 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  tone,
}: {
  icon?: typeof Clock;
  label: string;
  tone?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-secondary/70 px-1.5 py-0.5 text-[11px] font-medium ${
        tone ?? "text-secondary-foreground"
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      <span className="max-w-[110px] truncate">{label}</span>
    </span>
  );
}

function Chip({
  icon: Icon,
  label,
  value,
  active,
  trailing,
}: {
  icon: typeof Plus;
  label: string;
  value?: string;
  active?: boolean;
  trailing?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-foreground/30 bg-background text-foreground shadow-sm"
          : "border-border bg-background text-foreground hover:bg-panel"
      }`}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
      {value && <span className="text-primary">{value}</span>}
      {trailing && <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
    </button>
  );
}
