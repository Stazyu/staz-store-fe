// components/admin/TransactionCategoryLayout.tsx
"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiDownload, FiFilter } from "react-icons/fi";

interface TransactionCategoryLayoutProps {
  title: string;
  children: ReactNode;
}

export default function TransactionCategoryLayout({ title, children }: TransactionCategoryLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <FiDownload className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Transaksi</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Cari transaksi..." className="max-w-xs" />
              <Button variant="outline" size="sm">
                <FiFilter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}