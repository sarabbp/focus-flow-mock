/** Stable per-project colour palette used on the calendar and entry lists. */
export interface ProjectColor {
  dot: string;
  bg: string;
  border: string;
  text: string;
}

const PALETTE: ProjectColor[] = [
  { dot: "bg-timer", bg: "bg-timer/10", border: "border-timer/30", text: "text-timer" },
  { dot: "bg-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-600" },
  { dot: "bg-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-600" },
  { dot: "bg-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" },
  { dot: "bg-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600" },
  { dot: "bg-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-600" },
];

const NEUTRAL: ProjectColor = {
  dot: "bg-muted-foreground/50",
  bg: "bg-muted",
  border: "border-border",
  text: "text-muted-foreground",
};

export function projectColor(project: string | undefined): ProjectColor {
  const name = (project ?? "").trim().toLowerCase();
  if (!name || name === "admin" || name === "—") return NEUTRAL;
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 100000;
  return PALETTE[hash % PALETTE.length]!;
}
