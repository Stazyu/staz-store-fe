"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ShoppingCart, RefreshCw, Eye, Search, Filter, CheckCircle2, XCircle, AlertCircle, Clock, Save } from "lucide-react";
import { fetchAdminOrders, updateOrderStatus, syncDigiflazz, syncPendingDigiflazz, Order } from "@/services/order.client";
import { toast } from "react-hot-toast";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  SUCCESS: { label: "Berhasil", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  PROCESSING: { label: "Proses", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: RefreshCw },
  FAILED: { label: "Gagal", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: XCircle },
  REFUNDED: { label: "Refund", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: AlertCircle },
  CANCELED: { label: "Dibatalkan", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: XCircle },
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [detailId, setDetailId] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editSn, setEditSn] = useState("");

  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Derived query parameters
  const offset = (page - 1) * pageSize;

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminOrders', { search, status, startDate, endDate, limit: pageSize, offset }],
    queryFn: () => fetchAdminOrders({ search, status, startDate, endDate, limit: pageSize, offset }),
  });

  const orders = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, status, startDate, endDate]);

  const getStatusDisplay = (statusCode: string) => {
    return statusMap[statusCode] || { label: statusCode, color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: AlertCircle };
  };

  const getPaymentStatusDisplay = (orderStatus: string) => {
    if (orderStatus === "SUCCESS" || orderStatus === "REFUNDED") {
      return { label: "Lunas", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    }
    if (orderStatus === "PENDING" || orderStatus === "PROCESSING") {
      return { label: "Pending", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
    return { label: "Gagal/Batal", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
  };

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

  const activeDetailOrder = orders.find(o => o.trxId === detailId);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
              <ShoppingCart className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Kelola Order</h1>
              <p className="text-sm text-slate-400">Kelola dan pantau seluruh transaksi pembelian produk game.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="size-4 mr-2" /> Segarkan
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSyncBulk}
              disabled={isBulkSyncing}
              className="bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold"
            >
              <RefreshCw className={`size-4 mr-2 ${isBulkSyncing ? "animate-spin" : ""}`} /> Sync Pending Digiflazz
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850">
          <div>
            <CardTitle className="text-lg font-bold">Daftar Transaksi Order</CardTitle>
            <CardDescription className="text-xs text-slate-450">Menampilkan pesanan game dari customer.</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari invoice/produk..."
                className="pl-9 h-9 border-slate-800 bg-slate-905/60 text-slate-350 text-sm focus:ring-blue-500/20"
              />
            </div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="border border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-slate-900 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Semua Status</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-36 h-9 border-slate-800 bg-slate-900 text-slate-300 text-xs"
            />
            <span className="text-slate-600 text-sm">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-36 h-9 border-slate-800 bg-slate-900 text-slate-300 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatus("");
                setStartDate("");
                setEndDate("");
              }}
              className="border-slate-800 hover:bg-slate-800 text-slate-400"
            >
              <Filter className="size-4 mr-2" /> Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-12 text-center text-slate-450 font-bold">No</TableHead>
                  <TableHead className="text-slate-400 font-bold">Invoice</TableHead>
                  <TableHead className="text-slate-400 font-bold">Customer</TableHead>
                  <TableHead className="text-slate-400 font-bold">Game</TableHead>
                  <TableHead className="text-slate-400 font-bold">Produk</TableHead>
                  <TableHead className="text-slate-400 font-bold">User ID / Server ID</TableHead>
                  <TableHead className="text-slate-400 font-bold">Total</TableHead>
                  <TableHead className="text-slate-400 font-bold text-center">Status Order</TableHead>
                  <TableHead className="text-slate-400 font-bold text-center">Status Pembayaran</TableHead>
                  <TableHead className="text-slate-400 font-bold">Tanggal</TableHead>
                  <TableHead className="text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="size-8 animate-spin text-blue-500" />
                        <p className="text-sm font-medium">Memuat data order...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-20 text-center text-rose-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-10 text-rose-500" />
                        <p className="text-sm font-bold">Terjadi Kesalahan</p>
                        <p className="text-xs text-slate-400">{(error as Error).message}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="size-10 text-slate-700" />
                        <p className="text-sm font-semibold text-slate-400">Belum ada data order</p>
                        <p className="text-xs text-slate-500">Tidak ada data order game yang cocok dengan filter saat ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, idx) => {
                    const statusConfig = getStatusDisplay(order.status);
                    const payConfig = getPaymentStatusDisplay(order.status);
                    const Icon = statusConfig.icon;

                    return (
                      <TableRow key={order.id} className="border-slate-900 hover:bg-slate-900/30 transition-colors">
                        <TableCell className="text-center text-xs text-slate-550">{offset + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-blue-400">{order.trxId}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-200">{order.user?.name || "Guest"}</p>
                          <p className="text-[10px] text-slate-500">{order.user?.email || ""}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-300 font-medium">{order.brandName}</TableCell>
                        <TableCell className="text-sm text-slate-250 font-medium max-w-[150px] truncate" title={order.productName}>
                          {order.productName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-400">
                          {order.dataNo}
                          {order.dataId ? ` (${order.dataId})` : ""}
                        </TableCell>
                        <TableCell className="text-sm font-bold text-slate-200">
                          Rp {order.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            <Icon className="size-3" />
                            {statusConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${payConfig.color}`}>
                            {payConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-450 whitespace-nowrap">
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
                              onClick={() => setDetailId(order.trxId)}
                              className="size-8 rounded-lg hover:bg-slate-800 hover:text-white"
                              title="Detail"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditClick(order)}
                              className="size-8 rounded-lg text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
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
                                className="size-8 rounded-lg text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
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
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-850 gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} pesanan
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-8 border-slate-800 text-slate-400"
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs font-bold text-blue-450">{page}</span>
                <span className="text-[10px] text-slate-650">/</span>
                <span className="text-xs font-bold text-slate-500">{totalPage || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPage}
                onClick={() => setPage(p => p + 1)}
                className="h-8 border-slate-800 text-slate-400"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-0 overflow-hidden text-slate-200">
          <div className="bg-linear-to-r from-blue-700 to-indigo-650 p-6 text-white">
            <DialogTitle className="text-xl font-bold">Detail Order</DialogTitle>
            <p className="text-xs text-blue-200 mt-1">Status dan kelengkapan order game</p>
          </div>
          {activeDetailOrder && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{activeDetailOrder.productName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Trx ID: {activeDetailOrder.trxId}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusDisplay(activeDetailOrder.status).color}`}>
                    {getStatusDisplay(activeDetailOrder.status).label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Tanggal Order</span>
                  <span className="font-medium">{new Date(activeDetailOrder.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Metode Pembayaran</span>
                  <span className="font-medium text-slate-350">{activeDetailOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Customer</span>
                  <span className="font-medium text-slate-350">{activeDetailOrder.user?.name || "Guest"}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Channel</span>
                  <span className="font-medium text-slate-350">{activeDetailOrder.salesChannel}</span>
                </div>
                <div className="col-span-2 border-t border-slate-900 my-2 pt-2"></div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">User ID / Server ID</span>
                  <span className="font-mono text-slate-300 font-medium">
                    {activeDetailOrder.dataNo}
                    {activeDetailOrder.dataId ? ` (${activeDetailOrder.dataId})` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Serial Number / SN</span>
                  <span className="font-mono text-sm text-slate-200 font-semibold break-all bg-slate-900/60 p-1.5 rounded border border-slate-800 block mt-0.5">
                    {activeDetailOrder.sn || "Belum tersedia"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Ringkasan Pembayaran</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Harga Jual</span>
                    <span>Rp {activeDetailOrder.price.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Harga Modal (Base)</span>
                    <span>Rp {activeDetailOrder.basePrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 font-medium">
                    <span>Estimasi Profit</span>
                    <span>Rp {activeDetailOrder.profit.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-slate-800 my-1"></div>
                  <div className="flex justify-between font-bold text-base text-white">
                    <span>Total Bayar</span>
                    <span>Rp {activeDetailOrder.price.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-800" onClick={() => setDetailId(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-800 rounded-2xl text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Ubah Status Order</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Perbarui status pemrosesan dan input serial number order manual.
            </DialogDescription>
          </DialogHeader>
          {editOrder && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Status Order</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full border border-slate-800 rounded-lg p-2.5 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SUCCESS">SUCCESS (Selesai)</option>
                  <option value="FAILED">FAILED (Gagal)</option>
                  <option value="REFUNDED">REFUNDED (Saldo Dikembalikan)</option>
                  <option value="CANCELED">CANCELED (Batal)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Serial Number (SN)</label>
                <Input
                  value={editSn}
                  onChange={e => setEditSn(e.target.value)}
                  placeholder="Masukkan SN produk / Voucher Code..."
                  className="border-slate-800 bg-slate-900 text-slate-200 text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOrder(null)} className="border-slate-800">
              Batal
            </Button>
            <Button
              onClick={handleSaveStatus}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20"
            >
              <Save className="size-4 mr-2" /> Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
