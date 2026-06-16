"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TicketPercent } from "lucide-react";

const columns = [
  "Kode",
  "Nama Promo",
  "Tipe",
  "Nilai",
  "Minimum Transaksi",
  "Kuota",
  "Terpakai",
  "Status",
  "Periode",
  "Aksi",
];

export default function PromosTable() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
          <TicketPercent className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Promo</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola kode voucher, diskon, cashback, dan promo produk.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Promo</CardTitle>
          <CardDescription>
            Buat dan kelola promo untuk meningkatkan penjualan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TicketPercent className="size-10 text-gray-600" />
                      <p className="text-sm font-medium">Belum ada data promo</p>
                      <p className="text-xs text-gray-500">
                        Data promo akan muncul di sini setelah integrasi API selesai.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
