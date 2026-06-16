import TypeTable from "@/features/admin/product-types/components/type-table";

export const metadata = {
    title: 'Manajemen Tipe Produk | Admin',
};

export default function ProductTypesPage() {
    return (
        <div className="space-y-6">
            <TypeTable />
        </div>
    );
}
