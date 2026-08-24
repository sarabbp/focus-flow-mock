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

  // Rate can be written as "$60/hr", "60$/h", "60 USD per hour", "(85/hour)"...
  const rateRe =
    /(?:\bat\b|@|,)?\s*[($]*\s*(?:\$|usd|eur|€|£)?\s*(\d+(?:[.,]\d+)?)\s*(?:\$|usd|eur|€|£)?\s*(?:\/|\bper\b)?\s*(?:hr|hour|h)\b\)?/i;
  const match = text.match(rateRe);
  const rate = match?.[1]?.replace(",", ".") ?? "";

  // Remove the whole rate expression (including any "at"/"@"/parens) from the text
  // so the client name never carries the rate string.
  let work = (match ? text.replace(match[0], " ") : text).replace(/\s{2,}/g, " ").trim();
  work = work
    .replace(/\b(at|@|for)\s*$/i, "")
    .replace(/[.,;·\-–(]+$/, "")
    .trim();

  let client = "";
  let project = work;
  const forMatch = work.match(/\bfor\b\s+(.+)$/i);
  if (forMatch) {
    client = forMatch[1]!.trim();
    project = work.slice(0, forMatch.index).trim();
  }

  project = project.replace(/^(i'?m\s+)?(working on|doing)\s+/i, "").trim();

  // "Indie Gamers at $60/hr" — a bare name with a rate is a client, not a project.
  if (!client && rate && !/\b\w+ing\b/i.test(project) && project.split(/\s+/).length <= 3) {
    client = project;
    project = "";
  }

  return {
    client: client ? titleCase(client) : "Client",
    project: project ? titleCase(project) : "Main project",
    rate,
  };
}

export function buildPlanFromPrompt(prompt: string): DraftPlan {
  const { client, project, rate } = parsePrompt(prompt);
  const hourlyRate = rate ? Number(rate) : undefined;
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
        hourlyRate,
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
        hourlyRate,
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
        hourlyRate,
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
