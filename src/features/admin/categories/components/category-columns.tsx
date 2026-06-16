export interface CategoryColumn {
  key: string;
  header: string;
  className?: string;
}

export const categoryColumns: CategoryColumn[] = [
  { key: "no", header: "No", className: "w-16 text-center font-bold text-xs uppercase tracking-wider" },
  { key: "name", header: "Nama Kategori", className: "font-bold text-xs uppercase tracking-wider" },
  { key: "sortOrder", header: "Urutan", className: "text-center font-bold text-xs uppercase tracking-wider" },
  { key: "brandCount", header: "Total Brand", className: "text-center font-bold text-xs uppercase tracking-wider" },
  { key: "actions", header: "Aksi", className: "text-right font-bold text-xs uppercase tracking-wider pr-8" },
];
