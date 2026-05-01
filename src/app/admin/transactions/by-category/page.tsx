import TransactionsByCategoryTable from "@/components/admin/TransactionsByCategoryTable";

export default function TransactionsByCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Transaksi Berdasarkan Kategori</h1>
          <p className="text-sm text-gray-500">Pilih kategori untuk melihat dan mengelola transaksi secara spesifik.</p>
        </div>
      </div>
      
      <TransactionsByCategoryTable />
    </div>
  );
}
