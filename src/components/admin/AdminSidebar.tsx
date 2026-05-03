"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FiHome, FiBarChart2, FiUsers, FiBox, FiFileText, FiSettings, FiLayers, FiTag, FiDollarSign } from "react-icons/fi";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FiHome },
  { name: "Category", href: "/admin/category", icon: FiLayers },
  { name: "Brands", href: "/admin/brands", icon: FiTag },
  { name: "Types", href: "/admin/types", icon: FiLayers },
  { name: "Users", href: "/admin/customers", icon: FiUsers },
  { name: "Products", href: "/admin/products", icon: FiBox },
  { name: "Top Ups", href: "/admin/topups", icon: FiDollarSign },
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: FiBarChart2,
  },
  { name: "Reports", href: "/admin/reports", icon: FiFileText },
  { name: "Settings", href: "/admin/settings", icon: FiSettings },
];

function NavItem({ item, pathname }: { item: typeof navItems[0], pathname: string | null }) {
  const isActive = pathname?.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-linear-to-r hover:from-blue-50 hover:to-sky-50 hover:text-blue-700 dark:hover:from-blue-900/20 dark:hover:to-sky-900/20 dark:hover:text-blue-300 transition-all duration-200 font-medium group",
        isActive && "bg-linear-to-r from-blue-100 to-sky-100 text-blue-700 dark:from-blue-900/30 dark:to-sky-900/30 dark:text-blue-300 shadow-sm"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg transition-all duration-200",
        isActive
          ? "bg-linear-to-br from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/25"
          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
      )}>
        <item.icon className="w-4 h-4" />
      </div>
      <span>{item.name}</span>
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/20 dark:shadow-gray-900/30">
      {/* Logo Section with Blue Gradient */}
      <div className="relative flex items-center h-20 px-6 border-b border-gray-100 dark:border-gray-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/5 via-sky-500/5 to-cyan-500/5"></div>
        <div className="relative flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-blue-600 to-sky-500 rounded-xl shadow-lg shadow-blue-500/30">
            <FiBox className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-linear-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              Staz Store
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Menu Utama</p>
        </div>
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800/50">
        <div className="p-3 bg-linear-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Staz Store Admin</p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
