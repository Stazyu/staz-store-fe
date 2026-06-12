import React from "react";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

import NotFound from "../not-found";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { isAdmin } from "@/lib/roles";
import { getSession } from "@/lib/auth-server"; // ← pakai shared helper

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Satu kali fetch saja. Jika ada Server Component lain di bawah
  // yang juga memanggil getSession(), React cache() akan meng-deduplikasi-nya.
  const sessionData = await getSession();

  if (!sessionData?.user) {
    redirect("/");
  }

  // Middleware sudah memblokir non-admin, tapi ini sebagai safety net.
  if (!isAdmin(sessionData.user.role)) {
    return (
      <div>
        <NotFound />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-[#090e1a] dark:via-[#090e1a] dark:to-[#090e1a]">
      <AdminSidebar />
      <main className="flex-1 min-h-screen p-4 md:p-8">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
