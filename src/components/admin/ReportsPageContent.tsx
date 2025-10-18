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
  FiBarChart2
} from "react-icons/fi";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  TooltipProps as RechartsTooltipProps
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
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { useTheme } from "next-themes";

type DailySale = {
  date: string;
  total: number;
  success: number;
  failed: number;
};
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Sample data
const salesData = [
  { name: "Game", value: 120, color: "#4f46e5" },
  { name: "Pulsa", value: 80, color: "#10b981" },
  { name: "PLN", value: 40, color: "#f59e0b" },
  { name: "E-Money", value: 30, color: "#3b82f6" },
  { name: "Voucher", value: 50, color: "#ec4899" },
];

const dailySales = [
  { date: "2025-06-07", total: 23, success: 20, failed: 3 },
  { date: "2025-06-08", total: 19, success: 18, failed: 1 },
  { date: "2025-06-09", total: 28, success: 26, failed: 2 },
  { date: "2025-06-10", total: 31, success: 29, failed: 2 },
  { date: "2025-06-11", total: 15, success: 14, failed: 1 },
  { date: "2025-06-12", total: 24, success: 22, failed: 2 },
  { date: "2025-06-13", total: 37, success: 35, failed: 2 },
];

const topProducts = [
  { id: 1, name: "Mobile Legends Diamond", sales: 245, revenue: 12250000 },
  { id: 2, name: "Genshin Impact Genesis Crystal", sales: 189, revenue: 9450000 },
  { id: 3, name: "Free Fire Diamond", sales: 156, revenue: 7800000 },
  { id: 4, name: "PUBG Mobile UC", sales: 132, revenue: 6600000 },
  { id: 5, name: "Valorant Points", sales: 98, revenue: 4900000 },
];

const paymentMethods = [
  { name: "Bank Transfer", value: 45, color: "#4f46e5" },
  { name: "E-Wallet", value: 30, color: "#10b981" },
  { name: "Virtual Account", value: 15, color: "#f59e0b" },
  { name: "Retail", value: 10, color: "#3b82f6" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: RechartsTooltipProps<number, string> & {
  payload?: Array<{
    value?: number;
    name: string;
    payload: DailySale;
    color: string;
    dataKey: string;
  }>;
}) => {
  if (!active || !payload || !payload.length) return null;

  const formattedDate = label ? format(new Date(String(label)), 'EEEE, d MMM yyyy', { locale: id }) : '';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="font-medium text-gray-900 dark:text-white">
        {formattedDate}
      </p>
      {payload.map((entry, index) => (
        <p key={`tooltip-${index}`} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {entry.value} transaksi
        </p>
      ))}
    </div>
  );
};

