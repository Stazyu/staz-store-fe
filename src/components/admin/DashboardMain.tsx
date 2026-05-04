"use client";

import React, { useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  FiDownload, FiRefreshCw, FiTrendingUp, FiShoppingCart,
  FiActivity, FiCheckCircle, FiClock, FiXCircle, FiZap,
  FiGrid, FiPackage, FiLoader,
} from "react-icons/fi";
import { DashboardSummary, calculateTodaysSummary } from "./DashboardSummary";
import { fetchRecentTransactions } from "@/services/transaction.client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useTheme } from "next-themes";

/* ─── Mock Data ─────────────────────────────────────────────────────────── */
const mockTransactions = [
  { id: "1", date: new Date().toISOString(), status: "success" as const, total: 150000 },
  { id: "2", date: new Date().toISOString(), status: "success" as const, total: 250000 },
  { id: "3", date: new Date().toISOString(), status: "success" as const, total: 100000 },
  { id: "4", date: new Date().toISOString(), status: "pending" as const, total: 75000 },
  { id: "5", date: new Date(Date.now() - 86400000).toISOString(), status: "success" as const, total: 300000 },
];
const todaysSummary = calculateTodaysSummary(mockTransactions);

const dailyRevenue = [
  { date: "2025-06-07", revenue: 1200000, transactions: 45 },
  { date: "2025-06-08", revenue: 1500000, transactions: 52 },
  { date: "2025-06-09", revenue: 1300000, transactions: 48 },
  { date: "2025-06-10", revenue: 1700000, transactions: 61 },
  { date: "2025-06-11", revenue: 1100000, transactions: 42 },
  { date: "2025-06-12", revenue: 1600000, transactions: 58 },
  { date: "2025-06-13", revenue: 2100000, transactions: 72 },
];

const statusBreakdown = [
  { name: "Berhasil", value: 120, color: "#22d3ee" },
  { name: "Pending", value: 30, color: "#a78bfa" },
  { name: "Gagal", value: 10, color: "#f87171" },
];

const categoryTransactions = [
  {
    category: "Game", count: 180, revenue: 45000000, color: "#38bdf8",
    subcategories: [{ name: "Mobile Legends", count: 80 }, { name: "Free Fire", count: 60 }, { name: "PUBG Mobile", count: 40 }],
  },
  {
    category: "Pulsa", count: 90, revenue: 22500000, color: "#34d399",
    subcategories: [{ name: "Telkomsel", count: 50 }, { name: "XL", count: 25 }, { name: "Indosat", count: 15 }],
  },
  {
    category: "E-Money", count: 60, revenue: 15000000, color: "#c084fc",
    subcategories: [{ name: "OVO", count: 35 }, { name: "GoPay", count: 15 }, { name: "DANA", count: 10 }],
  },
];
const totalTransactions = categoryTransactions.reduce((s, c) => s + c.count, 0);

/* ─── Custom Tooltip ─────────────────────────────────────────────────────── */
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-sm">
      <p className="text-xs text-gray-400 mb-2">
        {new Date(label).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">
            {p.name === "revenue"
              ? `Rp ${Number(p.value).toLocaleString("id-ID")}`
              : `${p.value} transaksi`}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomBarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-sm">
      <p className="text-sm text-white font-semibold">{payload[0].payload.name}</p>
      <p className="text-xs text-gray-400">{payload[0].value} transaksi</p>
    </div>
  );
};

