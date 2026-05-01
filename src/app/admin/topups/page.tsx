import TopupsTable from "@/components/admin/TopupsTable";

export default function AdminTopupsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Top Up Saldo</h1>
      <p className="text-gray-500 mb-6">Kelola dan setujui permintaan top up saldo dari pengguna.</p>
      <TopupsTable />
    </div>
  );
}
