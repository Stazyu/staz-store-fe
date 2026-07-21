"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateRangePicker, DateRange } from "@/components/admin/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  FileDown,
  Copy,
  Check,
  Clock,
  Terminal,
  User,
  Activity,
  Globe,
  Database,
  Layers,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import authClient from "@/lib/auth-client";
import {
  fetchAuditLogs,
  fetchAuditLogDetail,
  downloadAuditLogsCsv,
  AuditLog,
  AuditLogsResponse
} from "@/services/auditLog.client";

const severityColors: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  CRITICAL: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse font-bold"
};

const moduleColors: Record<string, string> = {
  auth: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  user: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  product: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  category: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  brand: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
  type: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  settings: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  balance: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  topup: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  order: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  promo: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  payment_method: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
};

export default function AuditLogsTable() {
  const { data: session } = authClient.useSession();
  const isSuperAdmin = session?.user?.role?.toUpperCase() === "SUPER_ADMIN";

  // Filter States
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [activeTab, setActiveTab] = useState("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("visual");

  useEffect(() => {
    if (detailId) {
      setActiveDetailTab("visual");
    }
  }, [detailId]);

  // Quick Preset Actions
  const handleQuickTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);

    // Reset everything first
    setStatus("");
    setSeverity("");
    setModule("");
    setDateRange({ from: undefined, to: undefined });

    if (tabId === "critical") {
      setSeverity("HIGH"); // or CRITICAL handled on backend when passing HIGH or CRITICAL
    } else if (tabId === "financial") {
      setModule("balance");
    } else if (tabId === "failed") {
      setStatus("FAILED");
    } else if (tabId === "today") {
      const today = new Date();
      setDateRange({ from: today, to: today });
    }
  };

  const formattedStartDate = dateRange.from ? dateRange.from.toISOString().split("T")[0] : undefined;
  const formattedEndDate = dateRange.to ? dateRange.to.toISOString().split("T")[0] : undefined;

  const queryParams = {
    search: search.trim() || undefined,
    module: module || undefined,
    status: status || undefined,
    severity: severity || undefined,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    page,
    limit: pageSize
  };

  const { data: response, isLoading, isError, error, refetch } = useQuery<AuditLogsResponse, Error>({
    queryKey: ["adminAuditLogs", queryParams],
    queryFn: () => fetchAuditLogs(queryParams),
    placeholderData: (prev: AuditLogsResponse | undefined) => prev
  });

  const { data: logDetail, isLoading: isLoadingDetail } = useQuery<AuditLog, Error>({
    queryKey: ["adminAuditLogDetail", detailId],
    queryFn: () => fetchAuditLogDetail(detailId || ""),
    enabled: !!detailId
  });

  useEffect(() => {
    setPage(1);
  }, [search, module, status, severity, dateRange]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportCsv = async () => {
    if (!isSuperAdmin) return;
    try {
      setIsExporting(true);
      await downloadAuditLogsCsv({
        search: search.trim() || undefined,
        module: module || undefined,
        status: status || undefined,
        severity: severity || undefined,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal mengekspor CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setModule("");
    setStatus("");
    setSeverity("");
    setDateRange({ from: undefined, to: undefined });
    setActiveTab("all");
  };

  const logs = response?.data || [];
  const pagination = response?.pagination || { total: 0, limit: 15, page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 dark:border-blue-500/10 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#081e3d_45%,#071a33_100%)] shadow-[0_20px_80px_rgba(37,99,235,0.08)] p-6">
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
              <ShieldCheck className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Audit Log</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Catatan aktivitas admin, mutasi data, dan perubahan sistem terintegrasi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <FileDown className="size-4 mr-2" />
                {isExporting ? "Mengekspor..." : "Ekspor CSV"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className="size-4 mr-2" /> Segarkan
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Filters Tab */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
        {[
          { id: "all", label: "Semua Aktivitas" },
          { id: "critical", label: "Tingkat Tinggi & Kritis" },
          { id: "financial", label: "Keuangan & Saldo" },
          { id: "failed", label: "Percobaan Gagal" },
          { id: "today", label: "Hari Ini" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleQuickTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
              activeTab === tab.id
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari admin, referensi, ID, deskripsi..."
                className="pl-9 h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 text-sm focus:ring-blue-500/20"
              />
            </div>

            {/* Date Range Picker */}
            <DateRangePicker value={dateRange} onChange={setDateRange} />

            {/* Module Select */}
            <Select value={module || "all"} onValueChange={(val) => setModule(val === "all" ? "" : val)}>
              <SelectTrigger className="border border-slate-200 dark:border-white/10 rounded-xl h-10 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-[150px] cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200">
                <SelectValue placeholder="Semua Modul" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                <SelectItem value="all" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Semua Modul</SelectItem>
                <SelectItem value="auth" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Autentikasi</SelectItem>
                <SelectItem value="user" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">User</SelectItem>
                <SelectItem value="product" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Product</SelectItem>
                <SelectItem value="category" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Category</SelectItem>
                <SelectItem value="brand" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Brand</SelectItem>
                <SelectItem value="type" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Type</SelectItem>
                <SelectItem value="settings" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Settings</SelectItem>
                <SelectItem value="balance" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Balance</SelectItem>
                <SelectItem value="topup" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Topup</SelectItem>
                <SelectItem value="order" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Order</SelectItem>
                <SelectItem value="promo" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Promo</SelectItem>
                <SelectItem value="payment_method" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Payment</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Select */}
            <Select value={status || "all"} onValueChange={(val) => setStatus(val === "all" ? "" : val)}>
              <SelectTrigger className="border border-slate-200 dark:border-white/10 rounded-xl h-10 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-[140px] cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                <SelectItem value="all" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Semua Status</SelectItem>
                <SelectItem value="SUCCESS" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">SUCCESS</SelectItem>
                <SelectItem value="FAILED" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">FAILED</SelectItem>
              </SelectContent>
            </Select>

            {/* Severity Select */}
            <Select value={severity || "all"} onValueChange={(val) => setSeverity(val === "all" ? "" : val)}>
              <SelectTrigger className="border border-slate-200 dark:border-white/10 rounded-xl h-10 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-[140px] cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200">
                <SelectValue placeholder="Semua Severity" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                <SelectItem value="all" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">Semua Severity</SelectItem>
                <SelectItem value="LOW" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">LOW</SelectItem>
                <SelectItem value="MEDIUM" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">MEDIUM</SelectItem>
                <SelectItem value="HIGH" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">HIGH</SelectItem>
                <SelectItem value="CRITICAL" className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 text-slate-700 dark:text-slate-300">CRITICAL</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-10 text-slate-500 hover:text-slate-950 dark:text-slate-450 dark:hover:text-white cursor-pointer"
            >
              <Filter className="size-4 mr-2" /> Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table Card */}
      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-12 text-center text-slate-500 font-bold">No</TableHead>
                  <TableHead className="text-slate-500 font-bold">Waktu</TableHead>
                  <TableHead className="text-slate-500 font-bold">Admin</TableHead>
                  <TableHead className="text-slate-500 font-bold">Aktivitas</TableHead>
                  <TableHead className="text-slate-500 font-bold">Modul</TableHead>
                  <TableHead className="text-slate-500 font-bold">Reference</TableHead>
                  <TableHead className="text-slate-500 font-bold">Status</TableHead>
                  <TableHead className="text-slate-500 font-bold">Severity</TableHead>
                  <TableHead className="text-slate-500 font-bold">IP Address</TableHead>
                  <TableHead className="w-16 text-center text-slate-500 font-bold pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-24 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="size-8 animate-spin text-blue-500" />
                        <p className="text-sm font-semibold">Memuat log aktivitas...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-20 text-center text-rose-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-10 text-rose-500" />
                        <p className="text-sm font-bold">Terjadi Kesalahan</p>
                        <p className="text-xs text-slate-400">{(error as Error).message}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-24 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldCheck className="size-12 text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada log aktivitas</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                          Tidak ditemukan catatan audit log yang sesuai dengan filter atau kata kunci saat ini.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: AuditLog, idx: number) => {
                    return (
                      <TableRow
                        key={log.id}
                        className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                      >
                        <TableCell className="text-center text-xs text-slate-500">
                          {(page - 1) * pageSize + idx + 1}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                            {log.actorName || "System / Guest"}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {log.actorEmail || log.actorRole || ""}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-250 max-w-[200px] truncate" title={log.actionLabel || log.action}>
                            {log.actionLabel || log.action}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-mono">
                            {log.action}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border uppercase ${
                              moduleColors[log.module] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
                            }`}
                          >
                            {log.module}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {log.reference ? (
                            <span className="truncate max-w-[120px] block" title={log.reference}>
                              {log.reference}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`rounded-lg px-2 py-0.5 text-[10px] border ${severityColors[log.severity]}`}
                          >
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {log.ipAddress || "-"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDetailId(log.id)}
                            className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination Controls */}
        {!isLoading && logs.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}{" "}
              catatan audit log
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent cursor-pointer"
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{page}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-600">/</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {pagination.totalPages || 1}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent cursor-pointer"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-0 overflow-hidden text-slate-900 dark:text-slate-200 shadow-2xl">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-650 p-6 text-white relative">
            <div className="relative z-10">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="size-5 text-blue-200" />
                Detail Log Audit
              </DialogTitle>
              <p className="text-xs text-blue-200 mt-1">
                Catatan aktivitas audit lengkap dengan diff perubahan
              </p>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
          </div>

          {isLoadingDetail ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="size-8 animate-spin mx-auto text-blue-500 mb-3" />
              <p className="text-sm font-semibold">Mengambil detail catatan...</p>
            </div>
          ) : logDetail ? (
            <div className="p-6 space-y-4">
              {/* Header Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <h4 className="text-[10px] text-slate-450 uppercase font-bold tracking-wider flex items-center gap-1">
                    <User className="size-3 text-blue-500" /> Actor
                  </h4>
                  <p className="text-slate-900 dark:text-white font-bold mt-1 max-w-[120px] truncate" title={logDetail.actorName || "System"}>
                    {logDetail.actorName || "System"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]" title={logDetail.actorEmail || ""}>
                    {logDetail.actorEmail || ""}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-450 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Layers className="size-3 text-violet-500" /> Modul & Aksi
                  </h4>
                  <p className="text-slate-900 dark:text-white font-bold mt-1 uppercase">
                    {logDetail.module}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={logDetail.action}>
                    {logDetail.action}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-450 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Clock className="size-3 text-cyan-500" /> Waktu
                  </h4>
                  <p className="text-slate-900 dark:text-white font-bold mt-1">
                    {new Date(logDetail.createdAt).toLocaleTimeString("id-ID")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(logDetail.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                    logDetail.status === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  }`}>
                    {logDetail.status}
                  </span>
                  <div className="mt-1.5">
                    <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[9px] ${severityColors[logDetail.severity]}`}>
                      {logDetail.severity}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs text-slate-450 font-bold uppercase tracking-wider block">Deskripsi Aktivitas</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100/80 dark:border-slate-900 leading-relaxed">
                  {logDetail.description || "Tidak ada deskripsi rinci untuk aktivitas ini."}
                </p>
              </div>

              {/* Advanced System Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-b border-slate-100 dark:border-slate-900 py-3 text-xs">
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <span className="text-slate-450 font-medium">IP Address:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded">
                    {logDetail.ipAddress || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <span className="text-slate-450 font-medium">Request ID:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded flex items-center gap-1">
                    {logDetail.requestId ? (
                      <>
                        <span className="truncate max-w-[80px]" title={logDetail.requestId}>
                          {logDetail.requestId}
                        </span>
                        <button
                          onClick={() => handleCopy(logDetail.requestId || "", "reqId")}
                          className="hover:text-blue-500 cursor-pointer"
                        >
                          {copiedKey === "reqId" ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </>
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <span className="text-slate-450 font-medium">Reference ID:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-350 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded flex items-center gap-1">
                    {logDetail.reference ? (
                      <>
                        <span className="truncate max-w-[80px]" title={logDetail.reference}>
                          {logDetail.reference}
                        </span>
                        <button
                          onClick={() => handleCopy(logDetail.reference || "", "ref")}
                          className="hover:text-blue-500 cursor-pointer"
                        >
                          {copiedKey === "ref" ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </>
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </div>

              {logDetail.userAgent && (
                <div className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-start gap-2 font-mono">
                  <Globe className="size-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>UA: {logDetail.userAgent}</span>
                </div>
              )}

              {/* Tabs for JSON details and Diff rendering */}
              <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="w-full">
                <TabsList className={`grid w-full grid-cols-${
                  1 + 
                  (logDetail.before ? 1 : 0) + 
                  (logDetail.after ? 1 : 0) + 
                  (logDetail.changes ? 1 : 0) + 
                  (logDetail.metadata ? 1 : 0)
                } h-9 bg-slate-100 dark:bg-slate-900 rounded-lg p-1`}>
                  <TabsTrigger value="visual" className="text-[11px] font-bold rounded-md cursor-pointer">Visual</TabsTrigger>
                  {logDetail.before && (
                    <TabsTrigger value="before" className="text-[11px] font-bold rounded-md cursor-pointer">Sebelum</TabsTrigger>
                  )}
                  {logDetail.after && (
                    <TabsTrigger value="after" className="text-[11px] font-bold rounded-md cursor-pointer">Sesudah</TabsTrigger>
                  )}
                  {logDetail.changes && (
                    <TabsTrigger value="changes" className="text-[11px] font-bold rounded-md cursor-pointer">Diff</TabsTrigger>
                  )}
                  {logDetail.metadata && (
                    <TabsTrigger value="metadata" className="text-[11px] font-bold rounded-md cursor-pointer">Meta</TabsTrigger>
                  )}
                </TabsList>

                {/* Tab: Visual Diff */}
                <TabsContent value="visual" className="mt-3">
                  {logDetail.changes && Object.keys(logDetail.changes).length > 0 ? (
                    <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50/80 dark:bg-slate-900/60 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
                        <span>Perubahan Parameter</span>
                        <Badge variant="secondary" className="text-[9px] font-bold">
                          {Object.keys(logDetail.changes).length} Fields
                        </Badge>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-900/10 text-slate-500 border-b border-slate-150 dark:border-slate-800 text-left font-bold">
                              <th className="px-4 py-2">Field</th>
                              <th className="px-4 py-2">Sebelum</th>
                              <th className="px-4 py-2">Sesudah</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(logDetail.changes).map(([key, val]: [string, any]) => {
                              const fromVal = val && typeof val === "object" && "from" in val ? val.from : val;
                              const toVal = val && typeof val === "object" && "to" in val ? val.to : null;

                              const renderVal = (v: any) => {
                                if (v === null || v === undefined) {
                                  return <span className="text-slate-400 italic">null</span>;
                                }
                                if (typeof v === "boolean") {
                                  return v ? "true" : "false";
                                }
                                if (typeof v === "object") {
                                  return JSON.stringify(v);
                                }
                                return String(v);
                              };

                              return (
                                <tr key={key} className="border-b border-slate-150 dark:border-slate-800 last:border-none hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                  <td className="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 font-mono text-[11px]">{key}</td>
                                  <td className="px-4 py-2.5 font-mono text-rose-600 dark:text-rose-450 max-w-[180px] truncate" title={JSON.stringify(fromVal)}>
                                    {renderVal(fromVal)}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 max-w-[180px] truncate" title={JSON.stringify(toVal)}>
                                    {renderVal(toVal)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-xs space-y-1">
                      <Terminal className="size-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                      <p className="font-bold text-slate-600 dark:text-slate-400">Tidak ada visual diff</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Aksi ini tidak menyertakan log perbandingan key-value (biasanya berupa penciptaan, penghapusan, atau log read).
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Before JSON */}
                <TabsContent value="before" className="mt-3 relative">
                  <div className="absolute right-3 top-3 z-20">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(JSON.stringify(logDetail.before, null, 2), "beforeJson")}
                      className="size-7 rounded bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    >
                      {copiedKey === "beforeJson" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </Button>
                  </div>
                  <ScrollArea className="h-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(logDetail.before, null, 2)}</pre>
                  </ScrollArea>
                </TabsContent>

                {/* Tab: After JSON */}
                <TabsContent value="after" className="mt-3 relative">
                  <div className="absolute right-3 top-3 z-20">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(JSON.stringify(logDetail.after, null, 2), "afterJson")}
                      className="size-7 rounded bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    >
                      {copiedKey === "afterJson" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </Button>
                  </div>
                  <ScrollArea className="h-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(logDetail.after, null, 2)}</pre>
                  </ScrollArea>
                </TabsContent>

                {/* Tab: Changes JSON */}
                <TabsContent value="changes" className="mt-3 relative">
                  <div className="absolute right-3 top-3 z-20">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(JSON.stringify(logDetail.changes, null, 2), "changesJson")}
                      className="size-7 rounded bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    >
                      {copiedKey === "changesJson" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </Button>
                  </div>
                  <ScrollArea className="h-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(logDetail.changes, null, 2)}</pre>
                  </ScrollArea>
                </TabsContent>

                {/* Tab: Metadata JSON */}
                <TabsContent value="metadata" className="mt-3 relative">
                  <div className="absolute right-3 top-3 z-20">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(JSON.stringify(logDetail.metadata, null, 2), "metaJson")}
                      className="size-7 rounded bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    >
                      {copiedKey === "metaJson" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </Button>
                  </div>
                  <ScrollArea className="h-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(logDetail.metadata, null, 2)}</pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="pt-2 flex justify-end">
                <Button
                  className="px-6 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800 dark:text-slate-300 rounded-xl cursor-pointer"
                  onClick={() => setDetailId(null)}
                >
                  Tutup Detail
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
