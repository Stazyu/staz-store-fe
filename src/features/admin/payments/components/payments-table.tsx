"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Eye, Search, Filter, RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { fetchAdminPayments, Payment } from "@/services/payment.client";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  PAID: { label: "Lunas", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  FAILED: { label: "Gagal/Batal", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: XCircle },
};

export default function PaymentsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [detailId, setDetailId] = useState<string | null>(null);

  // Derived query parameters
  const offset = (page - 1) * pageSize;

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminPayments', { search, status, startDate, endDate, limit: pageSize, offset }],
    queryFn: () => fetchAdminPayments({ search, status, startDate, endDate, limit: pageSize, offset }),
  });

  const payments = response?.data || [];
  const totalItem = response?.pagination?.total || 0;
  const totalPage = Math.ceil(totalItem / pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, status, startDate, endDate]);

  const getStatusDisplay = (statusCode: string) => {
    return statusMap[statusCode] || { label: statusCode, color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: AlertCircle };
  };

  const activeDetailPayment = payments.find(p => p.id === detailId);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
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
            <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
              <CreditCard className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Pembayaran</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Kelola invoice pembayaran dari payment gateway untuk order game dan deposit saldo.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-800"
            >
              <RefreshCw className="size-4 mr-2" /> Segarkan
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Daftar Pembayaran</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Invoice dari payment gateway (tipe: ORDER atau DEPOSIT).</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari invoice/customer..."
                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-sm focus:ring-blue-500/20"
              />
            </div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">Semua Status</option>
              <option value="PAID" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">LUNAS (PAID)</option>
              <option value="PENDING" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">PENDING</option>
              <option value="FAILED" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">GAGAL/BATAL</option>
            </select>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-36 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs"
            />
            <span className="text-slate-400 dark:text-slate-600 text-sm">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-36 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs"
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
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <Filter className="size-4 mr-2" /> Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-12 text-center text-slate-500 dark:text-slate-400 font-bold">No</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Invoice</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Tipe</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Reference</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Customer</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Metode</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Channel</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Amount</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Fee</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Status</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Expired At</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Paid At</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="size-8 animate-spin text-blue-500" />
                        <p className="text-sm font-medium">Memuat data pembayaran...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={13} className="py-20 text-center text-rose-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-10 text-rose-500" />
                        <p className="text-sm font-bold">Terjadi Kesalahan</p>
                        <p className="text-xs text-slate-400">{(error as Error).message}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="size-10 text-slate-400 dark:text-slate-600" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada data pembayaran</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Tidak ada data invoice pembayaran yang cocok dengan filter saat ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment, idx) => {
                    const statusConfig = getStatusDisplay(payment.status);
                    const Icon = statusConfig.icon;

                    return (
                      <TableRow key={payment.id} className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <TableCell className="text-center text-xs text-slate-500 dark:text-slate-400">{offset + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{payment.id}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            payment.type === "ORDER" 
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" 
                              : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                          }`}>
                            {payment.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]" title={payment.reference}>
                          {payment.reference || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{payment.userName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{payment.userEmail || ""}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-350 font-medium">{payment.paymentMethod}</TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-350 font-medium">{payment.channel}</TableCell>
                        <TableCell className="text-sm font-bold text-slate-900 dark:text-slate-200">
                          Rp {payment.amount.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                          Rp {payment.fee.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            <Icon className="size-3" />
                            {statusConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                          {payment.expiredAt ? new Date(payment.expiredAt).toLocaleString("id-ID") : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleString("id-ID") : "-"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDetailId(payment.id)}
                            className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            title="Detail"
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

        {/* Pagination */}
        {!isLoading && payments.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-100 dark:border-slate-800 gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} pembayaran
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent"
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{page}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-600">/</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{totalPage || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPage}
                onClick={() => setPage(p => p + 1)}
                className="h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-transparent"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-0 overflow-hidden text-slate-900 dark:text-slate-200">
          <div className="bg-linear-to-r from-blue-700 to-indigo-650 p-6 text-white">
            <DialogTitle className="text-xl font-bold">Detail Pembayaran</DialogTitle>
            <p className="text-xs text-blue-200 mt-1">Detil rekaman transaksi pembayaran</p>
          </div>
          {activeDetailPayment && (
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeDetailPayment.id}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tipe: {activeDetailPayment.type}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusDisplay(activeDetailPayment.status).color}`}>
                  {getStatusDisplay(activeDetailPayment.status).label}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{activeDetailPayment.reference || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Customer</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailPayment.userName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Metode</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Channel</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailPayment.channel}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Tanggal Dibuat</span>
                  <span className="text-slate-800 dark:text-slate-200">{new Date(activeDetailPayment.createdAt).toLocaleString("id-ID")}</span>
                </div>
                {activeDetailPayment.expiredAt && (
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Kedaluwarsa</span>
                    <span className="text-slate-800 dark:text-slate-200">{new Date(activeDetailPayment.expiredAt).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Tanggal Bayar</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeDetailPayment.paidAt ? new Date(activeDetailPayment.paidAt).toLocaleString("id-ID") : "-"}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Biaya Layanan</span>
                  <span className="text-slate-800 dark:text-slate-200">Rp {activeDetailPayment.fee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-base text-slate-900 dark:text-white">
                  <span>Total Pembayaran</span>
                  <span>Rp {activeDetailPayment.amount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300" onClick={() => setDetailId(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
