import type { Metadata } from "next";
import TransactionsByCategoryTable from "@/components/admin/TransactionsByCategoryTable";

export const metadata: Metadata = {
  title: "Transaksi per Kategori | Admin",
};

export default function TransactionsByCategoryPage() {
  return (
    <div className="space-y-6">
      <TransactionsByCategoryTable />
    </div>
  );
}
