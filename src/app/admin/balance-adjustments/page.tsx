import type { Metadata } from "next";
import AdjustmentsTable from "@/features/admin/balance-adjustments/components/adjustments-table";

export const metadata: Metadata = {
  title: "Penyesuaian Saldo | Admin",
};

export default function BalanceAdjustmentsPage() {
  return (
    <div className="space-y-6">
      <AdjustmentsTable />
    </div>
  );
}
