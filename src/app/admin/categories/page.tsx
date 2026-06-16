import type { Metadata } from "next";
import CategoryTable from "@/features/admin/categories/components/category-table";

export const metadata: Metadata = {
  title: "Manajemen Kategori | Admin",
};

export default function CategoryPage() {
  return (
    <div className="space-y-6">
      <CategoryTable />
    </div>
  );
}
