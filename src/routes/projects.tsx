import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronsUpDown,
  Folder,
  Group,
  ListFilter,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { loadState, type DraftPlan } from "@/lib/onboarding-storage";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Focus" },
      { name: "description", content: "Browse projects with clients, rates, dates and time status." },
      { property: "og:title", content: "Projects — Focus" },
      {
        property: "og:description",
        content: "Browse projects with clients, rates, dates and time status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

interface ProjectRow {
  id: string;
  name: string;
  client: string;
  rate: string;
  currency: string;
  dates: string;
  timeStatus: string;
  fixedFee?: string;
}

const columns = [
  { label: "Project", sortable: true, className: "w-[34%]" },
  { label: "Client", sortable: true, className: "w-[14%]" },
  { label: "Billable", sortable: true, className: "w-[10%]" },
  { label: "Rate", sortable: false, className: "w-[8%] text-right" },
  { label: "Dates", sortable: true, className: "w-[12%]" },
  { label: "Time status", sortable: false, className: "w-[12%]" },
  { label: "Fixed fee", sortable: false, className: "w-[10%] text-right" },
];

function toRows(plans: DraftPlan[]): ProjectRow[] {
  return plans
    .filter((plan) => !!plan.project)
    .map((plan, index) => {
      const totalMinutes = plan.entries.reduce((sum, entry) => {
        const h = /(\d+)\s*h/.exec(entry.duration)?.[1];
        const m = /(\d+)\s*m/.exec(entry.duration)?.[1];
        return sum + (h ? Number(h) * 60 : 0) + (m ? Number(m) : 0);
      }, 0);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return {
        id: `plan-project-${index}`,
        name: plan.project,
        client: plan.client || "No client",
        rate: plan.rate.trim() || "—",
        currency: "USD",
        dates: "Aug 24 - 28",
        timeStatus: totalMinutes ? `${hours ? `${hours}h ` : ""}${mins}m` : "No time tracked",
      };
    });
}

function ProjectsPage() {
  const [rows, setRows] = useState<ProjectRow[]>([]);

  useEffect(() => {
    setRows(toRows(loadState()?.plans ?? []));
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-panel">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <div className="flex items-center justify-between px-6 pt-5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Projects</h1>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New project
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pt-4">
          <div className="flex items-center gap-2">
            <Chip icon={ListFilter} label="Active" trailing />
            <Chip icon={SlidersHorizontal} label="Filters" active />
            <Chip icon={Group} label="Group by" />
            <Chip icon={ChevronsUpDown} label="Sort by" />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button type="button" aria-label="Search" className="hover:text-foreground">
              <Search className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Customize columns" className="hover:text-foreground">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Settings" className="hover:text-foreground">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Filter
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-auto px-6 pb-8">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="w-8 py-2 pl-1 text-left">
                  <input type="checkbox" aria-label="Select all projects" className="accent-primary" />
                </th>
                {columns.map((col) => (
                  <th key={col.label} className={`py-2 pr-4 font-semibold ${col.className}`}>
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && <ChevronsUpDown className="h-3 w-3 opacity-60" />}
                    </span>
                  </th>
                ))}
                <th className="py-2 pr-2 text-left font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Tags <Star className="h-3 w-3 fill-timer-muted text-timer-muted" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 hover:bg-panel">
                  <td className="py-3 pl-1">
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.name}`}
                      className="accent-primary"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2 font-medium text-primary">
                      <Folder className="h-4 w-4" />
                      {row.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-foreground">{row.client}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex h-6 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      $
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-foreground">
                    {row.rate} <span className="text-muted-foreground">{row.currency}</span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.dates}</td>
                  <td className="py-3 pr-4 text-foreground">{row.timeStatus}</td>
                  <td className="py-3 pr-4 text-right text-muted-foreground">
                    {row.fixedFee ?? ""}
                  </td>
                  <td className="py-3 pr-2" />
                </tr>
              ))}
              <tr>
                <td colSpan={9} className="py-3 pl-1">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add project
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              No projects yet — generate your workspace from the dashboard to see it here.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  active,
  trailing,
}: {
  icon: typeof Plus;
  label: string;
  active?: boolean;
  trailing?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-foreground/30 bg-background text-foreground shadow-sm"
          : "border-border bg-background text-foreground hover:bg-panel"
      }`}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
      {trailing && <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
    </button>
  );
}
