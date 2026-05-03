"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEye, FiFilter, FiDownload, FiDollarSign } from "react-icons/fi";
import { fetchAdminTransactions, Transaction } from "@/services/transaction.client";

const statusMap: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: "Berhasil", color: "bg-green-100 text-green-700" },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  FAILED: { label: "Gagal", color: "bg-red-100 text-red-700" },
};

export interface TransactionsTableProps {
  defaultType?: string;
  defaultCategory?: string;
}

export default function TransactionsTable({ defaultType, defaultCategory }: TransactionsTableProps = {}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>Daftar Transaksi</CardTitle>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama/deskripsi..." className="w-48" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800">
            <option value="">Semua Status</option>
            <option value="SUCCESS">Berhasil</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Gagal</option>
          </select>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36" />
          <span>-</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36" />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setStartDate(""); setEndDate(""); setStatus(""); setSearch(""); }}><FiFilter />Reset</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('pdf')}><FiDownload />PDF</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('excel')}><FiDownload />Excel</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isError && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            Gagal mengambil data transaksi: {(error as Error).message}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>ID Trx</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Produk/Deskripsi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Harga</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">Memuat data...</TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((trx, idx) => {
                  const statusDisplay = getStatusDisplay(trx.status);
                  return (
                    <TableRow key={trx.id}>
                      <TableCell>{offset + idx + 1}</TableCell>
                      <TableCell className="font-medium">{trx.id}</TableCell>
                      <TableCell>{trx.type}</TableCell>
                      <TableCell>{trx.userName || "Guest"}</TableCell>
                      <TableCell>{trx.metadata?.productName || trx.description}</TableCell>
                      <TableCell>{new Date(trx.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${statusDisplay.color}`}>{statusDisplay.label}</span>
                      </TableCell>
                      <TableCell>Rp {trx.amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => setDetailId(trx.id)}><FiEye /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-400">Tidak ada data transaksi</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* Pagination */}
      {!isLoading && transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 pb-4 gap-4">
          <span className="text-xs text-gray-500">
            Menampilkan {offset + 1} - {Math.min(offset + pageSize, totalItem)} dari {totalItem} transaksi
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
            <span className="text-xs px-2 font-medium">Halaman {page} dari {totalPage > 0 ? totalPage : 1}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPage} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
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
                  <h3 className="text-lg font-semibold">{detailTrx.metadata?.productName || detailTrx.description}</h3>
                  <p className="text-sm text-gray-500">Trx ID: {detailTrx.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusDisplay(detailTrx.status).color}`}>
                  {getStatusDisplay(detailTrx.status).label}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-medium text-sm">{new Date(detailTrx.createdAt).toLocaleString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Metode Bayar</p>
                    <p className="font-medium text-sm">{detailTrx.paymentMethod || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pelanggan</p>
                    <p className="font-medium text-sm">{detailTrx.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tipe Transaksi</p>
                    <p className="font-medium text-sm">{detailTrx.type}</p>
                  </div>
                </div>

                {detailTrx.metadata?.dataNo && (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div>
                      <p className="text-xs text-gray-500">Tujuan (No/ID/Zone)</p>
                      <p className="font-medium text-sm">
                        {detailTrx.metadata.dataNo}
                        {detailTrx.metadata.dataId ? ` (${detailTrx.metadata.dataId})` : ""}
                      </p>
                    </div>
                  </>
                )}

                {detailTrx.metadata?.sn && (
                  <div>
                    <p className="text-xs text-gray-500">Serial Number / VSN</p>
                    <p className="font-medium text-sm break-all">{detailTrx.metadata.sn}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Ringkasan Pembayaran</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>Rp {detailTrx.amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Layanan</span>
                    <span>Rp 0</span>
                  </div>
                  {detailTrx.metadata?.profit !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimasi Profit</span>
                      <span className="text-green-600">Rp {Number(detailTrx.metadata.profit).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>Rp {detailTrx.amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDetailId(null)}>
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
