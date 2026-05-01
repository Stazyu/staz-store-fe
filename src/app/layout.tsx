import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
// import AuthSession from "@/components/providers/AuthSession";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Staz Store",
  description: "Tempat top up game dan pulsa terpercaya",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-gray-900">
        <ThemeProvider>
          <QueryProvider>
            {/* <AuthSession> */}
            {children}
            {/* </AuthSession> */}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
