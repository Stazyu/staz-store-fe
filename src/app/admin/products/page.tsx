import type { Metadata } from "next";
import ProductTable from "@/features/admin/products/components/product-table";

export const metadata: Metadata = {
  title: "Manajemen Produk | Admin",
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductTable />
    </div>
  );
}
