import TypeTable from "@/components/admin/TypeTable";

export const metadata = {
    title: 'Manajemen Tipe | Admin',
};

export default function TypePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-4">Manajemen Tipe</h1>
            <TypeTable />
        </div>
    );
}
