import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Focus" },
      { name: "description", content: "Manage your tasks and to-dos." },
      { property: "og:title", content: "Tasks — Focus" },
      { property: "og:description", content: "Manage your tasks and to-dos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your task list will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}
