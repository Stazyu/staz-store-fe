"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FiEye, FiUserX, FiUserCheck, FiSearch, FiRefreshCw, FiChevronUp, FiChevronDown, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight, FiMail, FiPhone, FiCalendar, FiShoppingBag, FiClock } from "react-icons/fi";

type Role = 'admin' | 'basic' | 'reseller' | 'offline';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalTransactions: number;
  active: boolean;
  joinDate: string;
  lastPurchase?: string;
  role: Role;
}

type SortField = 'name' | 'email' | 'totalTransactions' | 'joinDate' | 'lastPurchase' | 'role';
type SortDirection = 'asc' | 'desc';

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Wahyu Hidayat",
    email: "wahyu@mail.com",
    phone: "08123456789",
    totalTransactions: 23,
    active: true,
    joinDate: "2023-01-15",
    lastPurchase: "2025-06-13 10:30",
    role: 'admin'
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "budi@mail.com",
    phone: "08121234567",
    totalTransactions: 8,
    active: true,
    joinDate: "2023-03-22",
    lastPurchase: "2025-06-12 15:45",
    role: 'reseller'
  },
  {
    id: 3,
    name: "Siti Aminah",
    email: "siti@mail.com",
    role: 'basic',
    phone: "08129876543",
    totalTransactions: 15,
    active: false,
    joinDate: "2023-02-10",
    lastPurchase: "2025-05-28 09:15"
  },
  {
    id: 4,
    name: "Ahmad Fauzi",
    email: "ahmad@mail.com",
    phone: "081311223344",
    totalTransactions: 32,
    active: true,
    joinDate: "2022-11-05",
    lastPurchase: "2025-06-13 14:20",
    role: 'reseller'
  },
  {
    id: 5,
    name: "Dewi Lestari",
    email: "dewi@mail.com",
    phone: "081522334455",
    totalTransactions: 5,
    active: true,
    joinDate: "2023-04-18",
    lastPurchase: "2025-06-10 11:10",
    role: 'basic'
  },
  {
    id: 6,
    name: "Rudi Hermawan",
    email: "rudi@mail.com",
    phone: "081633445566",
    totalTransactions: 19,
    active: false,
    joinDate: "2022-12-30",
    lastPurchase: "2025-05-15 16:25",
    role: 'basic'
  },
  {
    id: 7,
    name: "Maya Sari",
    email: "maya@mail.com",
    phone: "081744556677",
    totalTransactions: 42,
    active: true,
    joinDate: "2022-09-14",
    lastPurchase: "2025-06-12 13:45",
    role: 'reseller'
  },
  {
    id: 8,
    name: "Fajar Setiawan",
    email: "fajar@mail.com",
    phone: "081855667788",
    totalTransactions: 11,
    active: true,
    joinDate: "2023-01-28",
    lastPurchase: "2025-06-11 17:30",
    role: 'offline'
  },
  {
    id: 9,
    name: "Rina Wijaya",
    email: "rina@mail.com",
    phone: "081966778899",
    totalTransactions: 27,
    active: true,
    joinDate: "2022-10-22",
    lastPurchase: "2025-06-13 09:15",
    role: 'reseller'
  },
  {
    id: 10,
    name: "Hendra Kurniawan",
    email: "hendra@mail.com",
    phone: "082177889900",
    totalTransactions: 3,
    active: true,
    joinDate: "2023-05-10",
    lastPurchase: "2025-06-08 14:50",
    role: 'basic'
  },
];

