import TransactionsTable from "@/components/admin/TransactionsTable";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Transaksi</h1>
      <TransactionsTable />
    </div>
  );
}
