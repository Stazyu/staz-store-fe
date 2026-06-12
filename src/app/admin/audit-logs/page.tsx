"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";

const columns = [
  "Admin",
  "Aktivitas",
  "Modul",
  "Reference",
  "IP Address",
  "User Agent",
  "Waktu",
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
          <ShieldCheck className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Riwayat aktivitas admin dan perubahan data penting.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas</CardTitle>
          <CardDescription>
            Semua aktivitas admin tercatat di sini untuk keperluan audit.
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
                      <ShieldCheck className="size-10 text-gray-600" />
                      <p className="text-sm font-medium">Belum ada log aktivitas</p>
                      <p className="text-xs text-gray-500">
                        Audit log akan muncul di sini setelah integrasi API selesai.
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
