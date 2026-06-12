"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Server } from "lucide-react";

const columns = [
  "Nama Provider",
  "Base URL",
  "Saldo Provider",
  "Status",
  "Last Sync",
  "Aksi",
];

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
          <Server className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Provider</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola supplier/provider produk top up game.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Provider</CardTitle>
          <CardDescription>
            Supplier yang menyediakan produk digital untuk top up game.
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
                      <Server className="size-10 text-gray-600" />
                      <p className="text-sm font-medium">Belum ada data provider</p>
                      <p className="text-xs text-gray-500">
                        Data provider akan muncul di sini setelah integrasi API selesai.
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