export default function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>(
    { field: 'name', direction: 'asc' }
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle deactivate customer
  const handleDeactivate = (id: number) => {
    setCustomers(list => list.map(c => c.id === id ? { ...c, active: false } : c));
  };

  const handleActivate = (id: number) => {
    setCustomers(list => list.map(c => c.id === id ? { ...c, active: true } : c));
  };

  // Handle refresh data
  const handleRefresh = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setSortConfig({ field: 'name', direction: 'asc' });
    setCurrentPage(1);
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        customer =>
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term) ||
          customer.phone.includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter(customer => customer.active === isActive);
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(customer => customer.role === roleFilter);
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
  }, [customers, searchTerm, statusFilter, roleFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / rowsPerPage);
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const detailCustomer = customers.find(c => c.id === detailId);

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

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg">Data Pelanggan</CardTitle>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari pelanggan..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Segarkan
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('name')}
              >
                Nama {renderSortIcon('name')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('email')}
              >
                Email {renderSortIcon('email')}
              </TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead
                className="text-center cursor-pointer hover:bg-accent"
                onClick={() => handleSort('totalTransactions')}
              >
                Total Transaksi {renderSortIcon('totalTransactions')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('joinDate')}
              >
                Bergabung {renderSortIcon('joinDate')}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('role')}
              >
                Role {renderSortIcon('role')}
              </TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((cust, idx) => (
                <TableRow key={cust.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium text-center">{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                  <TableCell className="font-medium">{cust.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cust.email}</TableCell>
                  <TableCell>{cust.phone}</TableCell>
                  <TableCell className="text-center">{cust.totalTransactions}</TableCell>
                  <TableCell>{new Date(cust.joinDate).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    {cust.active ? (
                      <span className="px-2 py-1 rounded-full bg-green-700 text-gray-100 text-xs font-medium transition-none">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-red-700 text-gray-100 text-xs font-medium transition-none">
                        Nonaktif
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cust.role === 'admin' ? 'bg-purple-700 text-gray-100' :
                      cust.role === 'reseller' ? 'bg-blue-700 text-gray-100' :
                        cust.role === 'offline' ? 'bg-yellow-700 text-gray-100' :
                          'bg-gray-700 text-gray-100'
                      }`}>
                      {cust.role.charAt(0).toUpperCase() + cust.role.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex space-x-1 justify-center">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailId(cust.id)}>
                        <FiEye className="h-4 w-4" />
                      </Button>
                      {cust.active ? (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDeactivate(cust.id)}>
                          <FiUserX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => handleActivate(cust.id)}>
                          <FiUserCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Tidak ada data pelanggan yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan {paginatedCustomers.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} - {
            Math.min(currentPage * rowsPerPage, filteredAndSortedCustomers.length)
          } dari {filteredAndSortedCustomers.length} pelanggan
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Baris per halaman</p>
            <Select
              value={`${rowsPerPage}`}
              onValueChange={(value: string) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={rowsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {totalPages > 1 && renderPagination()}
        </div>
      </CardFooter>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-md md:max-w-2xl rounded-lg">
          {detailCustomer && (
            <div className="space-y-6">
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {detailCustomer.name}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {String(detailCustomer.id).padStart(6, '0')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium transition-none ${detailCustomer.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    }`}>
                    {detailCustomer.active ? 'Aktif' : 'Nonaktif'}
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
                      <FiMail className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white">{detailCustomer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiPhone className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Telepon</p>
                        <p className="text-gray-900 dark:text-white">{detailCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <span className={`h-2.5 w-2.5 rounded-full ${detailCustomer.role === 'admin' ? 'bg-purple-500' :
                          detailCustomer.role === 'reseller' ? 'bg-blue-500' :
                            detailCustomer.role === 'offline' ? 'bg-yellow-500' :
                              'bg-gray-500'
                          }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                        <p className="text-gray-900 dark:text-white">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detailCustomer.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                            detailCustomer.role === 'reseller' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                              detailCustomer.role === 'offline' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200'
                            }`}>
                            {detailCustomer.role.charAt(0).toUpperCase() + detailCustomer.role.slice(1)}
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
                      <FiShoppingBag className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transaksi</p>
                        <p className="text-gray-900 dark:text-white font-medium">{detailCustomer.totalTransactions} transaksi</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiCalendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bergabung</p>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(detailCustomer.joinDate).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {detailCustomer.lastPurchase && (
                      <div className="flex items-start">
                        <FiClock className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Terakhir Belanja</p>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(detailCustomer.lastPurchase).toLocaleDateString('id-ID', {
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

              <div className="pt-4 border-t flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDetailId(null)}
                  className="px-6"
                >
                  Tutup
                </Button>
                <Button
                  variant={detailCustomer.active ? "destructive" : "default"}
                  onClick={() => {
                    if (detailCustomer.active) {
                      handleDeactivate(detailCustomer.id);
                    } else {
                      handleActivate(detailCustomer.id);
                    }
                  }}
                  className="px-6"
                >
                  {detailCustomer.active ? 'Nonaktifkan' : 'Aktifkan'} Akun
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
