import type { Metadata } from "next";
import ProvidersTable from "@/features/admin/providers/components/providers-table";

export const metadata: Metadata = {
  title: "Provider | Admin",
};

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <ProvidersTable />
    </div>
  );
}
