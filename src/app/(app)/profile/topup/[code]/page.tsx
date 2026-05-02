"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getInvoiceDetail } from '@/services/topup.client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Info } from 'lucide-react';

export default function TopupDetailPage() {
  const params = useParams();
  const code = params?.code as string;

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['topupDetail', code],
    queryFn: () => getInvoiceDetail(code),
    enabled: !!code
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat detail invoice...</div>;
  }

  if (error || !invoice) {
    return <div className="p-8 text-center text-red-500">Invoice tidak ditemukan atau terjadi kesalahan.</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusInfo = {
    PAID: { label: "Berhasil", class: "bg-green-100 text-green-700 hover:bg-green-200 border-0" },
    PENDING: { label: "Menunggu Pembayaran", class: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0" },
    CANCELLED: { label: "Dibatalkan", class: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-0" },
    REJECTED: { label: "Ditolak", class: "bg-red-100 text-red-700 hover:bg-red-200 border-0" },
  };

  const statusData = statusInfo[invoice.status as keyof typeof statusInfo] || { label: invoice.status, class: "" };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile/topup">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Top Up</h1>
          <p className="text-muted-foreground text-sm">
            Kode: {invoice.invoiceCode}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-sky-500 h-2"></div>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Tagihan</CardTitle>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(invoice.amount)}
          </div>
          <div className="mt-4">
            <Badge className={statusData.class}>{statusData.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {invoice.status === 'PENDING' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Menunggu Pembayaran / Validasi</p>
                <p>Silakan hubungi admin atau tunggu hingga pembayaran Anda dikonfirmasi. Saldo akan otomatis masuk ke dompet Anda setelah disetujui.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Rincian Invoice</h3>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-muted-foreground">Waktu Permintaan</div>
              <div className="font-medium text-right">
                {new Date(invoice.createdAt).toLocaleString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>

              <div className="text-muted-foreground">Metode Pembayaran</div>
              <div className="font-medium text-right">{invoice.paymentMethod === 'BCA_MANUAL' ? 'BCA (Manual)' : invoice.paymentMethod || 'Manual Transfer'}</div>

              <div className="text-muted-foreground">Catatan</div>
              <div className="font-medium text-right">{invoice.notes || '-'}</div>

              {invoice.updatedAt !== invoice.createdAt && invoice.status !== 'PENDING' && (
                <>
                  <div className="text-muted-foreground">Waktu Penyelesaian</div>
                  <div className="font-medium text-right">
                    {new Date(invoice.updatedAt).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.status === 'PENDING' && (
        <div className="text-center">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20sudah%20melakukan%20pembayaran%20untuk%20top%20up%20${invoice.invoiceCode}%20sebesar%20${formatCurrency(invoice.amount)}`} target="_blank">
              Konfirmasi via WhatsApp
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
