"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminInvoices, approveInvoice, rejectInvoice } from "@/services/topup.client";
import { AdminTopupInvoice } from "@/types/topup";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEye, FiFilter, FiCheck, FiX, FiDollarSign, FiClock, FiUser, FiCreditCard, FiFileText, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

const statusMap: Record<string, { label: string; color: string; dotColor: string }> = {
  PAID: { label: "Disetujui", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", dotColor: "bg-emerald-500" },
  PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800", dotColor: "bg-amber-500" },
  EXPIRED: { label: "Expired", color: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700", dotColor: "bg-gray-400" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800", dotColor: "bg-red-500" },
};

const PAGE_SIZE = 20;

export default function TopupsTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const offset = (page - 1) * PAGE_SIZE;

  // Build query params for the admin endpoint
  const queryParams = {
    search: search || undefined,
    status: status || undefined,
    paymentMethod: paymentMethod || undefined,
    startDate: startDate ? new Date(startDate + 'T00:00:00').toISOString() : undefined,
    endDate: endDate ? new Date(endDate + 'T23:59:59').toISOString() : undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const { data: response, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['adminTopupInvoices', queryParams],
    queryFn: () => getAdminInvoices(queryParams),
    placeholderData: (prev) => prev,
  });

  const invoices = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / PAGE_SIZE) || 1;

  const approveMutation = useMutation({
    mutationFn: approveInvoice,
    onSuccess: () => {
      toast.success('Top up disetujui');
      queryClient.invalidateQueries({ queryKey: ['adminTopupInvoices'] });
      setDetailId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menyetujui top up');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectInvoice,
    onSuccess: () => {
      toast.success('Top up ditolak');
      queryClient.invalidateQueries({ queryKey: ['adminTopupInvoices'] });
      setDetailId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menolak top up');
    }
  });

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [search, status, paymentMethod, startDate, endDate]);

  const detailInv = invoices.find((t: AdminTopupInvoice) => t.id === detailId);

  const getStatusDisplay = (statusCode: string) => {
    return statusMap[statusCode] || { label: statusCode, color: "bg-gray-50 text-gray-600 border-gray-200", dotColor: "bg-gray-400" };
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Daftar Invoice Top Up</CardTitle>
          {isFetching && !isLoading && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              <span>Memperbarui...</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Pencarian</span>
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kode invoice, nama, email..."
              className="w-full md:w-64 bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Disetujui (PAID)</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Metode Bayar</span>
            <Input
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              placeholder="QRIS, BCA, ..."
              className="w-full md:w-36 bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Tanggal Mulai</span>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full md:w-40 bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto mt-5">
            <span className="hidden md:inline text-gray-400 font-bold">-</span>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-xs font-medium text-gray-500">Tanggal Selesai</span>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full md:w-40 bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-auto mt-5">
            <Button
              variant="outline"
              className="gap-2 bg-white dark:bg-gray-800"
              onClick={() => { setStatus(""); setSearch(""); setPaymentMethod(""); setStartDate(""); setEndDate(""); }}
            >
              <FiFilter /> Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
              <FiAlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Gagal memuat data</p>
            <p className="text-sm text-gray-500 max-w-md">
              {(error as Error)?.message || 'Terjadi kesalahan saat mengambil data invoice.'}
            </p>
            <Button
              variant="outline"
              className="gap-2 mt-2"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['adminTopupInvoices'] })}
            >
              <FiRefreshCw className="h-4 w-4" /> Coba Lagi
            </Button>
          </div>
        )}

        {!isError && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow>
                  <TableHead className="w-[50px] whitespace-nowrap">No</TableHead>
                  <TableHead className="whitespace-nowrap">Kode Invoice</TableHead>
                  <TableHead className="whitespace-nowrap">Nama User</TableHead>
                  <TableHead className="whitespace-nowrap">Email User</TableHead>
                  <TableHead className="whitespace-nowrap">Nominal</TableHead>
                  <TableHead className="whitespace-nowrap">Metode Bayar</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Dibuat</TableHead>
                  <TableHead className="whitespace-nowrap">Kadaluarsa</TableHead>
                  <TableHead className="w-[100px] whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : invoices.length > 0 ? (
                  invoices.map((inv: AdminTopupInvoice, idx: number) => {
                    const statusDisplay = getStatusDisplay(inv.status);
                    return (
                      <TableRow key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="text-gray-500">{offset + idx + 1}</TableCell>
                        <TableCell className="font-medium text-blue-600 dark:text-blue-400">{inv.invoiceCode}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{inv.user?.name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{inv.user?.email || '-'}</span>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          Rp {inv.amount.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300">
                            {inv.paymentMethod || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dotColor}`}></span>
                            {statusDisplay.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {new Date(inv.createdAt).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {inv.expiredAt
                            ? new Date(inv.expiredAt).toLocaleString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDetailId(inv.id)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                              title="Lihat Detail"
                            >
                              <FiEye className="h-4 w-4" />
                            </Button>
                            {inv.status === 'PENDING' && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => approveMutation.mutate(inv.invoiceCode)}
                                  disabled={approveMutation.isPending || rejectMutation.isPending}
                                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
                                  title="Approve"
                                >
                                  <FiCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => rejectMutation.mutate(inv.invoiceCode)}
                                  disabled={approveMutation.isPending || rejectMutation.isPending}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50"
                                  title="Reject"
                                >
                                  <FiX className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FiFileText className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Data tidak ditemukan</p>
                        <p className="text-sm">Tidak ada invoice yang sesuai dengan filter saat ini</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Pagination */}
      {!isLoading && !isError && invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 pb-6 gap-4">
          <span className="text-sm text-gray-500">
            Menampilkan <span className="font-medium text-gray-900 dark:text-gray-100">{offset + 1}</span> hingga <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min(offset + PAGE_SIZE, totalItem)}</span> dari <span className="font-medium text-gray-900 dark:text-gray-100">{totalItem}</span> invoice
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4"
            >
              Sebelumnya
            </Button>
            <div className="px-4 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700">
              {page} / {totalPage}
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

      {/* Detail Modal */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
          {detailInv && (
            <>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-bold">Detail Invoice Top Up</DialogTitle>
                    <p className="text-blue-100 text-sm mt-1">Kode: {detailInv.invoiceCode}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                    <FiDollarSign className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
                {/* Amount & Status */}
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nominal</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Rp {detailInv.amount.toLocaleString('id-ID')}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusDisplay(detailInv.status).color}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusDisplay(detailInv.status).dotColor}`}></span>
                    {getStatusDisplay(detailInv.status).label}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 border border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiUser className="h-3 w-3" /> Nama User
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{detailInv.user?.name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiUser className="h-3 w-3" /> Email User
                      </div>
                      <p className="font-semibold text-sm break-all text-gray-900 dark:text-gray-100">{detailInv.user?.email || '-'}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiCreditCard className="h-3 w-3" /> Metode Bayar
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {detailInv.paymentMethod || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiFileText className="h-3 w-3" /> Payment Ref
                      </div>
                      <p className="font-semibold text-sm break-all text-gray-900 dark:text-gray-100">
                        {detailInv.paymentRef || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiClock className="h-3 w-3" /> Dibuat
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {new Date(detailInv.createdAt).toLocaleString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiClock className="h-3 w-3" /> Kadaluarsa
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {detailInv.expiredAt
                          ? new Date(detailInv.expiredAt).toLocaleString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-3">
                  <Button
                    className="flex-1 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 border-0"
                    onClick={() => setDetailId(null)}
                  >
                    Tutup
                  </Button>
                  {detailInv.status === 'PENDING' && (
                    <>
                      <Button
                        variant="destructive"
                        className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => rejectMutation.mutate(detailInv.invoiceCode)}
                        disabled={rejectMutation.isPending || approveMutation.isPending}
                      >
                        <FiX /> Tolak
                      </Button>
                      <Button
                        className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => approveMutation.mutate(detailInv.invoiceCode)}
                        disabled={rejectMutation.isPending || approveMutation.isPending}
                      >
                        <FiCheck /> Setujui
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
