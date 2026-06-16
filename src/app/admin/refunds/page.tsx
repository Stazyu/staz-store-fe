import type { Metadata } from "next";
import RefundsTable from "@/features/admin/refunds/components/refunds-table";

export const metadata: Metadata = {
  title: "Refund | Admin",
};

export default function RefundsPage() {
  return (
    <div className="space-y-6">
      <RefundsTable />
    </div>
  );
}
