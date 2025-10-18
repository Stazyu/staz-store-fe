import CustomersTable from "@/components/admin/CustomersTable";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-bold mb-4">Data Pelanggan</h1> */}
      <CustomersTable />
    </div>
  );
}
