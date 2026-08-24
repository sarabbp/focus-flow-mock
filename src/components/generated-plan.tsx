import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  DollarSign,
  GripVertical,
  Pencil,
  Play,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TimeEntry } from "@/components/recent-entries";
import type { DraftPlan } from "@/lib/onboarding-storage";
import {
  DEFAULT_WORK_SETTINGS,
  WEEKDAY_LABELS,
  formatClock,
  scheduleEntries,
  type WorkSettings,
} from "@/lib/schedule";

interface GeneratedPlanProps {
  plan: DraftPlan;
  calendarConnected: boolean;
  settings?: WorkSettings;
  /** Already-scheduled entries the preview must schedule around. */
  existingEntries?: TimeEntry[];
  onChange: (plan: DraftPlan) => void;
  onApprove: () => void;
  onDismiss: () => void;
}

export function GeneratedPlan({
  plan,
  calendarConnected,
  settings = DEFAULT_WORK_SETTINGS,
  existingEntries = [],
  onChange,
  onApprove,
  onDismiss,
}: GeneratedPlanProps) {
  const [editing, setEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  // Live preview of when each task will land, recomputed on every reorder.
  const scheduled = scheduleEntries(existingEntries, plan.entries, settings);
  const slotFor = (id: string) => scheduled.find((e) => e.id === id);
  const rateLabel = plan.rate.trim() ? `$${plan.rate.trim()}/h` : "Rate not set";

  const patch = (p: Partial<DraftPlan>) => onChange({ ...plan, ...p });

  const updateEntry = (id: string, changes: Partial<DraftPlan["entries"][number]>) =>
    patch({ entries: plan.entries.map((e) => (e.id === id ? { ...e, ...changes } : e)) });

  const moveEntry = (id: string, toIndex: number) => {
    const from = plan.entries.findIndex((e) => e.id === id);
    if (from < 0 || toIndex < 0 || toIndex >= plan.entries.length || from === toIndex) return;
    const next = [...plan.entries];
    const [moved] = next.splice(from, 1);
    next.splice(toIndex, 0, moved!);
    patch({ entries: next });
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag || plan.tags.includes(tag)) return;
    patch({ tags: [...plan.tags, tag] });
    setNewTag("");
  };

  return (
    <section className="rounded-2xl border border-primary/30 bg-background p-6 shadow-sm ring-1 ring-primary/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-active text-sidebar-active-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {editing ? "Tweak your workspace" : "Your workspace is ready"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editing
                ? "Adjust clients, tasks and tags, then approve when it looks right."
                : "Generated from your setup — review it, then start tracking in one click."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Dismiss suggestions"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <User className="h-3.5 w-3.5" /> Client
          </div>
          {editing ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-[1.4fr_1fr]">
              <div className="space-y-1">
                <Label htmlFor="plan-client" className="text-xs">
                  Name
                </Label>
                <Input
                  id="plan-client"
                  value={plan.client}
                  onChange={(e) => patch({ client: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-rate" className="text-xs">
                  Rate
                </Label>
                <Input
                  id="plan-rate"
                  inputMode="decimal"
                  value={plan.rate}
                  onChange={(e) => patch({ rate: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-2 text-sm font-semibold text-foreground">{plan.client}</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" /> {rateLabel} · Billable by default
              </div>
            </>
          )}
        </div>
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Project
            </span>
            <Badge
              variant="secondary"
              title="This project will appear in your Projects tab"
              className="bg-primary/10 font-normal normal-case tracking-normal text-primary"
            >
              Populates Projects Tab
            </Badge>
          </div>
          {editing ? (
            <div className="mt-2 space-y-1">
              <Label htmlFor="plan-project" className="text-xs">
                Name
              </Label>
              <Input
                id="plan-project"
                value={plan.project}
                onChange={(e) => patch({ project: e.target.value })}
              />
            </div>
          ) : (
            <>
              <div className="mt-2 text-sm font-semibold text-foreground">{plan.project}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {calendarConnected ? "Calendar connected" : "Schedule imported"} ·{" "}
                {plan.entries.length} suggested {plan.entries.length === 1 ? "entry" : "entries"}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" /> Suggested tasks
          </span>
          <Badge
            variant="secondary"
            title="Each task becomes a card in your Tasks Kanban board"
            className="bg-primary/10 font-normal normal-case tracking-normal text-primary"
          >
            Creates cards on Kanban Board and Timer
          </Badge>
        </div>
        {editing ? (
          <ul className="mt-2 space-y-2">
            {plan.entries.map((entry, index) => (
              <li
                key={entry.id}
                draggable
                onDragStart={() => setDragId(entry.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragId && dragId !== entry.id) moveEntry(dragId, index);
                }}
                className={`flex items-center gap-2 rounded-lg transition-colors ${
                  dragId === entry.id ? "opacity-60 ring-2 ring-primary/30" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-6 flex-shrink-0 cursor-grab items-center justify-center text-muted-foreground"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <Input
                  value={entry.title}
                  onChange={(e) => updateEntry(entry.id, { title: e.target.value })}
                  className="flex-1"
                  aria-label="Task name"
                />
                <Input
                  value={entry.duration}
                  onChange={(e) => updateEntry(entry.id, { duration: e.target.value })}
                  className="w-24"
                  aria-label="Duration"
                />
                <span className="w-40 flex-shrink-0 text-xs text-muted-foreground">
                  {slotFor(entry.id)
                    ? `${WEEKDAY_LABELS[slotFor(entry.id)!.day ?? 0]} ${slotFor(entry.id)!.start} – ${slotFor(entry.id)!.end}`
                    : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => moveEntry(entry.id, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${entry.title} up`}
                  className="flex h-9 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveEntry(entry.id, index + 1)}
                  disabled={index === plan.entries.length - 1}
                  aria-label={`Move ${entry.title} down`}
                  className="flex h-9 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => patch({ entries: plan.entries.filter((e) => e.id !== entry.id) })}
                  aria-label={`Remove ${entry.title}`}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            <li>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  patch({
                    entries: [
                      ...plan.entries,
                      {
                        id: `task-${Date.now()}`,
                        title: "New task",
                        project: plan.project,
                        client: plan.client,
                        duration: "30m",
                        start: "—",
                        end: "—",
                        tags: [],
                        billable: true,
                        color: "bg-timer/10 text-timer",
                      },
                    ],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add task
              </Button>
            </li>
          </ul>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {plan.entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => updateEntry(entry.id, { billable: !entry.billable })}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-timer" />
                {entry.title}
                <span className="text-xs text-muted-foreground">
                  {entry.duration}
                  {slotFor(entry.id)
                    ? ` · ${WEEKDAY_LABELS[slotFor(entry.id)!.day ?? 0]} ${slotFor(entry.id)!.start}`
                    : ""}
                </span>
              </button>
            ))}
          </div>
        )}

      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Tag className="h-3.5 w-3.5" /> Suggested task tags
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {plan.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 bg-secondary/70 font-normal text-secondary-foreground"
            >
              {tag}
              {editing && (
                <button
                  type="button"
                  onClick={() => patch({ tags: plan.tags.filter((t) => t !== tag) })}
                  aria-label={`Remove tag ${tag}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {editing && (
            <div className="flex items-center gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag"
                aria-label="New tag"
                className="h-8 w-32"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} aria-label="Add tag">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="relative inline-flex">
          <span className="absolute -inset-1 animate-pulse rounded-xl bg-primary/25" />
          <Button
            onClick={onApprove}
            size="lg"
            className="relative gap-2 px-6 text-base shadow-lg shadow-primary/20"
          >
            <Play className="h-4 w-4 fill-current" /> Approve and Start Timer
          </Button>
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Start over
        </button>
        <p className="w-full text-xs text-muted-foreground">
          Scheduled {formatClock(settings.startHour)}–{formatClock(settings.endHour)} with a{" "}
          {settings.gapMinutes}m buffer between tasks
          {settings.lunchEnd > settings.lunchStart
            ? `, skipping lunch (${formatClock(settings.lunchStart)}–${formatClock(settings.lunchEnd)})`
            : ""}
          . Reorder tasks to change the times.
        </p>
      </div>

    </section>
  );
}
