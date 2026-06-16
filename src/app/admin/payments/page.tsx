import type { Metadata } from "next";
import PaymentsTable from "@/features/admin/payments/components/payments-table";

export const metadata: Metadata = {
  title: "Pembayaran | Admin",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PaymentsTable />
    </div>
  );
}
