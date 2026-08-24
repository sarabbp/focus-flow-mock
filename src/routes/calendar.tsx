import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Focus" },
      { name: "description", content: "Review your tracked time on a calendar." },
      { property: "og:title", content: "Calendar — Focus" },
      { property: "og:description", content: "Review your tracked time on a calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View your scheduled time blocks.
          </p>
        </div>
      </main>
    </div>
  );
}
