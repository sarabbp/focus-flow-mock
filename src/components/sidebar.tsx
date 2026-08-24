import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  ListChecks,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronDown,
  Activity,
  Folder,
  GanttChartSquare,
  Users,
  CheckCircle2,
  Palmtree,
  Star,
  PanelLeftClose,
  Bell,
  Send,
  HelpCircle,
  Download,
  Zap,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { requestReopenOnboarding } from "@/lib/onboarding-storage";

type NavItem = {
  title: string;
  icon: typeof Clock;
  href?: string;
  meta?: string;
  starred?: boolean;
};

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Track",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/" },
      { title: "Timer", icon: Clock, href: "/timer", meta: "5m 43s" },
      { title: "My activity", icon: Activity },
    ],
  },
  {
    label: "Analyze",
    items: [{ title: "Reports", icon: BarChart3, href: "/reports" }],
  },
  {
    label: "Plan",
    items: [
      { title: "Projects", icon: Folder },
      { title: "Tasks", icon: ListChecks, href: "/tasks" },
      { title: "Timeline", icon: GanttChartSquare, starred: true },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Members", icon: Users },
      { title: "Approvals", icon: CheckCircle2, starred: true },
      { title: "Time off", icon: Palmtree, starred: true },
    ],
  },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const rerunSetup = () => {
    requestReopenOnboarding();
    if (pathname !== "/") void navigate({ to: "/" });
  };

  return (
    <div className="flex h-full flex-shrink-0">
      {/* Icon rail */}
      <div className="flex w-12 flex-col items-center justify-between border-r border-sidebar-border bg-sidebar py-3">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-8 flex-col items-center justify-center rounded-full bg-timer text-timer-foreground">
            <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold text-sidebar-muted">2.0</span>
        </div>
        <div className="flex flex-col items-center gap-4 text-sidebar-muted">
          <button type="button" aria-label="Collapse sidebar" className="hover:text-sidebar-foreground">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 text-sidebar-muted">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-hover text-[10px] font-semibold text-sidebar-foreground">
            SA
          </div>
          <button type="button" aria-label="Notifications" className="hover:text-sidebar-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Feedback" className="hover:text-sidebar-foreground">
            <Send className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Help" className="hover:text-sidebar-foreground">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main sidebar */}
      <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar">
        <button
          type="button"
          className="mx-2 mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-hover"
        >
          <span className="truncate text-sm font-semibold text-sidebar-active-foreground">
            Sara&apos;s organizat...
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-sidebar-muted" />
        </button>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-4">
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = !!item.href && pathname === item.href;
                const content = (
                  <>
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-timer" : "text-sidebar-muted",
                      )}
                      strokeWidth={2}
                    />
                    <span className="truncate">{item.title}</span>
                    {item.meta && (
                      <span className="ml-auto text-xs font-medium text-timer">{item.meta}</span>
                    )}
                    {item.starred && (
                      <Star className="ml-auto h-3.5 w-3.5 fill-timer-muted text-timer-muted" />
                    )}
                  </>
                );

                const classes = cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-active text-sidebar-active-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover",
                );

                return item.href ? (
                  <Link key={item.title} to={item.href} className={classes}>
                    {content}
                  </Link>
                ) : (
                  <button key={item.title} type="button" className={classes}>
                    {content}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-0.5 border-t border-sidebar-border px-2 py-3">
          <button
            type="button"
            onClick={rerunSetup}
            className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-hover"
          >
            <Sparkles className="h-4 w-4 text-timer" />
            Re-run setup
          </button>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-sidebar-active-foreground transition-colors hover:bg-sidebar-hover"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-timer text-timer-foreground">
              <Zap className="h-3 w-3" strokeWidth={2.5} />
            </span>
            Upgrade
            <span className="ml-auto rounded-full bg-sidebar-active px-2 py-0.5 text-[10px] font-semibold uppercase text-sidebar-active-foreground">
              21 days
            </span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-hover"
          >
            <Download className="h-4 w-4 text-sidebar-muted" />
            Download apps
          </button>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-hover"
          >
            <Settings className="h-4 w-4 text-sidebar-muted" />
            Admin settings
          </button>
        </div>
      </aside>
    </div>
  );
}
