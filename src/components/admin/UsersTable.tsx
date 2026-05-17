"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FiEye, FiEdit2, FiUserX, FiUserCheck, FiSearch, FiRefreshCw, FiChevronUp, FiChevronDown, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight, FiMail, FiPhone, FiCalendar, FiShoppingBag, FiClock, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-hot-toast";

import { User, UpdateUserDto, Role } from "@/types/user.types";
import { fetchUsers, updateUser } from "@/services/user.client";
import { fetchPricingTiers } from "@/services/pricingTier.client";

import authClient from "@/lib/auth-client";

type SortField = 'name' | 'email' | 'role' | 'balance';
type SortDirection = 'asc' | 'desc';

export default function UsersTable() {
    const { data: session } = authClient.useSession();
    const queryClient = useQueryClient();
    const [detailId, setDetailId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
        field: 'name',
        direction: 'asc'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Edit form state
    const [editForm, setEditForm] = useState<UpdateUserDto>({
        name: '',
        email: '',
        whatsappId: '',
        telegramId: '',
        role: 'BASIC',
        balance: 0,
        phoneNumber: '',
        sellOffline: false,
        emailVerified: false,
        pricingTierId: 'BRONZE',
    });

    // State for ban modal
    const [banUserId, setBanUserId] = useState<string | null>(null);
    const [banReason, setBanReason] = useState("");

    // Fetch users using TanStack Query and Service
    const { data: users = [], isLoading, error, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: fetchUsers,
    });

    // Fetch pricing tiers
    const { data: pricingTiers = [] } = useQuery({
        queryKey: ['admin-pricing-tiers'],
        queryFn: fetchPricingTiers,
    });

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User updated successfully');
            setEditId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update user');
        }
    });

    // Ban/Unban user mutation
    const toggleBanMutation = useMutation({
        mutationFn: async ({ id, banned, reason }: { id: string; banned: boolean; reason?: string }) => {
            if (banned) {
                // Ban user using better-auth
                await authClient.admin.banUser({
                    userId: id,
                    banReason: reason
                });
            } else {
                // Unban user using better-auth
                await authClient.admin.unbanUser({
                    userId: id
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User status updated successfully');
            setBanUserId(null);
            setBanReason("");
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update user status');
        }
    });

    // Handle sorting
    const handleSort = (field: SortField) => {
        setSortConfig(prevConfig => ({
            field,
            direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle ban/unban button click
    const handleToggleBan = (id: string, currentBanned: boolean) => {
        if (!currentBanned) {
            // If active -> Open ban modal to ask reason
            setBanUserId(id);
            setBanReason("");
        } else {
            // If banned -> Unban directly
            toggleBanMutation.mutate({ id, banned: false });
        }
    };

    // Handle ban submit
    const handleBanSubmit = () => {
        if (banUserId) {
            toggleBanMutation.mutate({ id: banUserId, banned: true, reason: banReason });
        }
    };

    // Handle edit
    const handleEdit = (user: User) => {
        setEditId(user.id);
        const isAdmin = session?.user?.role?.toLowerCase() === 'super_admin';
        setEditForm({
            name: user.name,
            email: user.email,
            whatsappId: user.whatsappId || '',
            telegramId: user.telegramId || '',
            role: user.role,
            balance: user.balance,
            pricingTierId: user.pricingTierId || 'BRONZE',
            ...(isAdmin && {
                phoneNumber: user.phoneNumber,
                sellOffline: user.sellOffline,
                emailVerified: user.emailVerified,
            })
        });
    };

    // Handle edit submit
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;
        updateUserMutation.mutate({ id: editId, data: editForm });
    };

    // Handle refresh data
    const handleRefresh = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setRoleFilter("all");
        setSortConfig({ field: 'name', direction: 'asc' });
        setCurrentPage(1);
        refetch();
    };

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                user =>
                    user.name.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term) ||
                    user.phoneNumber.includes(term)
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            const isBanned = statusFilter === "banned";
            result = result.filter(user => user.banned === isBanned);
        }

        // Apply role filter
        if (roleFilter !== "all") {
            result = result.filter(user => user.role === roleFilter);
        }

        // Apply sorting
        result.sort((a, b) => {
            let aValue = a[sortConfig.field];
            let bValue = b[sortConfig.field];

            // Handle potential undefined values
            if (aValue === undefined) aValue = '';
            if (bValue === undefined) bValue = '';

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return result;
    }, [users, searchTerm, statusFilter, roleFilter, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedUsers.length / rowsPerPage);
    const paginatedUsers = filteredAndSortedUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const detailUser = users.find(u => u.id === detailId);
    const editUser = users.find(u => u.id === editId);


    // Render sort icon
    const renderSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) return null;
        return sortConfig.direction === 'asc' ?
            <FiChevronUp className="inline ml-1" /> :
            <FiChevronDown className="inline ml-1" />;
    };

    // Pagination controls
    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 3;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                >
                    <FiChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <FiChevronLeft className="h-4 w-4" />
                </Button>

                {startPage > 1 && (
                    <Button variant="ghost" size="sm" disabled>...</Button>
                )}

                {pageNumbers.map(number => (
                    <Button
                        key={number}
                        variant={currentPage === number ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </Button>
                ))}

                {endPage < totalPages && (
                    <Button variant="ghost" size="sm" disabled>...</Button>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    <FiChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <FiChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center gap-3">
                <FiAlertTriangle className="w-8 h-8 text-red-500" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{(error as Error).message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>Coba Lagi</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Data Pengguna</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{users.length} pengguna terdaftar</p>
                </div>
                <button onClick={handleRefresh} disabled={isLoading} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 self-start">
                    <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">

                {/* Filters */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input type="search" placeholder="Cari user..." className="pl-9 h-9 text-sm rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] h-9 text-sm rounded-lg"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent><SelectGroup><SelectItem value="all">Semua Status</SelectItem><SelectItem value="active">Aktif</SelectItem><SelectItem value="banned">Banned</SelectItem></SelectGroup></SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[120px] h-9 text-sm rounded-lg"><SelectValue placeholder="Role" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Semua Role</SelectItem><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="RESELLER">Reseller</SelectItem><SelectItem value="BASIC">Basic</SelectItem><SelectItem value="OFFLINE">Offline</SelectItem></SelectContent>
                    </Select>
                </div>

            <div className="relative overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-100 dark:border-gray-800">
                            <TableHead className="w-12 text-center text-xs">No</TableHead>
                            <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('name')}>Nama {renderSortIcon('name')}</TableHead>
                            <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('email')}>Email {renderSortIcon('email')}</TableHead>
                            <TableHead className="text-xs">No. HP</TableHead>
                            <TableHead className="text-xs text-right cursor-pointer select-none" onClick={() => handleSort('balance')}>Balance {renderSortIcon('balance')}</TableHead>
                            <TableHead className="text-xs cursor-pointer select-none" onClick={() => handleSort('role')}>Role {renderSortIcon('role')}</TableHead>
                            <TableHead className="text-xs">Tier</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={9} className="h-48 text-center">
                                <FiRefreshCw className="animate-spin text-xl text-gray-400 mx-auto" />
                            </TableCell></TableRow>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user, idx) => (
                                <TableRow key={user.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <TableCell className="text-center text-sm text-gray-400">{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                                    <TableCell className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</TableCell>
                                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">{user.email}</TableCell>
                                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">{user.phoneNumber}</TableCell>
                                    <TableCell className="text-right text-sm font-medium text-gray-900 dark:text-white">Rp {user.balance.toLocaleString('id-ID')}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                            user.role === 'RESELLER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                user.role === 'OFFLINE' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</span>
                                    </TableCell>
                                    <TableCell><span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{user.pricingTierId || 'BRONZE'}</span></TableCell>
                                    <TableCell>
                                        {!user.banned
                                            ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 transition-none">Aktif</span>
                                            : <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 transition-none">Banned</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex gap-0.5 justify-center">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailId(user.id)}><FiEye className="h-3.5 w-3.5" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(user)} disabled={session?.user?.id === user.id}><FiEdit2 className="h-3.5 w-3.5" /></Button>
                                            {!user.banned ? (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleToggleBan(user.id, user.banned)} disabled={toggleBanMutation.isPending || session?.user?.id === user.id}><FiUserX className="h-3.5 w-3.5" /></Button>
                                            ) : (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => handleToggleBan(user.id, user.banned)} disabled={toggleBanMutation.isPending || session?.user?.id === user.id}><FiUserCheck className="h-3.5 w-3.5" /></Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={9} className="h-48 text-center text-gray-400 text-sm">Tidak ada data pengguna ditemukan</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-gray-500">
                        {paginatedUsers.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}–{Math.min(currentPage * rowsPerPage, filteredAndSortedUsers.length)} dari {filteredAndSortedUsers.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Select value={`${rowsPerPage}`} onValueChange={(v: string) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                            <SelectTrigger className="h-8 w-[65px] text-xs rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>{[5, 10, 20, 50].map(n => <SelectItem key={n} value={`${n}`}>{n}</SelectItem>)}</SelectContent>
                        </Select>
                        {totalPages > 1 && renderPagination()}
                    </div>
                </div>

            {/* Detail Modal */}
            <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
                <DialogContent className="sm:max-w-md md:max-w-2xl rounded-lg">
                    {detailUser && (
                        <div className="space-y-6">
                            <DialogHeader className="border-b pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {detailUser.name}
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            ID: {detailUser.id}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium transition-none ${!detailUser.banned
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                        }`}>
                                        {!detailUser.banned ? 'Aktif' : 'Banned'}
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                        <FiMail className="mr-2 h-5 w-5 text-blue-600" />
                                        Informasi Kontak
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <FiMail className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                                <p className="text-gray-900 dark:text-white">{detailUser.email}</p>
                                                {detailUser.emailVerified && (
                                                    <span className="text-xs text-green-600">✓ Verified</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <FiPhone className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Telepon</p>
                                                <p className="text-gray-900 dark:text-white">{detailUser.phoneNumber}</p>
                                            </div>
                                        </div>
                                        {detailUser.whatsappId && (
                                            <div className="flex items-start">
                                                <FiPhone className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp</p>
                                                    <p className="text-gray-900 dark:text-white">{detailUser.whatsappId}</p>
                                                </div>
                                            </div>
                                        )}
                                        {detailUser.telegramId && (
                                            <div className="flex items-start">
                                                <FiPhone className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Telegram</p>
                                                    <p className="text-gray-900 dark:text-white">{detailUser.telegramId}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start">
                                            <div className="h-5 w-5 mr-3 mt-0.5 shrink-0 flex items-center justify-center">
                                                <span className={`h-2.5 w-2.5 rounded-full ${detailUser.role === 'ADMIN' ? 'bg-purple-500' :
                                                    detailUser.role === 'RESELLER' ? 'bg-blue-500' :
                                                        detailUser.role === 'OFFLINE' ? 'bg-yellow-500' :
                                                            'bg-gray-500'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                                                <p className="text-gray-900 dark:text-white">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detailUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                                                        detailUser.role === 'RESELLER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                                                            detailUser.role === 'OFFLINE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200'
                                                        }`}>
                                                        {detailUser.role.charAt(0) + detailUser.role.slice(1).toLowerCase()}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="h-5 w-5 mr-3 mt-0.5 shrink-0 flex items-center justify-center">
                                                <span className={`h-2.5 w-2.5 rounded-full bg-indigo-500`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pricing Tier</p>
                                                <p className="text-gray-900 dark:text-white">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200`}>
                                                        {detailUser.pricingTierId || 'BRONZE'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                        <FiShoppingBag className="mr-2 h-5 w-5 text-blue-600" />
                                        Aktivitas
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <FiShoppingBag className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transaksi</p>
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {detailUser.orders?.length || 0} transaksi
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <FiCalendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bergabung</p>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(detailUser.createdAt).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0">💰</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</p>
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    Rp {detailUser.balance.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        {detailUser.updatedAt && (
                                            <div className="flex items-start">
                                                <FiClock className="h-5 w-5 text-gray-400 mr-3 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Terakhir Update</p>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {new Date(detailUser.updatedAt).toLocaleDateString('id-ID', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {detailUser.banned && (
                                <div className="pt-4 border-t">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                        <h4 className="flex items-center text-red-800 dark:text-red-200 font-semibold mb-2">
                                            <FiAlertTriangle className="mr-2" />
                                            Banned Information
                                        </h4>
                                        {detailUser.banReason && (
                                            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                                                <strong>Alasan:</strong> {detailUser.banReason}
                                            </p>
                                        )}
                                        {detailUser.banExpires && (
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                <strong>Berakhir:</strong> {new Date(detailUser.banExpires).toLocaleDateString('id-ID')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setDetailId(null)}
                                    className="px-6"
                                >
                                    Tutup
                                </Button>
                                <Button
                                    variant={!detailUser.banned ? "destructive" : "default"}
                                    onClick={() => {
                                        handleToggleBan(detailUser.id, detailUser.banned);
                                        setDetailId(null);
                                    }}
                                    className="px-6"
                                    disabled={toggleBanMutation.isPending}
                                >
                                    {!detailUser.banned ? 'Ban' : 'Unban'} Akun
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
                <DialogContent className="sm:max-w-md rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-whatsapp">WhatsApp ID</Label>
                            <Input
                                id="edit-whatsapp"
                                value={editForm.whatsappId}
                                onChange={(e) => setEditForm({ ...editForm, whatsappId: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-telegram">Telegram ID</Label>
                            <Input
                                id="edit-telegram"
                                value={editForm.telegramId}
                                onChange={(e) => setEditForm({ ...editForm, telegramId: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(value: Role) => setEditForm({ ...editForm, role: value })}
                            >
                                <SelectTrigger id="edit-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="RESELLER">Reseller</SelectItem>
                                    <SelectItem value="BASIC">Basic</SelectItem>
                                    <SelectItem value="OFFLINE">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-balance">Balance</Label>
                            <Input
                                id="edit-balance"
                                type="number"
                                value={editForm.balance}
                                onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-pricingTierId">Pricing Tier</Label>
                            <Select
                                value={editForm.pricingTierId || "BRONZE"}
                                onValueChange={(value) => setEditForm({ ...editForm, pricingTierId: value })}
                            >
                                <SelectTrigger id="edit-pricingTierId">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {pricingTiers && pricingTiers.length > 0 ? (
                                        pricingTiers.map((tier: any) => (
                                            <SelectItem key={tier.id} value={tier.code || tier.id}>
                                                {tier.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="BRONZE">Bronze</SelectItem>
                                            <SelectItem value="SILVER">Silver</SelectItem>
                                            <SelectItem value="GOLD">Gold</SelectItem>
                                            <SelectItem value="PLATINUM">Platinum</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {session?.user?.role?.toLowerCase() === 'super_admin' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">No. HP</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editForm.phoneNumber || ''}
                                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="edit-sellOffline"
                                        checked={editForm.sellOffline || false}
                                        onChange={(e) => setEditForm({ ...editForm, sellOffline: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="edit-sellOffline" className="font-normal">Sell Offline</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="edit-emailVerified"
                                        checked={editForm.emailVerified || false}
                                        onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="edit-emailVerified" className="font-normal">Email Verified</Label>
                                </div>
                            </>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditId(null)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Ban User Dialog */}
            <Dialog open={!!banUserId} onOpenChange={(open) => !open && setBanUserId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="ban-reason">Alasan Ban</Label>
                            <Input
                                id="ban-reason"
                                placeholder="Masukkan alasan ban..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanUserId(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBanSubmit}
                            disabled={toggleBanMutation.isPending}
                        >
                            {toggleBanMutation.isPending ? 'Memproses...' : 'Ban User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </div>
    );
}
