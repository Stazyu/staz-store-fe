"use client";

import { usePathname } from "next/navigation";
import { Box } from "lucide-react";
import { adminSidebarGroups } from "@/config/admin-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarItem from "./SidebarItem";

// ─── Badge data type ──────────────────────────────────────────────────────────
// Injected via props or fetched from an API / context.
// Keys match BADGE_KEYS from the config.
export type BadgeCounts = Record<string, number>;

interface AdminSidebarProps {
  /** Optional badge counts to display on menu items */
  badges?: BadgeCounts;
}

/**
 * Determine whether a sidebar item should be marked active.
 * Matches exact path or any sub-path (e.g. /admin/orders/INV-001).
 */
function isItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminSidebar({ badges = {} }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-70 h-screen sticky top-0 bg-white dark:bg-[#090e1a] border-r border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
      {/* ─── Logo ────────────────────────────────────────────────────── */}
      <div className="flex items-center h-20 shrink-0 px-6 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/30">
            <Box className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-linear-to-r from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
              Staz Store
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* ─── Navigation (scrollable) ─────────────────────────────────── */}
      <ScrollArea className="flex-1">
        <nav className="px-3 py-4 space-y-1">
          {adminSidebarGroups.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              <p className="px-4 mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 first:mt-2">
                {group.label}
              </p>

              {/* Group items */}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    isActive={isItemActive(pathname, item.href)}
                    badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* ─── User Card / Footer ──────────────────────────────────────── */}
      {/* <div className="shrink-0 p-4 border-t border-slate-800">
        <div className="rounded-xl border border-blue-800/30 bg-linear-to-r from-blue-900/20 to-sky-900/20 p-3">
          <p className="text-xs font-medium text-blue-300">Staz Store Admin</p>
          <p className="text-xs text-blue-400/70">v1.0.0</p>
        </div>
      </div> */}
    </aside>
  );
}
