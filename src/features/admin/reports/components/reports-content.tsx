"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FiDownload,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
  FiPieChart,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
  FiActivity,
  FiLoader,
  FiXCircle,
  FiRefreshCw
} from "react-icons/fi";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { useTheme } from "next-themes";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAdminReportsQuery } from "@/hooks/useAdminReportsQuery";
import TransactionsTable from "./transactions-table";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const formattedDate = label
    ? format(new Date(String(label)), 'EEEE, d MMMM yyyy', { locale: id })
    : '';

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-sm">
      <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">{formattedDate}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-sm mt-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-600 dark:text-gray-300">
            {p.name}: <span className="font-semibold text-slate-900 dark:text-white">{p.value.toLocaleString("id-ID")} transaksi</span>
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-sm">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{data.name}</p>
      <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
        Transaksi: <span className="font-bold text-slate-900 dark:text-white">{data.transactions ?? 0}</span>
      </p>
      {data.revenue !== undefined && (
        <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
          Revenue: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(data.revenue)}</span>
        </p>
      )}
      {data.profit !== undefined && (
        <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
          Profit: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(data.profit)}</span>
        </p>
      )}
      <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
        Porsi: <span className="font-bold text-slate-900 dark:text-white">{data.value}%</span>
      </p>
    </div>
  );
};

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton header */}
      <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      {/* Skeleton picker */}
      <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      {/* Skeleton grid cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
      {/* Skeleton tabs */}
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md w-96" />
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
    </div>
  );
}

function ReportsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-125 border border-rose-200 dark:border-red-500/20 bg-rose-50/50 dark:bg-red-500/5 rounded-2xl p-6 gap-4">
      <FiXCircle className="w-12 h-12 text-red-500" />
      <p className="text-base text-gray-800 dark:text-gray-200 font-semibold">Gagal memuat laporan</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm text-center">{message}</p>
      <Button onClick={onRetry} className="mt-2 bg-red-600 hover:bg-red-500 text-white flex items-center gap-2">
        <FiRefreshCw className="w-4 h-4" />
        Muat Ulang
      </Button>
    </div>
  );
}

