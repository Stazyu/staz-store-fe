import type { Metadata } from "next";
import DepositsTable from "@/features/admin/deposits/components/deposits-table";

export const metadata: Metadata = {
  title: "Deposit Saldo | Admin",
};

export default function DepositsPage() {
  return (
    <div className="space-y-6">
      <DepositsTable />
    </div>
  );
}
