import type { Metadata } from "next";
import DashboardMain from "@/features/admin/dashboard/components/dashboard-main";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
};

export default function AdminDashboardPage() {
  return (
    <div>
      <DashboardMain />
    </div>
  );
}
