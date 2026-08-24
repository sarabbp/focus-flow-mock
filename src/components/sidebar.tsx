import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Timer", icon: Clock, href: "/timer" },
  { title: "Tasks", icon: CheckCircle2, href: "/tasks" },
  { title: "Calendar", icon: CalendarDays, href: "/calendar" },
  { title: "Reports", icon: BarChart3, href: "/reports" },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-timer text-timer-foreground">
          <Clock className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          Focus
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-active hover:text-sidebar-active-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-4.5 w-4.5 transition-colors",
                  isActive ? "text-timer" : "text-sidebar-muted",
                )}
                strokeWidth={2}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-active hover:text-sidebar-active-foreground"
        >
          <Settings className="h-4.5 w-4.5 text-sidebar-muted" strokeWidth={2} />
          Settings
        </button>
      </div>
    </aside>
  );
}

