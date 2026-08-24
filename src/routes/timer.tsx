import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "Timer — Focus" },
      { name: "description", content: "Start and manage your focus timer." },
      { property: "og:title", content: "Timer — Focus" },
      { property: "og:description", content: "Start and manage your focus timer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimerPage,
});

function TimerPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Timer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a task to start tracking your focus time.
          </p>
        </div>
      </main>
    </div>
  );
}
