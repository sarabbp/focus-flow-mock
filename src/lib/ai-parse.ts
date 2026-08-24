import type { DraftPlan } from "@/lib/onboarding-storage";

const TAGS = ["Deep work", "Client call", "Revisions", "Admin"];

function titleCase(s: string) {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}

/** Extract client, project and rate from a free-form prompt like
 *  "Translating Cyber Knight for Indie Gamers at $45/hr". */
export function parsePrompt(prompt: string): { client: string; project: string; rate: string } {
  const text = prompt.trim();
  const rate = text.match(/\$\s?(\d+(?:\.\d+)?)/)?.[1] ?? "";

  let work = text.replace(/\bat\b[^,]*\$\s?\d+(?:\.\d+)?\s*(?:\/\s*(?:hr|hour|h))?/i, "").trim();
  work = work.replace(/[.,;]+$/, "").trim();

  let client = "";
  let project = work;
  const forMatch = work.match(/\bfor\b\s+(.+)$/i);
  if (forMatch) {
    client = forMatch[1]!.trim();
    project = work.slice(0, forMatch.index).trim();
  }

  project = project.replace(/^(i'?m\s+)?(working on|doing)\s+/i, "").trim();

  return {
    client: client ? titleCase(client) : "Client",
    project: project ? titleCase(project) : "Main project",
    rate,
  };
}

export function buildPlanFromPrompt(prompt: string): DraftPlan {
  const { client, project, rate } = parsePrompt(prompt);
  return {
    client,
    rate,
    project,
    tags: TAGS,
    entries: [
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
        title: `${project} — first pass`,
        project,
        client,
        duration: "1h 30m",
        start: "10:00 AM",
        end: "11:30 AM",
        tags: ["Deep work"],
        billable: true,
        color: "bg-timer/10 text-timer",
      },
      {
        id: "gen-3",
        title: "Review & revisions",
        project,
        client,
        duration: "45m",
        start: "1:00 PM",
        end: "1:45 PM",
        tags: ["Revisions"],
        billable: true,
        color: "bg-timer/10 text-timer",
      },
      {
        id: "gen-4",
        title: "Weekly admin",
        project: "Admin",
        client: "—",
        duration: "20m",
        start: "4:00 PM",
        end: "4:20 PM",
        tags: ["Admin"],
        billable: false,
        color: "bg-muted text-muted-foreground",
      },
    ],
  };
}
