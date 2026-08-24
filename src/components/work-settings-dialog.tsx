import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS, type WorkSettings } from "@/lib/schedule";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: WorkSettings;
  onSave: (settings: WorkSettings) => void;
}

/** 9.5 -> "09:30" for <input type="time"> */
function toTimeValue(hours: number) {
  const total = Math.round(hours * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function fromTimeValue(value: string, fallback: number) {
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallback;
  return Number(m[1]) + Number(m[2]) / 60;
}

export function WorkSettingsDialog({ open, onOpenChange, settings, onSave }: Props) {
  const [draft, setDraft] = useState<WorkSettings>(settings);

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  const patch = (p: Partial<WorkSettings>) => setDraft((d) => ({ ...d, ...p }));

  const toggleDay = (index: number) =>
    patch({
      weekdays: draft.weekdays.includes(index)
        ? draft.weekdays.filter((d) => d !== index)
        : [...draft.weekdays, index].sort((a, b) => a - b),
    });

  const invalid =
    draft.endHour <= draft.startHour ||
    draft.weekdays.length === 0 ||
    draft.lunchEnd < draft.lunchStart;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Working hours
          </DialogTitle>
          <DialogDescription>
            Smart scheduling respects your working hours, lunch break, and buffer gaps when
            auto-allocating generated tasks.
          </DialogDescription>

        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="work-start">Day starts</Label>
              <Input
                id="work-start"
                type="time"
                value={toTimeValue(draft.startHour)}
                onChange={(e) => patch({ startHour: fromTimeValue(e.target.value, draft.startHour) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="work-end">Day ends</Label>
              <Input
                id="work-end"
                type="time"
                value={toTimeValue(draft.endHour)}
                onChange={(e) => patch({ endHour: fromTimeValue(e.target.value, draft.endHour) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Working days</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, index) => {
                const active = draft.weekdays.includes(index);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDay(index)}
                    className={cn(
                      "h-9 w-12 rounded-lg border text-xs font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lunch-start">Lunch starts</Label>
              <Input
                id="lunch-start"
                type="time"
                value={toTimeValue(draft.lunchStart)}
                onChange={(e) =>
                  patch({ lunchStart: fromTimeValue(e.target.value, draft.lunchStart) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lunch-end">Lunch ends</Label>
              <Input
                id="lunch-end"
                type="time"
                value={toTimeValue(draft.lunchEnd)}
                onChange={(e) => patch({ lunchEnd: fromTimeValue(e.target.value, draft.lunchEnd) })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gap-minutes">Buffer between tasks (minutes)</Label>
            <Input
              id="gap-minutes"
              type="number"
              min={0}
              max={120}
              step={5}
              value={draft.gapMinutes}
              onChange={(e) => patch({ gapMinutes: Math.max(0, Number(e.target.value) || 0) })}
              className="w-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={invalid}
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save &amp; reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
