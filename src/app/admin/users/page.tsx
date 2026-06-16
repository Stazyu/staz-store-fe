import type { Metadata } from "next";
import UsersTable from "@/features/admin/users/components/users-table";

export const metadata: Metadata = {
  title: "Manajemen User | Admin",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <UsersTable />
    </div>
  );
}
