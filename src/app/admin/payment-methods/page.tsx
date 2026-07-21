import React from "react";
import PaymentMethodsTable from "@/features/admin/payment-methods/components/payment-methods-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kelola Metode Pembayaran - Staz Store Admin",
    description: "Halaman pengelolaan channel pembayaran, provider payment gateway, dan biaya admin transaksi.",
};

export default function AdminPaymentMethodsPage() {
    return <PaymentMethodsTable />;
}
