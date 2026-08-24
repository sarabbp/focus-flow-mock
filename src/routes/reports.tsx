import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Focus" },
      { name: "description", content: "Analyze your productivity and time reports." },
      { property: "og:title", content: "Reports — Focus" },
      { property: "og:description", content: "Analyze your productivity and time reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Insights and summaries coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}
