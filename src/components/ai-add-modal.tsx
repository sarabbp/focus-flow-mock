import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QUICK_PILLS } from "@/components/ai-setup-bar";

interface AiAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (prompt: string) => void;
}

export function AiAddModal({ open, onOpenChange, onSubmit }: AiAddModalProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  const submit = (prompt: string) => {
    onSubmit(prompt);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> AI Add Project
          </DialogTitle>
          <DialogDescription>
            Describe the work and we'll create the client, project and task cards.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) submit(value.trim());
          }}
          className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Describe the new client or project"
            placeholder="e.g. 'Landing page redesign for Northwind Studio at $85/hr'"
            className="h-9 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" disabled={!value.trim()} className="gap-1.5">
            Generate <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {QUICK_PILLS.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => submit(pill.prompt)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
