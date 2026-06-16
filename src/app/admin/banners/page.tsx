import type { Metadata } from "next";
import BannersTable from "@/features/admin/banners/components/banners-table";

export const metadata: Metadata = {
  title: "Banner | Admin",
};

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <BannersTable />
    </div>
  );
}
