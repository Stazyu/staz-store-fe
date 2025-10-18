'use client';

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen transition-colors bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Navbar />
            <main className="min-h-screen pt-24">
                <div className="container mx-auto px-4">
                    {children}
                </div>
            </main>
            <Footer />
            <Toaster position="top-center" />
        </div>
    );
}
