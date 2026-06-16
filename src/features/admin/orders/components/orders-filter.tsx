"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { DateRangePicker } from "@/components/admin/DateRangePicker";

interface OrdersFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "SUCCESS", label: "SUCCESS" },
  { value: "PENDING", label: "PENDING" },
  { value: "PROCESSING", label: "PROCESSING" },
  { value: "FAILED", label: "FAILED" },
  { value: "REFUNDED", label: "REFUNDED" },
  { value: "CANCELED", label: "CANCELED" },
] as const;

export default function OrdersFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onReset,
}: OrdersFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Cari invoice/produk/user..."
          className="pl-9 h-10 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-sm focus:ring-blue-500/30 focus:border-blue-500/50 rounded-xl transition-all"
        />
      </div>
      <Select
        value={status || "ALL"}
        onValueChange={(val) => onStatusChange(val === "ALL" ? "" : val)}
      >
        <SelectTrigger className="h-10 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 w-full transition-all [&>svg]:text-slate-500">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-xl shadow-2xl dark:shadow-black/50">
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-slate-700 dark:text-slate-300 text-sm focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-700 dark:focus:text-blue-300 rounded-lg cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
      <Button
        variant="outline"
        onClick={onReset}
        className="h-10 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white rounded-xl flex items-center justify-center gap-2 w-full transition-all"
      >
        <Filter className="size-4" /> Reset Filter
      </Button>
    </div>
  );
}
