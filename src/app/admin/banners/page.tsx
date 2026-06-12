"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Image as ImageIcon } from "lucide-react";

const columns = [
  "Judul",
  "Posisi",
  "Gambar",
  "Link",
  "Urutan",
  "Status",
  "Tanggal",
  "Aksi",
];

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
          <ImageIcon className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Banner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola banner promo di homepage dan halaman produk.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Banner</CardTitle>
          <CardDescription>
            Atur banner promosi yang tampil di website.
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
                      <ImageIcon className="size-10 text-gray-600" />
                      <p className="text-sm font-medium">Belum ada data banner</p>
                      <p className="text-xs text-gray-500">
                        Data banner akan muncul di sini setelah integrasi API selesai.
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
