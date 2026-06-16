import type { Metadata } from "next";
import MutationsTable from "@/features/admin/balance-mutations/components/mutations-table";

export const metadata: Metadata = {
  title: "Mutasi Saldo | Admin",
};

export default function BalanceMutationsPage() {
  return (
    <div className="space-y-6">
      <MutationsTable />
    </div>
  );
}