export default function ReportsPageContent() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<"overview" | "dailySales" | "topProducts" | "paymentMethods">("overview");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Format dates for backend query string parameters
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

  const { data: reportsData, isLoading, isError, error, refetch } = useAdminReportsQuery(startDateStr, endDateStr);

  const summary = reportsData?.summary || {
    totalRevenue: 0,
    totalProfit: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    newCustomers: 0,
    revenueGrowth: 0,
    profitGrowth: 0,
    transactionGrowth: 0,
    aovGrowth: 0,
    customerGrowth: 0,
  };

  const dailySales = reportsData?.dailySales || [];
  const categoryDistribution = reportsData?.categoryDistribution || [];
  const paymentMethods = reportsData?.paymentMethods || [];
  const topProducts = reportsData?.topProducts || [];

  // CSV helpers
  const toCSV = (rows: Array<Record<string, unknown>>): string => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const escape = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      const escaped = s.replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    };
    const lines = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))];
    return lines.join("\n");
  };

  const exportData = useMemo(() => ({
    overview: [
      { metric: "Total Pendapatan", value: summary.totalRevenue },
      { metric: "Total Profit", value: summary.totalProfit },
      { metric: "Total Transaksi", value: summary.totalTransactions },
      { metric: "Rata-rata Nilai Transaksi", value: summary.averageOrderValue },
      { metric: "Pelanggan Baru", value: summary.newCustomers },
    ],
    dailySales: dailySales.map(ds => ({ date: ds.date, revenue: ds.revenue, profit: ds.profit, success: ds.success, failed: ds.failed, total: ds.total })),
    topProducts: topProducts.map(p => ({ id: p.id, name: p.name, brandName: p.brandName, categoryName: p.categoryName, sales: p.sales, revenue: p.revenue, profit: p.profit })),
    paymentMethods: paymentMethods.map(pm => ({ name: pm.name, percentage: pm.value, transactions: pm.transactions, revenue: pm.revenue })),
  }), [summary, dailySales, topProducts, paymentMethods]);

  const handleDownloadCSV = () => {
    const map: Record<string, Array<Record<string, unknown>>> = exportData as unknown as Record<string, Array<Record<string, unknown>>>;
    const target = exportTarget === "overview" && activeTab !== "overview" ? (activeTab === "sales" ? "dailySales" : activeTab === "products" ? "topProducts" : activeTab === "payments" ? "paymentMethods" : "overview") : exportTarget;
    const rows = map[target] ?? [];
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `laporan-${target}-${new Date().toISOString().split("T")[0]}.csv`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  if (isLoading) return <ReportsSkeleton />;
  if (isError) return <ReportsError message={error?.message || "Terjadi kesalahan"} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Modern Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 dark:border-blue-500/10 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#081e3d_45%,#071a33_100%)] shadow-[0_20px_80px_rgba(37,99,235,0.08)] p-8">
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Laporan Toko</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              Laporan
              <span className="bg-linear-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent ml-3">
                & Analitik
              </span>
            </h1>
            <p className="text-slate-600 dark:text-blue-200/70 mt-3 text-base">
              Pantau kinerja dan aktivitas toko Anda secara menyeluruh
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => setExportOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white text-sm font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 border-0"
                >
                  <FiDownload className="h-4 w-4" />
                  Ekspor Laporan
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-white">Ekspor Laporan</DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-400">Pilih dataset yang ingin diekspor sebagai CSV.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Jenis Laporan</label>
                  <Select
                    value={exportTarget}
                    onValueChange={(value) => setExportTarget(value as typeof exportTarget)}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-gray-900 p-2.5 h-auto text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Pilih jenis laporan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <SelectItem value="overview">Ringkasan (metrik utama)</SelectItem>
                      <SelectItem value="dailySales">Trend Penjualan (harian)</SelectItem>
                      <SelectItem value="topProducts">Produk Terlaris</SelectItem>
                      <SelectItem value="paymentMethods">Metode Pembayaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button onClick={handleDownloadCSV} className="gap-2 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white border-0 rounded-xl px-4 py-2">
                    <FiDownload className="h-4 w-4" />
                    Download CSV
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Date Range Picker (Sticky) */}
      <div className="sticky top-4 z-20 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md shadow-xs p-4 md:p-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Rentang Waktu</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih rentang waktu untuk memfilter laporan</p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Pendapatan */}
        <div className="relative group overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-slate-950/40 dark:bg-linear-to-br dark:from-blue-500/10 dark:to-cyan-500/5 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1 cursor-default">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-500 to-cyan-400 opacity-60" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total Pendapatan</p>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{formatCurrency(summary.totalRevenue)}</div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Estimasi total omset kotor</p>
            </div>
            <div className="shrink-0 p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 ml-4">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${summary.revenueGrowth >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
              {summary.revenueGrowth >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {Math.abs(summary.revenueGrowth)}%
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">vs periode sebelumnya</span>
          </div>
        </div>

        {/* Card 2: Total Profit */}
        <div className="relative group overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/30 dark:bg-slate-950/40 dark:bg-linear-to-br dark:from-rose-500/10 dark:to-pink-500/5 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:shadow-rose-500/25 hover:-translate-y-1 cursor-default">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-linear-to-br from-rose-500 to-pink-400 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-rose-500 to-pink-400 opacity-60" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total Profit</p>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{formatCurrency(summary.totalProfit)}</div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Estimasi keuntungan bersih</p>
            </div>
            <div className="shrink-0 p-3 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 ml-4">
              <FiTrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${summary.profitGrowth >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
              {summary.profitGrowth >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {Math.abs(summary.profitGrowth)}%
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">vs periode sebelumnya</span>
          </div>
        </div>

        {/* Card 3: Total Transaksi */}
        <div className="relative group overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-slate-950/40 dark:bg-linear-to-br dark:from-emerald-500/10 dark:to-teal-500/5 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-1 cursor-default">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-linear-to-br from-emerald-500 to-teal-400 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-500 to-teal-400 opacity-60" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total Transaksi</p>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{summary.totalTransactions.toLocaleString("id-ID")}</div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total pesanan diproses</p>
            </div>
            <div className="shrink-0 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ml-4">
              <FiShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${summary.transactionGrowth >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
              {summary.transactionGrowth >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {Math.abs(summary.transactionGrowth)}%
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">vs periode sebelumnya</span>
          </div>
        </div>

        {/* Card 4: Rata-rata Nilai Transaksi */}
        <div className="relative group overflow-hidden rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/30 dark:bg-slate-950/40 dark:bg-linear-to-br dark:from-purple-500/10 dark:to-indigo-500/5 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-1 cursor-default">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-linear-to-br from-purple-500 to-indigo-400 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-indigo-400 opacity-60" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Rata-rata Transaksi</p>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{formatCurrency(summary.averageOrderValue)}</div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Rata-rata nilai per order sukses</p>
            </div>
            <div className="shrink-0 p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 ml-4">
              <FiTrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${summary.aovGrowth >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
              {summary.aovGrowth >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {Math.abs(summary.aovGrowth)}%
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">vs periode sebelumnya</span>
          </div>
        </div>

        {/* Card 5: Pelanggan Baru */}
        <div className="relative group overflow-hidden rounded-2xl border border-orange-200 dark:border-orange-500/20 bg-orange-50/30 dark:bg-slate-950/40 dark:bg-linear-to-br dark:from-orange-500/10 dark:to-amber-500/5 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-1 cursor-default">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-linear-to-br from-orange-500 to-amber-400 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-orange-500 to-amber-400 opacity-60" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Pelanggan Baru</p>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{summary.newCustomers.toLocaleString("id-ID")}</div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Pengguna terdaftar baru</p>
            </div>
            <div className="shrink-0 p-3 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 ml-4">
              <FiUsers className="w-5 h-5" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${summary.customerGrowth >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
              {summary.customerGrowth >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {Math.abs(summary.customerGrowth)}%
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">vs periode sebelumnya</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 p-1 h-auto">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs"
          >
            <FiBarChart2 className="h-4 w-4" />
            <span className="whitespace-nowrap">Ringkasan</span>
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs"
          >
            <FiDollarSign className="h-4 w-4" />
            <span className="whitespace-nowrap">Penjualan</span>
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs"
          >
            <FiShoppingCart className="h-4 w-4" />
            <span className="whitespace-nowrap">Produk</span>
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs"
          >
            <FiPieChart className="h-4 w-4" />
            <span className="whitespace-nowrap">Pembayaran</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md">
              <div className="p-6 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <FiBarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Trend Penjualan</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Perkembangan volume harian</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  {mounted && dailySales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
                      <AreaChart data={dailySales} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f87171" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" stroke={theme === 'dark' ? '#ffffff08' : '#00000010'} vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            try {
                              return format(new Date(value), 'd MMM', { locale: id });
                            } catch {
                              return value;
                            }
                          }}
                          stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip content={<CustomAreaTooltip />} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area
                          type="monotone"
                          dataKey="success"
                          name="Berhasil"
                          stroke="#34d399"
                          strokeWidth={2.5}
                          fill="url(#fillSuccess)"
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="failed"
                          name="Gagal"
                          stroke="#f87171"
                          strokeWidth={2.5}
                          fill="url(#fillFailed)"
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <FiBarChart2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-400">Tidak ada data trend penjualan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sales by Category */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md">
              <div className="p-6 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <FiPieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Kategori Produk</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribusi omset per kategori</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-80">
                  {mounted && categoryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
                      <PieChart>
                        <Pie
                           data={categoryDistribution}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={4}
                           dataKey="value"
                           labelLine={false}
                           label={({ name, percent }) => `${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke={theme === 'dark' ? '#111827' : '#ffffff'} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend iconType="circle" layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <FiPieChart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-400">Tidak ada data kategori</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md">
            <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <FiShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Produk Terlaris</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar produk dengan penjualan tertinggi</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("products")} className="gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-transparent rounded-xl text-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                Lihat Semua
              </Button>
            </div>
            <div className="p-6">
              <div className="border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden shadow-xs">
                <div className="grid grid-cols-12 gap-4 p-4 font-bold bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 text-sm border-b border-slate-100 dark:border-slate-900">
                  <div className="col-span-7">Produk</div>
                  <div className="col-span-2 text-right">Terjual</div>
                  <div className="col-span-3 text-right">Pendapatan</div>
                </div>
                {topProducts.length > 0 ? (
                  topProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <div className="col-span-7 font-semibold text-slate-900 dark:text-white">
                        {product.name}
                        <span className="text-xs text-slate-400 dark:text-slate-500 block font-normal">{product.brandName} • {product.categoryName}</span>
                      </div>
                      <div className="col-span-2 text-right font-medium text-slate-600 dark:text-slate-400">{product.sales.toLocaleString('id-ID')}</div>
                      <div className="col-span-3 text-right font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(product.revenue)}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">Tidak ada data produk terlaris</div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <TransactionsTable startDate={startDateStr} endDate={endDateStr} />
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <FiShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Analisis Penjualan Produk</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Analisis performa produk terlaris dalam rentang waktu yang dipilih</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-900 rounded-xl">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-300 border-b border-slate-100 dark:border-slate-900">
                    <tr>
                      <th className="px-6 py-4">No</th>
                      <th className="px-6 py-4">Nama Produk</th>
                      <th className="px-6 py-4">Brand</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4 text-right">Unit Terjual</th>
                      <th className="px-6 py-4 text-right">Pendapatan (Gross)</th>
                      <th className="px-6 py-4 text-right">Estimasi Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length > 0 ? (
                      topProducts.map((p, idx) => (
                        <tr key={p.productId || idx} className="bg-white dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{idx + 1}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.brandName}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.categoryName}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">{p.sales.toLocaleString("id-ID")}</td>
                          <td className="px-6 py-4 text-right font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(p.revenue)}</td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.profit)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 dark:text-slate-500">Tidak ada data penjualan produk</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  <FiPieChart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Distribusi Metode Pembayaran</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Analisis porsi transaksi per metode pembayaran yang digunakan</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 h-96">
                  {mounted && paymentMethods.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
                      <PieChart>
                        <Pie
                          data={paymentMethods}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : 0}%)`}
                        >
                          {paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke={theme === 'dark' ? '#020617' : '#ffffff'} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend iconType="circle" layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <FiPieChart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">Tidak ada data metode pembayaran</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rincian Metode Pembayaran</h3>
                  <div className="space-y-2">
                    {paymentMethods.map((pm, idx) => (
                      <div key={pm.name || idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pm.color }} />
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{pm.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">{pm.transactions} trx</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">{formatCurrency(pm.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
