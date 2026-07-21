"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, User, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { useAdminUserSearch, useCreateBalanceAdjustment } from "@/hooks/useBalanceAdjustmentQuery";
import type { SearchUser } from "@/services/balanceAdjustment.client";
import { toast } from "react-hot-toast";

interface CreateAdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateAdjustmentDialog({ open, onOpenChange }: CreateAdjustmentDialogProps) {
    const [userQuery, setUserQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    const { data: users = [], isLoading: searchLoading } = useAdminUserSearch(debouncedQuery);
    const createMutation = useCreateBalanceAdjustment();

    // Debounce user search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(userQuery), 300);
        return () => clearTimeout(timer);
    }, [userQuery]);

    // Show dropdown when results come in
    useEffect(() => {
        if (users.length > 0 && !selectedUser) {
            setShowDropdown(true);
        }
    }, [users, selectedUser]);

    const resetForm = useCallback(() => {
        setUserQuery("");
        setDebouncedQuery("");
        setSelectedUser(null);
        setShowDropdown(false);
        setType("CREDIT");
        setAmount("");
        setReason("");
    }, []);

    const handleClose = useCallback((nextOpen: boolean) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
    }, [onOpenChange, resetForm]);

    const handleSelectUser = (user: SearchUser) => {
        setSelectedUser(user);
        setUserQuery(user.name);
        setShowDropdown(false);
    };

    const parsedAmount = parseInt(amount.replace(/[^\d]/g, "")) || 0;

    const canSubmit =
        selectedUser &&
        parsedAmount > 0 &&
        reason.trim().length > 0 &&
        !createMutation.isPending;

    const handleSubmit = async () => {
        if (!canSubmit || !selectedUser) return;

        try {
            await createMutation.mutateAsync({
                userId: selectedUser.id,
                type,
                amount: parsedAmount,
                reason: reason.trim(),
            });
            toast.success("Penyesuaian saldo berhasil dibuat!");
            handleClose(false);
        } catch (error: any) {
            toast.error(error.message || "Gagal membuat penyesuaian saldo");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-0 overflow-hidden text-slate-900 dark:text-slate-200">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-700 to-indigo-600 p-6 text-white">
                    <DialogTitle className="text-xl font-bold">Buat Penyesuaian Saldo</DialogTitle>
                    <p className="text-xs text-blue-200 mt-1">Tambah atau kurangi saldo user secara manual.</p>
                </div>

                <div className="p-6 space-y-5">
                    {/* User Search */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Pilih User
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Cari nama, email, atau no. HP..."
                                value={userQuery}
                                onChange={(e) => {
                                    setUserQuery(e.target.value);
                                    setSelectedUser(null);
                                    if (e.target.value.trim().length < 2) setShowDropdown(false);
                                }}
                                className="pl-9 h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200"
                            />
                            {searchLoading && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-blue-500 animate-spin" />
                            )}

                            {/* Dropdown results */}
                            {showDropdown && users.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                    {users.map((u) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => handleSelectUser(u)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    <User className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                        {u.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {u.email} · {u.phoneNumber}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                                    Rp {u.balance.toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected user card */}
                        {selectedUser && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                    <User className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedUser.name}</p>
                                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Saldo saat ini</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        Rp {selectedUser.balance.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Tipe Penyesuaian
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType("CREDIT")}
                                className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                                    type === "CREDIT"
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm"
                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                }`}
                            >
                                <ArrowUpCircle className={`size-5 ${type === "CREDIT" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                                <div className="text-left">
                                    <p className={`text-sm font-bold ${type === "CREDIT" ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}`}>
                                        Tambah Saldo
                                    </p>
                                    <p className="text-[10px] text-slate-500">Credit / Top-up</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("DEBIT")}
                                className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                                    type === "DEBIT"
                                        ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 shadow-sm"
                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                }`}
                            >
                                <ArrowDownCircle className={`size-5 ${type === "DEBIT" ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`} />
                                <div className="text-left">
                                    <p className={`text-sm font-bold ${type === "DEBIT" ? "text-rose-700 dark:text-rose-300" : "text-slate-700 dark:text-slate-300"}`}>
                                        Kurangi Saldo
                                    </p>
                                    <p className="text-[10px] text-slate-500">Debit / Potong</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Nominal (Rp)
                        </Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Contoh: 50000"
                            value={amount}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, "");
                                setAmount(raw ? parseInt(raw).toLocaleString("id-ID") : "");
                            }}
                            className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-mono text-lg"
                        />
                        {parsedAmount > 0 && selectedUser && (
                            <p className="text-xs text-slate-500">
                                Estimasi saldo setelah:{" "}
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    Rp{" "}
                                    {(
                                        selectedUser.balance +
                                        (type === "CREDIT" ? parsedAmount : -parsedAmount)
                                    ).toLocaleString("id-ID")}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Alasan / Catatan <span className="text-rose-500">*</span>
                        </Label>
                        <textarea
                            rows={3}
                            placeholder="Contoh: Kompensasi server down 2 jam, refund manual order #123, bonus loyalitas..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 pb-6 gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => handleClose(false)}
                        className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
                    >
                        {createMutation.isPending ? (
                            <><Loader2 className="size-4 mr-2 animate-spin" /> Memproses...</>
                        ) : (
                            "Buat Penyesuaian"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
