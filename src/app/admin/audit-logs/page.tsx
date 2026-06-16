import type { Metadata } from "next";
import AuditLogsTable from "@/features/admin/audit-logs/components/audit-logs-table";

export const metadata: Metadata = {
  title: "Audit Log | Admin",
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <AuditLogsTable />
    </div>
  );
}
