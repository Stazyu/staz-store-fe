import type { Metadata } from "next";
import TopupsTable from "@/features/admin/topups/components/topups-table";

export const metadata: Metadata = {
  title: "Topup | Admin",
};

export default function AdminTopupsPage() {
  return (
    <div className="space-y-6">
      <TopupsTable />
    </div>
  );
}
