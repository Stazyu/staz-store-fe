"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FiHome, FiBarChart2, FiUsers, FiBox, FiFileText, FiSettings, FiLayers, FiTag, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FiHome },
  { name: "Category", href: "/admin/category", icon: FiLayers },
  { name: "Brands", href: "/admin/brands", icon: FiTag },
  { name: "Customer", href: "/admin/customers", icon: FiUsers },
  { name: "Products", href: "/admin/products", icon: FiBox },
  { 
    name: "Transactions", 
    href: "/admin/transactions", 
    icon: FiBarChart2,
    submenu: [
      { name: "Pulsa & PPOB", href: "/admin/transactions/pulsa-ppob" },
      { name: "Game & Streaming", href: "/admin/transactions/game-streaming" },
      { name: "Sosial Media", href: "/admin/transactions/sosial-media" },
    ]
  },
  { name: "Reports", href: "/admin/reports", icon: FiFileText },
  { name: "Settings", href: "/admin/settings", icon: FiSettings },
];

function NavItem({ item, pathname }: { item: typeof navItems[0], pathname: string | null }) {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = pathname?.startsWith(item.href);
  const [isOpen, setIsOpen] = useState(isActive);

  if (hasSubmenu) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 transition-all font-medium",
            isActive && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {item.name}
          </div>
          {isOpen ? (
            <FiChevronDown className="w-4 h-4" />
          ) : (
            <FiChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {isOpen && (
          <div className="ml-8 mt-1 space-y-1">
            {item.submenu?.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={cn(
                  "block px-3 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-800",
                  pathname === subItem.href && "bg-blue-50 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                )}
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900 transition-all font-medium",
        isActive && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      )}
    >
      <item.icon className="w-5 h-5" />
      {item.name}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center h-16 px-6 font-bold text-lg text-blue-600 tracking-wide border-b border-gray-100 dark:border-gray-800">
        Staz Store Admin
      </div>
      <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
