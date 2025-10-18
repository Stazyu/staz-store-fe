import CategoryTable from "@/components/admin/CategoryTable";

export default function CategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Kategori Produk</h1>
      <CategoryTable />
    </div>
  );
}
