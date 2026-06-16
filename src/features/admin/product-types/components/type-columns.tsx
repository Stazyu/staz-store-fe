export interface TypeColumn {
  key: string;
  header: string;
  className?: string;
  sortable?: boolean;
}

export const typeColumns: TypeColumn[] = [
  { key: "no", header: "No", className: "w-16 text-center font-bold text-xs uppercase tracking-wider" },
  { key: "name", header: "Nama", className: "font-bold text-xs uppercase tracking-wider cursor-pointer select-none", sortable: true },
  { key: "prefix", header: "Prefix", className: "font-bold text-xs uppercase tracking-wider cursor-pointer select-none", sortable: true },
  { key: "brand", header: "Brand", className: "font-bold text-xs uppercase tracking-wider cursor-pointer select-none", sortable: true },
  { key: "category", header: "Kategori", className: "font-bold text-xs uppercase tracking-wider" },
  { key: "products", header: "Produk", className: "font-bold text-xs uppercase tracking-wider text-center cursor-pointer select-none", sortable: true },
  { key: "actions", header: "Aksi", className: "font-bold text-xs uppercase tracking-wider text-right pr-6" },
];
