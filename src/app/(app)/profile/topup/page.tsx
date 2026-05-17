"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import { getMyInvoices, createInvoice, cancelInvoice } from '@/services/topup.client';
import { TopupInvoice } from '@/types/topup.types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Wallet, Plus, History, Ban, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const nominalOptions = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];

const PAYMENT_METHODS = [
  { value: 'QRIS', label: 'QRIS' },
  { value: 'BCA_MANUAL', label: 'BCA (Manual)' },
  // Tambahkan metode pembayaran baru di sini
];

export default function ProfileTopupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: userProfile } = useProfile();

  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [activeTab, setActiveTab] = useState('form');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['myTopupInvoices'],
    queryFn: getMyInvoices
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      // Redirect to invoice detail
      router.push(`/profile/topup/${data.invoiceCode}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal membuat invoice top up');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: cancelInvoice,
    onSuccess: () => {
      toast.success('Invoice berhasil dibatalkan');
      queryClient.invalidateQueries({ queryKey: ['myTopupInvoices'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal membatalkan invoice');
    }
  });

  const handleCreateTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 10000) {
      toast.error('Minimal nominal top up adalah Rp 10.000');
      return;
    }

    createMutation.mutate({
      amount: Number(amount),
      method: paymentMethod || 'QRIS',
      notes: 'Top Up via Profile'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Sukses</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">Pending</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0">Batal</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Ditolak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Up Saldo</h1>
        <p className="text-muted-foreground">
          Isi saldo dompet Anda untuk kemudahan transaksi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-linear-to-br from-blue-600 to-sky-500 text-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-100 text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" /> Saldo Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-bold tracking-tight">
                {formatCurrency(userProfile?.balance || 0)}
              </h2>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-blue-100/80">
                Gunakan saldo dompet untuk berbelanja lebih cepat
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="form" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Form Top Up
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" /> Riwayat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <Card>
                <CardHeader>
                  <CardTitle>Pilih Nominal</CardTitle>
                  <CardDescription>Pilih atau masukkan nominal saldo yang ingin ditambahkan</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTopup} className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {nominalOptions.map((opt) => (
                        <Button
                          key={opt}
                          type="button"
                          variant={amount === opt ? 'default' : 'outline'}
                          className={`h-auto py-3 ${amount === opt ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          onClick={() => setAmount(opt)}
                        >
                          {formatCurrency(opt)}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="custom-amount">Atau masukkan nominal lainnya</Label>
                      <Input
                        id="custom-amount"
                        type="number"
                        min="10000"
                        placeholder="Contoh: 150000 (Min. Rp 10.000)"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value) || '')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-method">Metode Pembayaran</Label>
                      <select
                        id="payment-method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-900 dark:text-white"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    <Button type="submit" className="w-full" disabled={createMutation.isPending || !amount}>
                      {createMutation.isPending ? 'Memproses...' : 'Buat Permintaan Top Up'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Top Up</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-6 text-muted-foreground">Memuat data...</div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">Belum ada riwayat top up</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kode</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Metode</TableHead>
                            <TableHead>Nominal</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((inv: TopupInvoice) => (
                            <TableRow key={inv.id}>
                              <TableCell className="font-medium text-xs">
                                {inv.invoiceCode}
                              </TableCell>
                              <TableCell>
                                {new Date(inv.createdAt).toLocaleString('id-ID', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })}
                              </TableCell>
                              <TableCell>
                                {inv.paymentMethod === 'BCA_MANUAL' ? 'BCA (Manual)' : inv.paymentMethod || 'QRIS'}
                              </TableCell>
                              <TableCell className="font-semibold text-primary">
                                {formatCurrency(inv.amount)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(inv.status)}
                              </TableCell>
                              <TableCell className="text-right flex items-center justify-end gap-2">
                                <Button asChild size="icon" variant="ghost" title="Detail">
                                  <Link href={`/profile/topup/${inv.invoiceCode}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                {inv.status === 'PENDING' && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    title="Batalkan"
                                    onClick={() => {
                                      if (confirm('Yakin ingin membatalkan top up ini?')) {
                                        cancelMutation.mutate(inv.invoiceCode);
                                      }
                                    }}
                                    disabled={cancelMutation.isPending}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
