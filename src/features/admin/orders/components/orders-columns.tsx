export interface OrderColumn {
  key: string;
  header: string;
  className?: string;
}

export const ordersColumns: OrderColumn[] = [
  { key: "no", header: "No", className: "w-12 text-center text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "invoice", header: "Invoice", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "customer", header: "Customer", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "brand", header: "Brand", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "product", header: "Produk", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "userId", header: "User ID / Server ID", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "total", header: "Total", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "orderStatus", header: "Status Order", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4 text-center" },
  { key: "paymentType", header: "Tipe Pembayaran", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider text-center py-4" },
  { key: "date", header: "Tanggal", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4" },
  { key: "actions", header: "Aksi", className: "text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider text-right pr-6 py-4" },
];
