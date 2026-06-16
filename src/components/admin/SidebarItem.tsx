"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SidebarItem as SidebarItemType } from "@/config/admin-sidebar";

interface SidebarItemProps {
  item: SidebarItemType;
  isActive: boolean;
  badge?: number;
}

export default function SidebarItem({ item, isActive, badge }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group",
        isActive
          ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white border border-transparent"
      )}
    >
      {/* Icon wrapper */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          isActive
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200"
        )}
      >
        <Icon className="size-4" />
      </div>

      {/* Title */}
      <span className="truncate">{item.title}</span>

      {/* Badge — only show when count > 0 */}
      {badge != null && badge > 0 && (
        <span className="ml-auto shrink-0 rounded-full bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-300">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
