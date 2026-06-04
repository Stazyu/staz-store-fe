"use client";

import React, { useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  FiDownload, FiRefreshCw, FiTrendingUp, FiShoppingCart,
  FiActivity, FiCheckCircle, FiClock, FiXCircle, FiZap,
  FiGrid, FiPackage, FiLoader,
} from "react-icons/fi";
import { DashboardSummary } from "./DashboardSummary";
import { useAdminDashboardQuery } from "@/hooks/useAdminDashboardQuery";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

const formatPercent = (val: number) =>
  `${(val ?? 0).toFixed(2).replace(/\.00$/, "")}%`;

const mapStatusLabel = (status: string) => {
  const norm = (status || "").toUpperCase();
  if (norm === "SUCCESS") return "Berhasil";
  if (norm === "PENDING" || norm === "PROCESSING") return "Pending";
  if (norm === "FAILED") return "Gagal";
  if (norm === "REFUNDED") return "Refund";
  if (norm === "CANCELED" || norm === "CANCELLED") return "Dibatalkan";
  return status || "Unknown";
};

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
              ? formatCurrency(p.value)
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

/* ─── Error & Skeleton States ────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gray-800/80 border border-gray-700 h-[280px]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-800/50 border border-gray-700 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[415px] bg-gray-800/50 border border-gray-700 rounded-2xl" />
        <div className="h-[415px] bg-gray-800/50 border border-gray-700 rounded-2xl" />
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[500px] border border-red-500/20 bg-red-500/5 rounded-2xl p-6 gap-4">
      <FiXCircle className="w-12 h-12 text-red-500" />
      <p className="text-base text-gray-800 dark:text-gray-200 font-semibold">Gagal memuat dashboard</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm text-center">{message}</p>
      <Button onClick={onRetry} className="mt-2 bg-red-600 hover:bg-red-500 text-white flex items-center gap-2">
        <FiRefreshCw className="w-4 h-4" />
        Muat Ulang
      </Button>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function DashboardMain() {
  const { theme } = useTheme();
  const [activeChart, setActiveChart] = useState<"revenue" | "transactions">("revenue");
  const [period, setPeriod] = useState<string>("month");
  const isDark = theme === "dark";

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isPlaceholderData
  } = useAdminDashboardQuery(period);

  const gridStroke = isDark ? "#ffffff08" : "#00000008";
  const axisStroke = isDark ? "#4b5563" : "#9ca3af";

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <DashboardError message={error?.message || "Terjadi kesalahan"} onRetry={() => refetch()} />;

  const summary = dashboardData?.summary || {
    totalRevenueToday: 0,
    totalTransactionsToday: 0,
    averageTransactionToday: 0,
    successRateToday: 0,
    totalProfitToday: 0,
    revenueGrowthPercent: 0,
    transactionGrowthPercent: 0,
    averageTransactionGrowthPercent: 0,
    successRateGrowthPercent: 0,
    profitGrowthPercent: 0,
    totalProducts: 0,
    activeUsers: 0,
    totalCategories: 0,
  };

  const revenueTrend = dashboardData?.revenueTrend || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const categoryDistribution = dashboardData?.categoryDistribution || [];
  const transactionStatus = dashboardData?.transactionStatus || [];

  const totalCategoryTransactions = categoryDistribution.reduce((s, c) => s + (c.totalTransactions || 0), 0);
  const totalStatusTransactions = transactionStatus.reduce((s, c) => s + (c.value || 0), 0);
  const hasStatusData = totalStatusTransactions > 0;

  const handleExport = () => {
    if (!dashboardData) return;
    const jsonString = JSON.stringify(dashboardData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-8">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl p-8">
        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-indigo-950 to-violet-950" />
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
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Analitik Live</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
              Dashboard
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent ml-3">
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
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : "transition-transform duration-500"}`} />
              Segarkan
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white text-sm font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <FiDownload className="w-4 h-4" />
              Ekspor
            </button>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="relative mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          {[
            { label: "Total Produk", value: summary.totalProducts || 0, icon: FiPackage, color: "text-cyan-400" },
            { label: "Pengguna Aktif", value: summary.activeUsers || 0, icon: FiZap, color: "text-violet-400" },
            { label: "Kategori", value: summary.totalCategories || 0, icon: FiGrid, color: "text-amber-400" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <div>
                <div className="text-white font-bold text-lg leading-none">
                  {typeof m.value === "number" ? m.value.toLocaleString("id-ID") : m.value}
                </div>
                <div className="text-blue-200/50 text-xs mt-0.5">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <DashboardSummary summary={summary} />

      {/* ── Main Chart + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue / Transaction chart */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <SectionHeader icon={FiTrendingUp} title="Tren Pendapatan" sub="Performa tren waktu" color="bg-blue-500/15 text-blue-500" />
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
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={320} minWidth={0} initialDimension={{ width: 100, height: 100 }}>
                <AreaChart data={revenueTrend} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
                    tickFormatter={(v) => {
                      try {
                        return new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                      } catch {
                        return v;
                      }
                    }}
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
            ) : (
              <div className="flex flex-col items-center justify-center h-[320px] gap-2 border border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                <FiTrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">Belum ada data tren</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <SectionHeader icon={FiShoppingCart} title="Aktivitas Terkini" color="bg-violet-500/15 text-violet-500" />
            <LiveDot />
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[340px]">
            {recentActivities.length > 0 ? (
              recentActivities.map((trx) => (
                <div key={trx.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className={`shrink-0 p-2 rounded-lg mt-0.5 ${trx.status?.toUpperCase() === "SUCCESS" ? "bg-emerald-500/15 text-emerald-500" :
                    trx.status?.toUpperCase() === "PENDING" || trx.status?.toUpperCase() === "PROCESSING" ? "bg-amber-500/15 text-amber-500" :
                      "bg-red-500/15 text-red-500"
                    }`}>
                    {trx.status?.toUpperCase() === "SUCCESS" && <FiCheckCircle className="w-4 h-4" />}
                    {(trx.status?.toUpperCase() === "PENDING" || trx.status?.toUpperCase() === "PROCESSING") && <FiClock className="w-4 h-4" />}
                    {["FAILED", "CANCELED", "REFUNDED"].includes(trx.status?.toUpperCase() || "") && <FiXCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{trx.userName || "Guest"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{trx.metadata?.productName || trx.description || "Transaksi"}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-cyan-500">{formatCurrency(trx.amount || 0)}</span>
                      {trx.createdAt && (
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(trx.createdAt), { addSuffix: true, locale: idLocale })}
                        </span>
                      )}
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
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <SectionHeader
              icon={FiGrid}
              title="Distribusi Kategori"
              sub={`Total ${totalCategoryTransactions.toLocaleString("id-ID")} transaksi - ${period === 'day' ? 'Hari Ini' : period === 'week' ? '7 Hari Terakhir' : '30 Hari Terakhir'}`}
              color="bg-emerald-500/15 text-emerald-500"
            />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[130px] h-9 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-6 space-y-7 relative">
            {/* Localized Loading Overlay */}
            {isPlaceholderData && (
              <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
                <div className="flex flex-col items-center gap-2">
                  <FiLoader className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Memperbarui...</p>
                </div>
              </div>
            )}

            {categoryDistribution.length > 0 ? (
              categoryDistribution.map((cat, idx) => {
                const defaultColors = ["#38bdf8", "#34d399", "#c084fc", "#fb923c", "#f472b6", "#a78bfa"];
                const color = defaultColors[idx % defaultColors.length];
                const count = cat.totalTransactions || 0;
                const pct = cat.percentage ?? 0;
                return (
                  <div key={cat.categoryName || idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
                        <div>
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{cat.categoryName}</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(cat.totalRevenue || 0)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-lg text-gray-900 dark:text-white leading-none">{count}</div>
                        <div className="text-xs text-gray-400">{pct.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="relative h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}60` }}
                      />
                    </div>

                    {cat.brands && cat.brands.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pl-6">
                        {cat.brands.map((brand, bIdx) => (
                          <div key={brand.name || bIdx} className="rounded-lg p-2 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <p className="text-xs text-gray-400 truncate">{brand.name}</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{brand.totalTransactions || 0}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] gap-2">
                <FiGrid className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">Tidak ada distribusi kategori</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Status Bar Chart */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 bg-white dark:bg-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <SectionHeader icon={FiActivity} title="Status Transaksi" sub={`Total ${totalStatusTransactions.toLocaleString("id-ID")} transaksi`} color="bg-orange-500/15 text-orange-500" />
          </div>
          <div className="p-6">
            {hasStatusData ? (
              <>
                <ResponsiveContainer width="100%" height={240} minWidth={0} initialDimension={{ width: 100, height: 100 }}>
                  <BarChart data={transactionStatus} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      {transactionStatus.map((s, idx) => (
                        <linearGradient key={s.name || idx} id={`grad-${s.name || idx}`} x1="0" y1="0" x2="0" y2="1">
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
                      {transactionStatus.map((entry, idx) => (
                        <Cell key={entry.name || idx} fill={`url(#grad-${entry.name || idx})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {transactionStatus.map((s, idx) => {
                    const pct = totalStatusTransactions > 0 ? ((s.value || 0) / totalStatusTransactions) * 100 : 0;
                    return (
                      <div
                        key={s.name || idx}
                        className="p-4 rounded-xl border transition-all hover:scale-[1.03] cursor-default"
                        style={{ borderColor: `${s.color}30`, background: `${s.color}10` }}
                      >
                        <div className="text-2xl font-black leading-none" style={{ color: s.color }}>{s.value || 0}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.name}</div>
                        <div className="text-xs font-semibold mt-1" style={{ color: s.color }}>
                          {pct.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-gray-200 dark:border-white/5 rounded-xl gap-2">
                <FiActivity className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400">Tidak ada data status</p>
              </div>
            )}
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
