"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEye, FiFilter, FiDownload, FiDollarSign, FiRefreshCw } from "react-icons/fi";
import { fetchTransactionsByCategory, fetchAdminTransactions, syncDigiflazz, syncPendingDigiflazz } from "@/services/transaction.client";
import { fetchCategories } from "@/services/category.client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const statusMap: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: "Berhasil", color: "bg-green-100 text-green-700" },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  PROCESSING: { label: "Proses", color: "bg-blue-100 text-blue-700" },
  FAILED: { label: "Gagal", color: "bg-red-100 text-red-700" },
};

export default function TransactionsByCategoryTable() {
  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Derived query parameters
  const offset = (page - 1) * pageSize;

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: response, isLoading: isLoadingTrx, isError, error } = useQuery({
    queryKey: ['transactionsByCategory', categoryId, search, status, startDate, endDate, pageSize, offset],
    queryFn: () => {
      if (categoryId === "all") {
        return fetchAdminTransactions({ search, status, startDate, endDate, limit: pageSize, offset });
      }
      return fetchTransactionsByCategory(categoryId, { search, status, startDate, endDate, limit: pageSize, offset });
    },
    enabled: true,
  });

  const transactions = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize);

  const [detailId, setDetailId] = useState<string | null>(null);
  const detailTrx = transactions.find((t) => t.id === detailId);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [categoryId, search, status, startDate, endDate]);

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
      queryClient.invalidateQueries({ queryKey: ['transactionsByCategory'] });
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
      queryClient.invalidateQueries({ queryKey: ['transactionsByCategory'] });
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
    } catch (err: any) {
      toast.error(err.message || "Gagal sync pending transaksi");
    } finally {
      setIsBulkSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Transaksi per Kategori</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              onClick={handleSyncBulk}
              disabled={isBulkSyncing}
            >
              <FiRefreshCw className={isBulkSyncing ? "animate-spin" : ""} />
              Sync Pending Digiflazz
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('pdf')}><FiDownload />PDF</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('excel')}><FiDownload />Excel</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Pilih Kategori <span className="text-red-500">*</span></span>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
              disabled={isLoadingCategories}
            >
              <option value="all">-- Semua Transaksi --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Pencarian</span>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari trx ID/Produk/User..." className="w-full md:w-48 bg-white dark:bg-gray-900" />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]">
              <option value="">Semua Status</option>
              <option value="SUCCESS">Berhasil</option>
              <option value="PROCESSING">Proses</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Gagal</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Tanggal Mulai</span>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full md:w-36 bg-white dark:bg-gray-900" />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto mt-5">
            <span className="hidden md:inline text-gray-400 font-bold">-</span>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Tanggal Selesai</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full md:w-36 bg-white dark:bg-gray-900" />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto mt-5">
            <Button variant="outline" className="gap-2 bg-white dark:bg-gray-800" onClick={() => { setStartDate(""); setEndDate(""); setStatus(""); setSearch(""); }}>
              <FiFilter />Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isError && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800/80 border border-red-200 dark:border-red-800 dark:text-red-400" role="alert">
            Gagal mengambil data transaksi: {(error as Error).message}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead className="w-[50px] whitespace-nowrap">No</TableHead>
                <TableHead className="whitespace-nowrap">ID Transaksi</TableHead>
                <TableHead className="whitespace-nowrap">User</TableHead>
                <TableHead className="whitespace-nowrap min-w-[200px]">Produk</TableHead>
                <TableHead className="whitespace-nowrap">Kategori</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                <TableHead className="whitespace-nowrap">Sales Channel</TableHead>
                <TableHead className="whitespace-nowrap">Created At</TableHead>
                <TableHead className="w-[50px] whitespace-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTrx ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((trx, idx) => {
                  const statusDisplay = getStatusDisplay(trx.status);
                  return (
                    <TableRow key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>{offset + idx + 1}</TableCell>
                      <TableCell className="font-medium text-blue-600 dark:text-blue-400">{trx.id}</TableCell>
                      <TableCell>{trx.userName || "Guest"}</TableCell>
                      <TableCell className="font-medium">
                        {trx.metadata?.productName || trx.description}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300">
                          {trx.metadata?.categoryName || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                        Rp {trx.amount.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.color} ${statusDisplay.color.replace('bg-', 'border-').replace('100', '200')}`}>
                          {statusDisplay.label}
                        </span>
                      </TableCell>
                      <TableCell>{trx.paymentMethod || "-"}</TableCell>
                      <TableCell>{trx.metadata?.salesChannel || "WEB"}</TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(trx.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setDetailId(trx.id)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50" title="Detail">
                            <FiEye className="h-4 w-4" />
                          </Button>
                          {(trx.status === "PENDING" || trx.status === "PROCESSING") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                              onClick={() => handleSyncSingle(trx.id)}
                              disabled={syncingIds.has(trx.id)}
                              title="Sync Digiflazz"
                            >
                              <FiRefreshCw className={`h-4 w-4 ${syncingIds.has(trx.id) ? "animate-spin" : ""}`} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Data tidak ditemukan</p>
                    <p className="text-sm">Tidak ada transaksi yang sesuai dengan filter saat ini</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination */}
      {!isLoadingTrx && transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 pb-6 gap-4">
          <span className="text-sm text-gray-500">
            Menampilkan <span className="font-medium text-gray-900 dark:text-gray-100">{offset + 1}</span> hingga <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min(offset + pageSize, totalItem)}</span> dari <span className="font-medium text-gray-900 dark:text-gray-100">{totalItem}</span> data
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4"
            >
              Sebelumnya
            </Button>
            <div className="px-4 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700">
              {page} / {totalPage > 0 ? totalPage : 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPage}
              onClick={() => setPage(p => p + 1)}
              className="px-4"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold">Detail Transaksi</DialogTitle>
                <p className="text-blue-100 text-sm mt-1">{detailTrx?.id}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                <FiDollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {detailTrx && (
            <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {detailTrx.metadata?.productName || detailTrx.description}
                  </h3>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {detailTrx.metadata?.categoryName || "Unknown"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusDisplay(detailTrx.status).color} ${getStatusDisplay(detailTrx.status).color.replace('bg-', 'border-').replace('100', '200')}`}>
                  {getStatusDisplay(detailTrx.status).label}
                </span>
              </div>

              {/* Message from meta */}
              {detailTrx.metadata?.message && (
                <div className={`p-3 rounded-md text-sm ${detailTrx.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : detailTrx.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                  <strong>Pesan Sistem:</strong> {detailTrx.metadata.message}
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Transaksi</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {new Date(detailTrx.createdAt).toLocaleString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Metode Pembayaran</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{detailTrx.paymentMethod || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{detailTrx.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Channel</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{detailTrx.metadata?.salesChannel || 'WEB'}</p>
                  </div>
                </div>

                {detailTrx.metadata?.dataNo && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan (No/ID/Zone)</p>
                      <p className="font-bold text-base text-gray-900 dark:text-gray-100">
                        {detailTrx.metadata.dataNo}
                        {detailTrx.metadata.dataId ? ` (${detailTrx.metadata.dataId})` : ""}
                      </p>
                    </div>
                  </>
                )}

                {detailTrx.metadata?.sn && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number / SN</p>
                      <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 mt-1">
                        <p className="font-mono font-medium text-sm text-gray-900 dark:text-gray-100 break-all">{detailTrx.metadata.sn}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Rincian Harga</h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harga Produk</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Rp {(Number(detailTrx.amount) - Number(detailTrx.metadata.profit)).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Biaya Layanan</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Rp 0</span>
                  </div>

                  {/* Admin specific data: only visible if property exists */}
                  {detailTrx.metadata?.profit !== undefined && (
                    <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1">
                      <span className="text-green-700 dark:text-green-400 font-medium">Estimasi Profit</span>
                      <span className="text-green-700 dark:text-green-400 font-bold">+ Rp {Number(detailTrx.metadata.profit).toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-gray-300 dark:border-gray-700 my-2"></div>
                  <div className="flex justify-between items-center text-base">
                    <span className="font-bold text-gray-900 dark:text-gray-100">Total Pembayaran</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Rp {detailTrx.amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 border-0" onClick={() => setDetailId(null)}>
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
