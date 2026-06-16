import type { Metadata } from "next";
import BrandTable from "@/features/admin/brands/components/brand-table";

export const metadata: Metadata = {
  title: "Manajemen Brand | Admin",
};

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <BrandTable />
    </div>
  );
}
