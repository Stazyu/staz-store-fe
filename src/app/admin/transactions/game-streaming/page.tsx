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
          id: "3",
          idTrx: "GAME-001",
          trxDari: "Aplikasi Mobile",
          customer: "Alex Johnson",
          product: "Diamond Mobile Legends 100",
          date: "2025-06-14T12:45:00",
          status: "success",
          total: 150000,
          paymentMethod: "Saldo StazPay",
          paymentStatus: "Berhasil",
          destinationNumber: "user12345"
        },
        {
          id: "4",
          idTrx: "GAME-002",
          trxDari: "Website",
          customer: "Sarah Williams",
          product: "Spotify Premium 1 Bulan",
          date: "2025-06-14T13:20:00",
          status: "pending",
          total: 55000,
          paymentMethod: "Transfer Bank BCA",
          paymentStatus: "Menunggu pembayaran",
          destinationNumber: "spotify:user98765"
        },
      ]);
    }, 100);
  });
};

export default async function GameStreamingPage() {
  const transactions = await getTransactions();

  return (
    <TransactionCategoryLayout title="Game & Streaming">
      <Suspense fallback={<div>Memuat data transaksi...</div>}>
        <TransactionList transactions={transactions} />
      </Suspense>
    </TransactionCategoryLayout>
  );
}
