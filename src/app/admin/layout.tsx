import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Toaster } from "react-hot-toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // If no session, redirect to home (middleware should handle this, but just in case)
  if (!session?.user) {
    redirect('/');
  }

  // If not admin, redirect to home (middleware should handle this, but just in case)
  if (session.user.role.toLowerCase() !== 'admin') {
    console.log(session.user.role.toLowerCase());
    redirect('/');
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 min-h-screen p-4 md:p-8">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
