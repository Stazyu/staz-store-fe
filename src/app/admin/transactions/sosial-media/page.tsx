import { Suspense } from "react";
import TransactionCategoryLayout from "@/components/admin/TransactionCategoryLayout";
import TransactionList from "@/components/admin/TransactionList";

// Mock data - replace with API call
const getTransactions = async () => {
  // Simulate API call
  return new Promise<Array<{
    id: string;
    idTrx: string;
    trxDari: string;
    customer: string;
    product: string;
    date: string;
    status: "success" | "pending" | "failed";
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    destinationNumber?: string;
  }>>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "5",
          idTrx: "SOCIAL-001",
          trxDari: "Aplikasi Mobile",
          customer: "Michael Brown",
          product: "Instagram Followers 1K",
          date: "2025-06-14T14:10:00",
          status: "success",
          total: 25000,
          paymentMethod: "Saldo StazPay",
          paymentStatus: "Berhasil",
          destinationNumber: "@michaelbrown"
        },
        {
          id: "6",
          idTrx: "SOCIAL-002",
          trxDari: "Website",
          customer: "Emma Wilson",
          product: "TikTok Likes 10K",
          date: "2025-06-14T15:30:00",
          status: "failed",
          total: 150000,
          paymentMethod: "Kartu Kredit",
          paymentStatus: "Gagal",
          destinationNumber: "@emmawilson"
        },
      ]);
    }, 100);
  });
};

export default async function SosialMediaPage() {
  const transactions = await getTransactions();

  return (
    <TransactionCategoryLayout title="Sosial Media">
      <Suspense fallback={<div>Memuat data transaksi...</div>}>
        <TransactionList transactions={transactions} />
      </Suspense>
    </TransactionCategoryLayout>
  );
}
