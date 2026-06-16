"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEye, FiFilter, FiDownload, FiDollarSign, FiRefreshCw } from "react-icons/fi";
import { fetchAdminTransactions, Transaction, syncDigiflazz, syncPendingDigiflazz } from "@/services/transaction.client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const statusMap: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: "Berhasil", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" },
  PENDING: { label: "Pending", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20" },
  PROCESSING: { label: "Proses", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20" },
  FAILED: { label: "Gagal", color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20" },
};

export interface TransactionsTableProps {
  defaultType?: string;
  defaultCategory?: string;
  startDate?: string;
  endDate?: string;
}

export default function TransactionsTable({
  defaultType,
  defaultCategory,
  startDate: propStartDate,
  endDate: propEndDate,
}: TransactionsTableProps = {}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

  const startDate = propStartDate !== undefined ? propStartDate : localStartDate;
  const endDate = propEndDate !== undefined ? propEndDate : localEndDate;

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Derived query parameters
  const offset = (page - 1) * pageSize;

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['adminTransactions', { search, status, startDate, endDate, limit: pageSize, offset, type: defaultType, category: defaultCategory }],
    queryFn: () => fetchAdminTransactions({ search, status, startDate, endDate, limit: pageSize, offset, type: defaultType, category: defaultCategory }),
  });

  const transactions = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize);

  const [detailId, setDetailId] = useState<string | null>(null);
  const detailTrx = transactions.find((t) => t.id === detailId);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [search, status, startDate, endDate]);

  const handleExport = (type: 'pdf' | 'excel') => {
    alert(`Ekspor ke ${type.toUpperCase()} belum diimplementasikan`);
  };

  const getStatusDisplay = (statusCode: string) => {
    return statusMap[statusCode] || { label: statusCode, color: "bg-gray-100 text-gray-700" };
  };

  const handleSyncSingle = async (id: string) => {
    try {
      setSyncingIds(prev => new Set(prev).add(id));
      await syncDigiflazz(id);
      toast.success("Transaksi berhasil disinkronkan");
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
    } catch (err: any) {
      toast.error(err.message || "Gagal sync transaksi");
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSyncBulk = async () => {
    try {
      setIsBulkSyncing(true);
      const res = await syncPendingDigiflazz(25);
      toast.success(`Sync pending selesai: ${res.success || 0} berhasil, ${res.failed || 0} gagal dari ${res.total || 0} transaksi`);
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
    } catch (err: any) {
      toast.error(err.message || "Gagal sync pending transaksi");
    } finally {
      setIsBulkSyncing(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-md shadow-xs overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-900">
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Daftar Transaksi</CardTitle>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama/deskripsi..."
            className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="SUCCESS">Berhasil</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Gagal</option>
          </select>
          {!propStartDate && !propEndDate && (
            <>
              <Input
                type="date"
                value={localStartDate}
                onChange={e => setLocalStartDate(e.target.value)}
                className="w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="date"
                value={localEndDate}
                onChange={e => setLocalEndDate(e.target.value)}
                className="w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
            onClick={() => {
              if (!propStartDate) setLocalStartDate("");
              if (!propEndDate) setLocalEndDate("");
              setStatus("");
              setSearch("");
            }}
          >
            <FiFilter />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white border-none rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            onClick={handleSyncBulk}
            disabled={isBulkSyncing}
          >
            <FiRefreshCw className={isBulkSyncing ? "animate-spin" : ""} />
            Sync Pending Digiflazz
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
            onClick={() => handleExport('pdf')}
          >
            <FiDownload />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
            onClick={() => handleExport('excel')}
          >
            <FiDownload />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isError && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            Gagal mengambil data transaksi: {(error as Error).message}
          </div>
        )}

        <div className="overflow-x-auto border border-slate-100 dark:border-slate-900 rounded-xl">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">No</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">ID Trx</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Tipe</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Pelanggan</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Produk/Deskripsi</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Tanggal</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Status</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Total Harga</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500 dark:text-slate-400">Memuat data...</TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((trx, idx) => {
                  const statusDisplay = getStatusDisplay(trx.status);
                  return (
                    <TableRow key={trx.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <TableCell className="text-slate-600 dark:text-slate-400">{offset + idx + 1}</TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">{trx.id}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                          {trx.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-900 dark:text-white font-medium">{trx.userName || "Guest"}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300 font-medium">{trx.metadata?.productName || trx.description}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">{new Date(trx.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center ${statusDisplay.color}`}>
                          {statusDisplay.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-white">Rp {trx.amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            onClick={() => setDetailId(trx.id)}
                            title="Detail"
                          >
                            <FiEye className="w-4 h-4" />
                          </Button>
                          {(trx.status === "PENDING" || trx.status === "PROCESSING") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                              onClick={() => handleSyncSingle(trx.id)}
                              disabled={syncingIds.has(trx.id)}
                              title="Sync Digiflazz"
                            >
                              <FiRefreshCw className={`w-4 h-4 ${syncingIds.has(trx.id) ? "animate-spin" : ""}`} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400 dark:text-slate-500">Tidak ada data transaksi</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* Pagination */}
      {!isLoading && transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 pb-6 gap-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} transaksi
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Sebelumnya
            </Button>
            <span className="text-xs px-2 font-semibold text-slate-700 dark:text-slate-300">Halaman {page} dari {totalPage > 0 ? totalPage : 1}</span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              disabled={page >= totalPage}
              onClick={() => setPage(p => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-semibold">Detail Transaksi</DialogTitle>
                <p className="text-blue-100 text-sm mt-1">Informasi lengkap transaksi</p>
              </div>
              <div className="bg-white/20 rounded-full p-2">
                <FiDollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          {detailTrx && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{detailTrx.metadata?.productName || detailTrx.description}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trx ID: {detailTrx.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusDisplay(detailTrx.status).color}`}>
                  {getStatusDisplay(detailTrx.status).label}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Tanggal</p>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{new Date(detailTrx.createdAt).toLocaleString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Metode Bayar</p>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{detailTrx.paymentMethod || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pelanggan</p>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{detailTrx.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tipe Transaksi</p>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{detailTrx.type}</p>
                  </div>
                </div>

                {detailTrx.metadata?.dataNo && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-900 my-2"></div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tujuan (No/ID/Zone)</p>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {detailTrx.metadata.dataNo}
                        {detailTrx.metadata.dataId ? ` (${detailTrx.metadata.dataId})` : ""}
                      </p>
                    </div>
                  </>
                )}

                {detailTrx.metadata?.sn && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Serial Number / VSN</p>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 break-all select-all">{detailTrx.metadata.sn}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white">Ringkasan Pembayaran</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {detailTrx.amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Biaya Layanan</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Rp 0</span>
                  </div>
                  {detailTrx.metadata?.profit !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Estimasi Profit</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Rp {Number(detailTrx.metadata.profit).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 dark:border-slate-900 my-1"></div>
                  <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span>Rp {detailTrx.amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300" onClick={() => setDetailId(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
