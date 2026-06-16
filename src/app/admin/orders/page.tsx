import type { Metadata } from "next";
import OrdersTable from "@/features/admin/orders/components/orders-table";

export const metadata: Metadata = {
  title: "Manajemen Order | Admin",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <OrdersTable />
    </div>
  );
}
