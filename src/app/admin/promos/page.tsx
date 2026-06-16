import type { Metadata } from "next";
import PromosTable from "@/features/admin/promos/components/promos-table";

export const metadata: Metadata = {
  title: "Promo | Admin",
};

export default function PromosPage() {
  return (
    <div className="space-y-6">
      <PromosTable />
    </div>
  );
}
