"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FiEye, FiFilter, FiDownload, FiDollarSign } from "react-icons/fi";

interface Transaction {
  id: string;
  idTrx: string;
  trxDari: string;
  customer: string;
  product: string;
  date: string;
  status: "success" | "pending" | "failed";
  total: number;
}

const statusMap = {
  success: { label: "Berhasil", color: "bg-green-100 text-green-700" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  failed: { label: "Gagal", color: "bg-red-100 text-red-700" },
};

const initialTransactions: Transaction[] = [
  { id: "TRX001", idTrx: "INV-001", trxDari: "Mobile App", customer: "Wahyu Hidayat", product: "Diamond ML 86", date: "2025-06-13 10:12", status: "success", total: 150000 },
  { id: "TRX002", idTrx: "INV-002", trxDari: "Website", customer: "Budi Santoso", product: "Pulsa Telkomsel 50K", date: "2025-06-13 09:47", status: "success", total: 51000 },
  { id: "TRX003", idTrx: "INV-003", trxDari: "Mobile App", customer: "Siti Aminah", product: "OVO Topup 100K", date: "2025-06-13 09:32", status: "pending", total: 101000 },
  { id: "TRX004", idTrx: "INV-004", trxDari: "WhatsApp", customer: "Wahyu Hidayat", product: "Diamond FF 70", date: "2025-06-13 08:59", status: "failed", total: 90000 },
  { id: "TRX005", idTrx: "INV-005", trxDari: "Website", customer: "Budi Santoso", product: "Gopay 50K", date: "2025-06-12 21:12", status: "success", total: 51000 },
];

export default function TransactionsTable() {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filter transaksi
  const filtered = transactions.filter(trx => {
    const trxDate = trx.date.split(" ")[0];
    const inDateRange = (!startDate || trxDate >= startDate) && (!endDate || trxDate <= endDate);
    return (
      (status ? trx.status === status : true) &&
      (search ? (
        trx.customer.toLowerCase().includes(search.toLowerCase()) ||
        trx.product.toLowerCase().includes(search.toLowerCase())
      ) : true) &&
      inDateRange
    );
  });
  // Pagination
  const totalPage = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const detailTrx = transactions.find(t => t.id === detailId);

  // Dummy export handler
  const handleExport = (type: 'pdf' | 'excel') => {
    alert(`Ekspor ke ${type.toUpperCase()} belum diimplementasikan (dummy)`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>Daftar Transaksi</CardTitle>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama pelanggan/produk..." className="w-48" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">Semua Status</option>
            <option value="success">Berhasil</option>
            <option value="pending">Pending</option>
            <option value="failed">Gagal</option>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>ID Trx</TableHead>
              <TableHead>Trx Dari</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Harga</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((trx, idx) => (
              <TableRow key={trx.id}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell className="font-medium">{trx.idTrx}</TableCell>
                <TableCell>{trx.trxDari}</TableCell>
                <TableCell>{trx.customer}</TableCell>
                <TableCell>{trx.product}</TableCell>
                <TableCell>{trx.date}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${statusMap[trx.status].color}`}>{statusMap[trx.status].label}</span>
                </TableCell>
                <TableCell>Rp {trx.total.toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => setDetailId(trx.id)}><FiEye /></Button>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400">Tidak ada data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {/* Pagination */}
      <div className="flex justify-between items-center px-4 pb-4">
        <span className="text-xs text-gray-500">Menampilkan {paginated.length ? ((page - 1) * pageSize + 1) : 0} - {(page - 1) * pageSize + paginated.length} dari {filtered.length} transaksi</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
          <span className="text-xs px-2">Halaman {page} / {totalPage || 1}</span>
          <Button variant="outline" size="sm" disabled={page === totalPage || totalPage === 0} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
        </div>
      </div>
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
              {/* Transaction Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{detailTrx.product}</h3>
                  <p className="text-sm text-gray-500">#{detailTrx.idTrx}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[detailTrx.status].color}`}>
                  {statusMap[detailTrx.status].label}
                </span>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-medium">{new Date(detailTrx.date).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sumber</p>
                    <p className="font-medium">{detailTrx.trxDari}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 my-2"></div>
                <div>
                  <p className="text-xs text-gray-500">Pelanggan</p>
                  <p className="font-medium">{detailTrx.customer}</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-3">
                <h4 className="font-medium">Ringkasan Pembayaran</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>Rp {detailTrx.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Admin</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rp {detailTrx.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDetailId(null)}>
                  Tutup
                </Button>
                {detailTrx.status === 'pending' && (
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Proses Pembayaran
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
