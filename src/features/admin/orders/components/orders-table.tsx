"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, RefreshCw, Eye, CheckCircle2, XCircle, AlertCircle, Clock, Save, DollarSign, ShoppingBag } from "lucide-react";
import { fetchAdminOrders, updateOrderStatus, syncDigiflazz, syncPendingDigiflazz, Order } from "@/services/order.client";
import { useAdminDashboardQuery } from "@/hooks/useAdminDashboardQuery";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import OrdersFilter from "./orders-filter";
import OrderDetailModal from "./order-detail-modal";
import { ordersColumns } from "./orders-columns";

/* ─── Status Map ───────────────────────────────────────────────────────── */
const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  SUCCESS: { label: "Berhasil", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  PROCESSING: { label: "Proses", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: RefreshCw },
  FAILED: { label: "Gagal", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: XCircle },
  REFUNDED: { label: "Refund", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: AlertCircle },
  CANCELED: { label: "Dibatalkan", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: XCircle },
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function getStatusDisplay(statusCode: string) {
  return statusMap[statusCode] || { label: statusCode, color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: AlertCircle };
}


function OrderMetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-slate-900 dark:text-white font-bold text-base md:text-lg leading-none tracking-tight">{value}</div>
        <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider mt-1 font-medium">{label}</div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function OrdersTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    if (dateRange.from) {
      setStartDate(format(dateRange.from, "yyyy-MM-dd"));
    } else {
      setStartDate("");
    }
    if (dateRange.to) {
      setEndDate(format(dateRange.to, "yyyy-MM-dd"));
    } else {
      setEndDate("");
    }
  }, [dateRange]);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editSn, setEditSn] = useState("");

  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  const offset = (page - 1) * pageSize;

  const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminOrders', { search, status, startDate, endDate, limit: pageSize, offset }],
    queryFn: () => fetchAdminOrders({ search, status, startDate, endDate, limit: pageSize, offset }),
  });

  const { data: dashboardData, isLoading: isLoadingDashboard } = useAdminDashboardQuery("day");
  const todaySummary = dashboardData?.summary;
  const todayStatusCounts = dashboardData?.transactionStatus;

  const getStatusCount = (key: string) => {
    return todayStatusCounts?.find((s: any) => s.key === key)?.value ?? 0;
  };

  const orders = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, status, startDate, endDate]);

  const activeDetailOrder = orders.find(o => o.trxId === detailId);

  const handleSyncSingle = async (trxId: string) => {
    try {
      setSyncingIds(prev => new Set(prev).add(trxId));
      await syncDigiflazz(trxId);
      toast.success(`Order ${trxId} berhasil disinkronkan`);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    } catch (err: any) {
      toast.error(err.message || "Gagal sync order");
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(trxId);
        return next;
      });
    }
  };

  const handleSyncBulk = async () => {
    try {
      setIsBulkSyncing(true);
      const res = await syncPendingDigiflazz(25);
      toast.success(`Sync selesai: ${res.data?.success || 0} sukses, ${res.data?.failed || 0} gagal`);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    } catch (err: any) {
      toast.error(err.message || "Gagal sync pending order");
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleEditClick = (order: Order) => {
    setEditOrder(order);
    setEditStatus(order.status);
    setEditSn(order.sn || "");
  };

  const handleSaveStatus = async () => {
    if (!editOrder) return;
    try {
      await updateOrderStatus(editOrder.trxId, editStatus, editSn);
      toast.success("Status order berhasil diperbarui");
      setEditOrder(null);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status");
    }
  };

  const handleResetFilter = () => {
    setSearch("");
    setStatus("");
    setDateRange({ from: undefined, to: undefined });
  };

  const handleViewDetail = (trxId: string) => {
    setDetailId(trxId);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_35%),linear-gradient(135deg,#f8fafc_0%,#eff6ff_55%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#0b1738_55%,#08111f_100%)] border border-blue-200 dark:border-blue-500/10 shadow-[0_20px_80px_rgba(59,130,246,0.06)] dark:shadow-[0_20px_80px_rgba(59,130,246,0.08)]">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="size-6 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">Kelola Order</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola dan pantau seluruh transaksi pembelian produk game.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="w-full sm:w-auto h-10 px-4 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white text-sm font-semibold backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RefreshCw className={`size-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
            <Button
              onClick={handleSyncBulk}
              disabled={isBulkSyncing}
              className="w-full sm:w-auto h-10 px-5 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RefreshCw className={`size-4 mr-2 ${isBulkSyncing ? "animate-spin" : ""}`} />
              Sync Pending Digiflazz
            </Button>
          </div>
        </div>

        {/* Mini Summary Metrics */}
        <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-blue-200 dark:border-white/10 w-full">
          <OrderMetricCard
            icon={ShoppingBag}
            label="Total Order Hari Ini"
            value={isLoadingDashboard ? "..." : todaySummary?.totalTransactionsToday ?? 0}
            color="text-blue-400"
          />
          <OrderMetricCard
            icon={Clock}
            label="Order Pending"
            value={isLoadingDashboard ? "..." : getStatusCount("pending")}
            color="text-amber-400"
          />
          <OrderMetricCard
            icon={CheckCircle2}
            label="Order Berhasil"
            value={isLoadingDashboard ? "..." : getStatusCount("success")}
            color="text-emerald-400"
          />
          <OrderMetricCard
            icon={DollarSign}
            label="Revenue Hari Ini"
            value={isLoadingDashboard ? "..." : `Rp ${(todaySummary?.totalRevenueToday ?? 0).toLocaleString("id-ID")}`}
            color="text-sky-400"
          />
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1020]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl">
        <CardHeader className="space-y-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                Daftar Transaksi Order
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Menampilkan pesanan dari customer.
              </CardDescription>
            </div>
          </div>

          {/* Filters */}
          <OrdersFilter
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={handleResetFilter}
          />
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-white/5">
                <TableRow className="border-slate-200 dark:border-white/5 hover:bg-transparent">
                  {ordersColumns.map(col => (
                    <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                      <TableCell className="text-center py-4"><div className="h-4 w-6 bg-slate-100 dark:bg-white/5 rounded animate-pulse mx-auto" /></TableCell>
                      <TableCell className="py-4"><div className="h-4 w-24 bg-slate-100 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                          <div className="h-3 w-36 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell className="py-4"><div className="h-4 w-16 bg-slate-100 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                      <TableCell className="py-4"><div className="h-4 w-32 bg-slate-100 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                      <TableCell className="py-4"><div className="h-4 w-24 bg-slate-100 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                      <TableCell className="py-4"><div className="h-4 w-20 bg-slate-100 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                      <TableCell className="text-center py-4"><div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse mx-auto" /></TableCell>
                      <TableCell className="text-center py-4"><div className="h-6 w-16 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse mx-auto" /></TableCell>
                      <TableCell className="py-4"><div className="h-4 w-28 bg-slate-100 dark:bg-white/5 rounded animate-pulse" /></TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <div className="flex justify-end gap-1.5">
                          <div className="size-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                          <div className="size-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                    <TableCell colSpan={11} className="py-16 text-center text-rose-500">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto gap-3">
                        <div className="p-3.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                          <AlertCircle className="size-8 text-rose-500 dark:text-rose-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-900 dark:text-white">Terjadi Kesalahan</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{(error as Error).message}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                    <TableCell colSpan={11} className="py-16 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto gap-3">
                        <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                          <ShoppingCart className="size-8 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-900 dark:text-white">Belum ada order ditemukan</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Coba ubah filter pencarian Anda atau sinkronkan order pending.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, idx) => {
                    const statusConfig = getStatusDisplay(order.status);
                    const Icon = statusConfig.icon;

                    return (
                      <TableRow key={order.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">{offset + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                          {order.trxId}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{order.user?.name || "Guest"}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{order.user?.email || ""}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-300 font-medium">{order.brandName}</TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-[155px] truncate" title={order.productName}>
                          {order.productName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {order.dataNo}
                          {order.dataId ? ` (${order.dataId})` : ""}
                        </TableCell>
                        <TableCell className="text-sm font-bold text-slate-900 dark:text-white">
                          Rp {order.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} shadow-sm`}>
                            <Icon className="size-3.5" />
                            {statusConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 shadow-sm">
                            {order.paymentMethod || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewDetail(order.trxId)}
                              className="size-8 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white transition-all duration-200"
                              title="Detail"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditClick(order)}
                              className="size-8 rounded-lg text-amber-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200"
                              title="Ubah Status"
                            >
                              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </Button>
                            {order.provider === "DIGIFLAZZ" && (order.status === "PENDING" || order.status === "PROCESSING") && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSyncSingle(order.trxId)}
                                disabled={syncingIds.has(order.trxId)}
                                className="size-8 rounded-lg text-blue-500 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200"
                                title="Sync Digiflazz"
                              >
                                <RefreshCw className={`size-4 ${syncingIds.has(order.trxId) ? "animate-spin" : ""}`} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {!isLoading && orders.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 gap-4">
            <span className="text-xs text-slate-500 font-semibold">
              Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} pesanan
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-9 px-4 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{page}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">/</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{totalPage || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPage}
                onClick={() => setPage(p => p + 1)}
                className="h-9 px-4 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <OrderDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        order={activeDetailOrder || null}
      />

      {/* Edit Status Dialog */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-white/10 rounded-3xl text-slate-700 dark:text-slate-200 p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Ubah Status Order</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Perbarui status pemrosesan dan input serial number order manual.
            </DialogDescription>
          </DialogHeader>
          {editOrder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Status Order</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="w-full border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm rounded-xl h-10 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 transition-all [&>svg]:text-slate-500">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-xl shadow-2xl dark:shadow-black/50">
                    <SelectItem value="PENDING" className="text-slate-700 dark:text-slate-300 text-sm focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-700 dark:focus:text-blue-300 rounded-lg cursor-pointer">PENDING</SelectItem>
                    <SelectItem value="PROCESSING" className="text-slate-700 dark:text-slate-300 text-sm focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-700 dark:focus:text-blue-300 rounded-lg cursor-pointer">PROCESSING</SelectItem>
                    <SelectItem value="SUCCESS" className="text-slate-700 dark:text-slate-300 text-sm focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-700 dark:focus:text-blue-300 rounded-lg cursor-pointer">SUCCESS (Selesai)</SelectItem>
                    <SelectItem value="FAILED" className="text-slate-700 dark:text-slate-300 text-sm focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-700 dark:focus:text-blue-300 rounded-lg cursor-pointer">FAILED (Gagal)</SelectItem>
                    <SelectItem value="REFUNDED" className="text-slate-700 dark:text-slate-300 text-sm focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-700 dark:focus:text-blue-300 rounded-lg cursor-pointer">REFUNDED (Saldo Dikembalikan)</SelectItem>
                    <SelectItem value="CANCELED" className="text-slate-700 dark:text-slate-300 text-sm focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-700 dark:focus:text-blue-300 rounded-lg cursor-pointer">CANCELED (Batal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Serial Number (SN)</label>
                <Input
                  value={editSn}
                  onChange={e => setEditSn(e.target.value)}
                  placeholder="Masukkan SN produk / Voucher Code..."
                  className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-sm focus:ring-blue-500/30 rounded-xl h-10 transition-all"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setEditOrder(null)} className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-xl h-10 transition-all">
              Batal
            </Button>
            <Button
              onClick={handleSaveStatus}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 rounded-xl h-10 px-4 flex items-center justify-center gap-2 transition-all"
            >
              <Save className="size-4" /> Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
