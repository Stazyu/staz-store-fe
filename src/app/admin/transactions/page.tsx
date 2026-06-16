import type { Metadata } from "next";
import TransactionsByCategoryTable from "@/components/admin/TransactionsByCategoryTable";

export const metadata: Metadata = {
  title: "Transaksi | Admin",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <TransactionsByCategoryTable />
    </div>
  );
}
