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
          id: "1",
          idTrx: "PPOB-001",
          trxDari: "Aplikasi Mobile",
          customer: "John Doe",
          product: "Pulsa Tri 50.000",
          date: "2025-06-14T10:30:00",
          status: "success",
          total: 52000,
          paymentMethod: "Saldo StazPay",
          paymentStatus: "Berhasil",
          destinationNumber: "081234567890"
        },
        {
          id: "2",
          idTrx: "PPOB-002",
          trxDari: "Website",
          customer: "Jane Smith",
          product: "PLN 200.000",
          date: "2025-06-14T11:15:00",
          status: "pending",
          total: 201500,
          paymentMethod: "Transfer Bank BNI",
          paymentStatus: "Menunggu konfirmasi",
          destinationNumber: "081298765432"
        },
      ]);
    }, 100);
  });
};

export default async function PulsaPpobPage() {
  const transactions = await getTransactions();

  return (
    <TransactionCategoryLayout title="Pulsa & PPOB">
      <Suspense fallback={<div>Memuat data transaksi...</div>}>
        <TransactionList transactions={transactions} />
      </Suspense>
    </TransactionCategoryLayout>
  );
}
