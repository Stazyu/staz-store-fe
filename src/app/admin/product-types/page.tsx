import TypeTable from "@/components/admin/TypeTable";

export const metadata = {
    title: 'Manajemen Tipe Produk | Admin',
};

export default function ProductTypesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-4">Manajemen Tipe Produk</h1>
            <TypeTable />
        </div>
    );
}
