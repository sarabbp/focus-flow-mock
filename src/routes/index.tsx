import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { TimerCard } from "@/components/timer";
import { RecentEntries } from "@/components/recent-entries";
import { Sidebar } from "@/components/sidebar";

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

function Dashboard() {
  const [activeTimer, setActiveTimer] = useState<string | null>("explore-toggl-focus");

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
            <TimerCard activeTimer={activeTimer} onTimerToggle={setActiveTimer} />
            <RecentEntries />
          </div>
        </div>
      </main>
    </div>
  );
}
