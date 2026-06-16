import type { Metadata } from "next";
import ReportsContent from "@/features/admin/reports/components/reports-content";

export const metadata: Metadata = {
  title: "Laporan | Admin",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <ReportsContent />
    </div>
  );
}
