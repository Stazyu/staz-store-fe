import TransactionsByCategoryTable from "@/components/admin/TransactionsByCategoryTable";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Daftar Transaksi</h1>
          <p className="text-sm text-gray-500">Kelola semua transaksi berdasarkan kategori.</p>
        </div>
      </div>
      <TransactionsByCategoryTable />
    </div>
  );
}
