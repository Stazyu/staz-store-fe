"use client";

import React from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiDownload, FiRefreshCw, FiTrendingUp, FiShoppingCart, FiUsers, FiActivity, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { DashboardSummary, calculateTodaysSummary } from "./DashboardSummary";
import { fetchRecentTransactions } from "@/services/transaction.client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useTheme } from "next-themes";

// Dummy data for today's transactions
const mockTransactions = [
  { id: '1', date: new Date().toISOString(), status: 'success' as const, total: 150000 },
  { id: '2', date: new Date().toISOString(), status: 'success' as const, total: 250000 },
  { id: '3', date: new Date().toISOString(), status: 'success' as const, total: 100000 },
  { id: '4', date: new Date().toISOString(), status: 'pending' as const, total: 75000 },
  { id: '5', date: new Date(Date.now() - 86400000).toISOString(), status: 'success' as const, total: 300000 }, // Yesterday's transaction
];

// Recent activities
const recentActivities = [
  { id: 1, user: 'John Doe', action: 'Membeli Diamond Mobile Legends', amount: 150000, time: '2 menit lalu', status: 'success' },
  { id: 2, user: 'Jane Smith', action: 'Top Up Pulsa Telkomsel', amount: 50000, time: '5 menit lalu', status: 'success' },
  { id: 3, user: 'Mike Johnson', action: 'Top Up OVO', amount: 100000, time: '10 menit lalu', status: 'pending' },
  { id: 4, user: 'Sarah Williams', action: 'Membeli UC PUBG Mobile', amount: 200000, time: '15 menit lalu', status: 'success' },
  { id: 5, user: 'David Brown', action: 'Top Up GoPay', amount: 75000, time: '20 menit lalu', status: 'failed' },
];

// Calculate today's summary
const todaysSummary = calculateTodaysSummary(mockTransactions);

// Chart data for daily revenue
const dailyRevenue = [
  { date: "2025-06-07", revenue: 1200000, transactions: 45 },
  { date: "2025-06-08", revenue: 1500000, transactions: 52 },
  { date: "2025-06-09", revenue: 1300000, transactions: 48 },
  { date: "2025-06-10", revenue: 1700000, transactions: 61 },
  { date: "2025-06-11", revenue: 1100000, transactions: 42 },
  { date: "2025-06-12", revenue: 1600000, transactions: 58 },
  { date: "2025-06-13", revenue: 2100000, transactions: 72 },
];

// Transaction status breakdown
const statusBreakdown = [
  { name: 'Berhasil', value: 120, color: '#22c55e' },
  { name: 'Pending', value: 30, color: '#fbbf24' },
  { name: 'Gagal', value: 10, color: '#ef4444' },
];

// Category transactions with more detailed data
const categoryTransactions = [
  {
    category: "Game",
    count: 180,
    revenue: 45000000,
    color: '#3b82f6',
    subcategories: [
      { name: 'Mobile Legends', count: 80 },
      { name: 'Free Fire', count: 60 },
      { name: 'PUBG Mobile', count: 40 }
    ]
  },
  {
    category: "Pulsa",
    count: 90,
    revenue: 22500000,
    color: '#10b981',
    subcategories: [
      { name: 'Telkomsel', count: 50 },
      { name: 'XL', count: 25 },
      { name: 'Indosat', count: 15 }
    ]
  },
  {
    category: "E-Money",
    count: 60,
    revenue: 15000000,
    color: '#8b5cf6',
    subcategories: [
      { name: 'OVO', count: 35 },
      { name: 'GoPay', count: 15 },
      { name: 'DANA', count: 10 }
    ]
  },
];

// Calculate total transactions for percentage calculation
const totalTransactions = categoryTransactions.reduce((sum, cat) => sum + cat.count, 0);

export default function DashboardMain() {
  const { theme } = useTheme();
  
  const { data: recentRes, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => fetchRecentTransactions(5),
  });
  
  const recentTransactions = recentRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[20px_20px]" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <FiActivity className="h-8 w-8" />
              Dashboard Analytics
            </h1>
            <p className="text-blue-100 mt-2 text-lg">Pantau performa bisnis Anda secara real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <FiDownload className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Sales Summary */}
      <div className="space-y-4">
        <DashboardSummary
          today={todaysSummary.today}
          yesterday={todaysSummary.yesterday}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <Card className="xl:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FiTrendingUp className="h-5 w-5 text-blue-500" />
                  Tren Pendapatan & Transaksi
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">7 hari terakhir</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={dailyRevenue}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan'];
                    return [`${value} transaksi`, 'Jumlah Transaksi'];
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="revenue"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="transactions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTransactions)"
                  name="transactions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <FiShoppingCart className="h-5 w-5 text-green-500" />
              Aktivitas Terkini
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {isLoadingRecent ? (
                <div className="text-center py-4 text-gray-500">Memuat aktivitas...</div>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((trx) => (
                  <div key={trx.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`mt-1 rounded-full p-2 ${
                        trx.status === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/30' :
                        trx.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                      {trx.status === 'SUCCESS' && <FiCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                      {trx.status === 'PENDING' && <FiClock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                      {trx.status === 'FAILED' && <FiXCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{trx.userName || "Guest"}</p>
                      <p className="text-xs text-muted-foreground truncate">{trx.metadata?.productName || trx.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Rp {trx.amount.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(trx.createdAt), { addSuffix: true, locale: idLocale })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">Tidak ada aktivitas.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category & Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <FiUsers className="h-5 w-5 text-purple-500" />
              Distribusi Kategori
            </CardTitle>
            <p className="text-sm text-muted-foreground">Total {totalTransactions} transaksi</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {categoryTransactions.map((category) => (
                <div key={category.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-lg"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <span className="font-semibold text-base">{category.category}</span>
                        <p className="text-xs text-muted-foreground">
                          Rp {category.revenue.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{category.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {((category.count / totalTransactions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Modern Progress Bar */}
                  <div className="relative w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${(category.count / totalTransactions * 100)}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>

                  {/* Subcategories */}
                  <div className="grid grid-cols-3 gap-2 pl-6">
                    {category.subcategories.map((sub, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground truncate">{sub.name}</p>
                        <p className="text-sm font-semibold">{sub.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Status */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-xl flex items-center gap-2">
              <FiActivity className="h-5 w-5 text-orange-500" />
              Status Transaksi
            </CardTitle>
            <p className="text-sm text-muted-foreground">Ringkasan status pemrosesan</p>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={statusBreakdown}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => [`${value} transaksi`, 'Jumlah']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'Berhasil' ? 'url(#successGradient)' :
                          entry.name === 'Pending' ? 'url(#pendingGradient)' :
                            'url(#failedGradient)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {statusBreakdown.map((status) => (
                <div
                  key={status.name}
                  className="p-3 rounded-lg border-2 transition-all hover:scale-105"
                  style={{ borderColor: status.color }}
                >
                  <div className="text-2xl font-bold" style={{ color: status.color }}>
                    {status.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{status.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