/* ─── Section Header ─────────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, sub, color }: { icon: any; title: string; sub?: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">{title}</h2>
        {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Status Indicator ───────────────────────────────────────────────────── */
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function DashboardMain() {
  const { theme } = useTheme();
  const [activeChart, setActiveChart] = useState<"revenue" | "transactions">("revenue");
  const isDark = theme === "dark";

  const { data: recentRes, isLoading: isLoadingRecent, refetch } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: () => fetchRecentTransactions(5),
  });
  const recentTransactions = recentRes?.data || [];

  const gridStroke = isDark ? "#ffffff08" : "#00000008";
  const axisStroke = isDark ? "#4b5563" : "#9ca3af";

  return (
    <div className="space-y-8 pb-8">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl p-8">
        {/* Base gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-violet-950" />
        {/* Animated mesh */}
        {/* <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div> */}
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <LiveDot />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Live Analytics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
              Dashboard
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent ml-3">
                Analytics
              </span>
            </h1>
            <p className="text-blue-200/70 mt-3 text-base">
              Pantau performa bisnis Anda secara real-time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white text-sm font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="relative mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          {[
            { label: "Total Produk", value: "1,204", icon: FiPackage, color: "text-cyan-400" },
            { label: "Pengguna Aktif", value: "3.4K", icon: FiZap, color: "text-violet-400" },
            { label: "Kategori", value: "12", icon: FiGrid, color: "text-amber-400" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <div>
                <div className="text-white font-bold text-lg leading-none">{m.value}</div>
                <div className="text-blue-200/50 text-xs mt-0.5">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <DashboardSummary today={todaysSummary.today} yesterday={todaysSummary.yesterday} />

      {/* ── Main Chart + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue / Transaction chart */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <SectionHeader icon={FiTrendingUp} title="Tren Pendapatan" sub="7 hari terakhir" color="bg-blue-500/15 text-blue-500" />
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {(["revenue", "transactions"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveChart(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${activeChart === tab
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                  >
                    {tab === "revenue" ? "Pendapatan" : "Transaksi"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dailyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillTrx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  stroke={axisStroke} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => activeChart === "revenue" ? `${(v / 1000000).toFixed(1)}jt` : `${v}`}
                  stroke={axisStroke} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                {activeChart === "revenue" ? (
                  <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2.5} fill="url(#fillRevenue)" dot={false} activeDot={{ r: 5, fill: "#38bdf8", stroke: "#fff", strokeWidth: 2 }} />
                ) : (
                  <Area type="monotone" dataKey="transactions" stroke="#a78bfa" strokeWidth={2.5} fill="url(#fillTrx)" dot={false} activeDot={{ r: 5, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <SectionHeader icon={FiShoppingCart} title="Aktivitas Terkini" color="bg-violet-500/15 text-violet-500" />
            <LiveDot />
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[340px]">
            {isLoadingRecent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-3">
                <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-400">Memuat aktivitas...</p>
              </div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((trx) => (
                <div key={trx.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className={`flex-shrink-0 p-2 rounded-lg mt-0.5 ${trx.status === "SUCCESS" ? "bg-emerald-500/15 text-emerald-500" :
                      trx.status === "PENDING" ? "bg-amber-500/15 text-amber-500" :
                        "bg-red-500/15 text-red-500"
                    }`}>
                    {trx.status === "SUCCESS" && <FiCheckCircle className="w-4 h-4" />}
                    {trx.status === "PENDING" && <FiClock className="w-4 h-4" />}
                    {trx.status === "FAILED" && <FiXCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{trx.userName || "Guest"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{trx.metadata?.productName || trx.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-cyan-500">Rp {trx.amount.toLocaleString("id-ID")}</span>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(trx.createdAt), { addSuffix: true, locale: idLocale })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                <FiActivity className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">Tidak ada aktivitas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Category + Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Distribution */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <SectionHeader icon={FiGrid} title="Distribusi Kategori" sub={`Total ${totalTransactions} transaksi`} color="bg-emerald-500/15 text-emerald-500" />
          </div>
          <div className="p-6 space-y-7">
            {categoryTransactions.map((cat) => {
              const pct = (cat.count / totalTransactions) * 100;
              return (
                <div key={cat.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}80` }} />
                      <div>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{cat.category}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rp {cat.revenue.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg text-gray-900 dark:text-white leading-none">{cat.count}</div>
                      <div className="text-xs text-gray-400">{pct.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Glow progress bar */}
                  <div className="relative h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}60` }}
                    />
                  </div>

                  {/* Subcategories */}
                  <div className="grid grid-cols-3 gap-2 pl-6">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.name} className="rounded-lg p-2 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <p className="text-xs text-gray-400 truncate">{sub.name}</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{sub.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction Status Bar Chart */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <SectionHeader icon={FiActivity} title="Status Transaksi" sub="Ringkasan pemrosesan" color="bg-orange-500/15 text-orange-500" />
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  {statusBreakdown.map((s) => (
                    <linearGradient key={s.name} id={`grad-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={s.color} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="0" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={`url(#grad-${entry.name})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Status summary tiles */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {statusBreakdown.map((s) => (
                <div
                  key={s.name}
                  className="p-4 rounded-xl border transition-all hover:scale-[1.03] cursor-default"
                  style={{ borderColor: `${s.color}30`, background: `${s.color}10` }}
                >
                  <div className="text-2xl font-black leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.name}</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: s.color }}>
                    {((s.value / statusBreakdown.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
        <LiveDot />
        <span>Data diperbarui otomatis setiap 30 detik</span>
      </div>
    </div>
  );
}