// Define types for better type safety
type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function ReportsPageContent() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<"overview" | "dailySales" | "topProducts" | "paymentMethods">("overview");

  // Calculate summary data
  const totalRevenue = 12345678;
  const totalTransactions = 232;
  const averageOrderValue = Math.round(totalRevenue / totalTransactions);
  const newCustomers = 42;
  const revenueChange = 12.5; // %
  const transactionChange = 5.2; // %
  const aovChange = 3.8; // %
  const customerChange = 8.1; // %

  // CSV helpers
  const toCSV = (rows: Array<Record<string, unknown>>): string => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const escape = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      // Escape quotes and wrap if contains comma/newline
      const escaped = s.replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    };
    const lines = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))];
    return lines.join("\n");
  };

  const exportData = useMemo(() => ({
    overview: [
      { metric: "Total Pendapatan", value: totalRevenue },
      { metric: "Total Transaksi", value: totalTransactions },
      { metric: "Rata-rata Nilai Transaksi", value: averageOrderValue },
      { metric: "Pelanggan Baru", value: newCustomers },
    ],
    dailySales: dailySales.map(ds => ({ date: ds.date, success: ds.success, failed: ds.failed, total: ds.total })),
    topProducts: topProducts.map(p => ({ id: p.id, name: p.name, sales: p.sales, revenue: p.revenue })),
    paymentMethods: paymentMethods.map(pm => ({ name: pm.name, percentage: pm.value })),
  }), [totalRevenue, totalTransactions, averageOrderValue, newCustomers]);

  const handleDownloadCSV = () => {
    const map: Record<string, Array<Record<string, unknown>>> = exportData as unknown as Record<string, Array<Record<string, unknown>>>;
    const target = exportTarget === "overview" && activeTab !== "overview" ? activeTab : exportTarget;
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

  return (
    <div className="space-y-6">
      {/* Modern Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.06] bg-[size:20px_20px]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Laporan & Analitik</h1>
            <p className="text-blue-100 mt-2 text-base md:text-lg">Pantau kinerja dan aktivitas toko Anda secara menyeluruh</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 shadow-lg transition-all"
                  onClick={() => setExportOpen(true)}
                >
                  <FiDownload className="h-4 w-4" />
                  Ekspor Laporan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ekspor Laporan</DialogTitle>
                  <DialogDescription>Pilih dataset yang ingin diekspor sebagai CSV.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <label className="text-sm font-medium">Jenis Laporan</label>
                  <select
                    value={exportTarget}
                    onChange={(e) => setExportTarget(e.target.value as typeof exportTarget)}
                    className="w-full rounded-md border bg-background p-2"
                  >
                    <option value="overview">Ringkasan (metrik utama)</option>
                    <option value="dailySales">Trend Penjualan (harian)</option>
                    <option value="topProducts">Produk Terlaris</option>
                    <option value="paymentMethods">Metode Pembayaran</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button onClick={handleDownloadCSV} className="gap-2">
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
      <Card className="sticky top-4 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/40">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Rentang Waktu</CardTitle>
              <CardDescription>Pilih rentang waktu untuk melihat laporan</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </CardHeader>
      </Card>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
              <FiDollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className={`text-sm mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange)}% dari periode sebelumnya
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transaksi</CardTitle>
              <FiShoppingCart className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <div className={`text-sm mt-1 ${transactionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transactionChange >= 0 ? '↑' : '↓'} {Math.abs(transactionChange)}% dari periode sebelumnya
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Nilai Transaksi</CardTitle>
              <FiTrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
            <div className={`text-sm mt-1 ${aovChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {aovChange >= 0 ? '↑' : '↓'} {Math.abs(aovChange)}% dari periode sebelumnya
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pelanggan Baru</CardTitle>
              <FiUsers className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers}</div>
            <div className={`text-sm mt-1 ${customerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {customerChange >= 0 ? '↑' : '↓'} {Math.abs(customerChange)}% dari periode sebelumnya
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto rounded-md border bg-muted/40 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FiBarChart2 className="h-4 w-4" />
            <span className="whitespace-nowrap">Ringkasan</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <FiDollarSign className="h-4 w-4" />
            <span className="whitespace-nowrap">Penjualan</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <FiShoppingCart className="h-4 w-4" />
            <span className="whitespace-nowrap">Produk</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <FiPieChart className="h-4 w-4" />
            <span className="whitespace-nowrap">Pembayaran</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Trend Penjualan</CardTitle>
                <CardDescription>Perkembangan penjualan harian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: id })}
                        tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                        stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                      />
                      <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                      <Tooltip
                        content={<CustomTooltip />}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                          border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value) => [value, 'Transaksi']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="success"
                        name="Berhasil"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="failed"
                        name="Gagal"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Kategori Produk</CardTitle>
                <CardDescription>Distribusi penjualan per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} transaksi`, 'Jumlah']}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                          border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Produk Terlaris</CardTitle>
                  <CardDescription>Daftar produk dengan penjualan tertinggi</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  Lihat Semua
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium bg-gray-50 dark:bg-gray-800">
                  <div className="col-span-7">Produk</div>
                  <div className="col-span-2 text-right">Terjual</div>
                  <div className="col-span-3 text-right">Pendapatan</div>
                </div>
                {topProducts.map((product) => (
                  <div key={product.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="col-span-7 font-medium">{product.name}</div>
                    <div className="col-span-2 text-right">{product.sales.toLocaleString('id-ID')}</div>
                    <div className="col-span-3 text-right font-medium">{formatCurrency(product.revenue)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Penjualan</CardTitle>
              <CardDescription>Detail transaksi dan analisis penjualan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex flex-col items-center justify-center text-muted-foreground">
                <FiBarChart2 className="h-12 w-12 mb-4 opacity-30" />
                <p>Laporan penjualan akan segera tersedia</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Produk</CardTitle>
              <CardDescription>Kinerja dan statistik produk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex flex-col items-center justify-center text-muted-foreground">
                <FiShoppingCart className="h-12 w-12 mb-4 opacity-30" />
                <p>Analisis produk akan segera tersedia</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
              <CardDescription>Distribusi dan analisis metode pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Persentase']}
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                        border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Removed duplicate export buttons as they're now in the header */}
    </div>
  );
}
