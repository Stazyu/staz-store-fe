"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch, FiActivity, FiDollarSign, FiTag, FiPackage } from 'react-icons/fi';

import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";

// Define a union type for product categories
type ProductCategory = "Game" | "Pulsa" | "PLN" | "E-Money" | string;

interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  brand: string;         // Nama brand/merek produk
  basePrice: number;
  resellerPrice: number;  // Harga reseller
  onlinePrice: number;    // Harga online
  offlinePrice: number;   // Harga offline
  active: boolean;
  isManual: boolean;     // Menandakan apakah produk manual atau tidak
  stock?: number; // Made optional since it's removed from the form
  sold: number;
  sku: string;
  description: string;
  profitMargin: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type SortField = keyof Product;
type SortDirection = 'asc' | 'desc';

const generateMockProducts = (): Product[] => {
  // Helper function to calculate profit margin
  const calculateProfitMargin = (basePrice: number, sellPrice: number) => {
    return basePrice ? Math.round(((sellPrice - basePrice) / basePrice) * 100) : 0;
  };

  // Helper function to generate random date within the last 6 months
  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const gameProducts: Product[] = [
    {
      id: 1,
      name: "Mobile Legends 100 Diamond",
      category: "Game",
      brand: "Moonton",
      basePrice: 10000,
      resellerPrice: 9000,
      onlinePrice: 10000,
      offlinePrice: 11000,
      active: true,
      isManual: false,
      stock: 150,
      sold: 423,
      sku: 'ML100-001',
      description: '100 Diamond Mobile Legends',
      profitMargin: calculateProfitMargin(10000, 10000),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-06-15')
    },
    {
      id: 6,
      name: "PUBG Mobile 100 UC",
      category: "Game",
      brand: "Tencent",
      basePrice: 15000,
      resellerPrice: 14000,
      onlinePrice: 16000,
      offlinePrice: 17000,
      active: true,
      isManual: false,
      stock: 85,
      sold: 210,
      sku: 'PUBG100-001',
      description: '100 UC PUBG Mobile',
      profitMargin: calculateProfitMargin(15000, 16000),
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 1), new Date())
    },
    {
      id: 7,
      name: "Valorant 1000 VP",
      category: "Game",
      brand: "Riot Games",
      basePrice: 120000,
      resellerPrice: 115000,
      onlinePrice: 125000,
      offlinePrice: 130000,
      active: true,
      isManual: false,
      stock: 42,
      sold: 178,
      sku: 'VAL1000-001',
      description: '1000 Valorant Points',
      profitMargin: calculateProfitMargin(120000, 125000),
      createdAt: randomDate(new Date(2024, 1, 1), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 10), new Date())
    },
    {
      id: 8,
      name: "Genshin Impact 300 Genesis",
      category: "Game",
      brand: "miHoYo",
      basePrice: 75000,
      resellerPrice: 70000,
      onlinePrice: 80000,
      offlinePrice: 85000,
      active: true,
      isManual: false,
      stock: 63,
      sold: 294,
      sku: 'GI300-001',
      description: '300 Genesis Crystals Genshin Impact',
      profitMargin: calculateProfitMargin(75000, 80000),
      createdAt: randomDate(new Date(2024, 2, 1), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 5), new Date())
    },
    {
      id: 9,
      name: "Call of Duty Mobile 500 CP",
      category: "Game",
      brand: "Activision",
      basePrice: 85000,
      resellerPrice: 80000,
      onlinePrice: 90000,
      offlinePrice: 95000,
      active: true,
      isManual: false,
      stock: 37,
      sold: 156,
      sku: 'CODM500-001',
      description: '500 CP Call of Duty Mobile',
      profitMargin: calculateProfitMargin(85000, 90000),
      createdAt: randomDate(new Date(2024, 3, 1), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 8), new Date())
    },
    {
      id: 10,
      name: "Apex Legends 1000 Coins",
      category: "Game",
      brand: "EA",
      basePrice: 145000,
      resellerPrice: 140000,
      onlinePrice: 150000,
      offlinePrice: 160000,
      active: true,
      isManual: false,
      stock: 28,
      sold: 87,
      sku: 'APEX1000-001',
      description: '1000 Apex Coins',
      profitMargin: calculateProfitMargin(145000, 150000),
      createdAt: randomDate(new Date(2024, 1, 15), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 12), new Date())
    },
    {
      id: 11,
      name: "Roblox 400 Robux",
      category: "Game",
      brand: "Roblox",
      basePrice: 50000,
      resellerPrice: 48000,
      onlinePrice: 55000,
      offlinePrice: 60000,
      active: true,
      isManual: false,
      stock: 92,
      sold: 345,
      sku: 'RB400-001',
      description: '400 Robux',
      profitMargin: calculateProfitMargin(50000, 55000),
      createdAt: randomDate(new Date(2024, 2, 10), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 14), new Date())
    },
    {
      id: 12,
      name: "Minecraft Java Edition",
      category: "Game",
      brand: "Mojang",
      basePrice: 250000,
      resellerPrice: 240000,
      onlinePrice: 260000,
      offlinePrice: 270000,
      active: true,
      isManual: false,
      stock: 15,
      sold: 63,
      sku: 'MC-JAVA-001',
      description: 'Minecraft Java Edition Full Game',
      profitMargin: calculateProfitMargin(250000, 260000),
      createdAt: randomDate(new Date(2024, 1, 5), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 18), new Date())
    }
  ];

  const pulsaProducts: Product[] = [
    {
      id: 2,
      name: "Pulsa Telkomsel 50K",
      category: "Pulsa",
      brand: "Telkomsel",
      basePrice: 48000,
      resellerPrice: 45900,
      onlinePrice: 51000,
      offlinePrice: 56100,
      active: true,
      isManual: false,
      stock: 200,
      sold: 356,
      sku: 'PTS50-001',
      description: 'Pulsa Telkomsel 50.000',
      profitMargin: calculateProfitMargin(48000, 51000),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-06-12')
    },
    {
      id: 13,
      name: "Pulsa XL 25K",
      category: "Pulsa",
      brand: "XL",
      basePrice: 24000,
      resellerPrice: 23000,
      onlinePrice: 25000,
      offlinePrice: 26000,
      active: true,
      isManual: false,
      stock: 150,
      sold: 289,
      sku: 'PXL25-001',
      description: 'Pulsa XL 25.000',
      profitMargin: calculateProfitMargin(24000, 25000),
      createdAt: randomDate(new Date(2024, 1, 5), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 10), new Date())
    },
    {
      id: 14,
      name: "Pulsa Indosat 100K",
      category: "Pulsa",
      brand: "Indosat",
      basePrice: 98000,
      resellerPrice: 95000,
      onlinePrice: 102000,
      offlinePrice: 105000,
      active: true,
      isManual: false,
      stock: 85,
      sold: 143,
      sku: 'PIND100-001',
      description: 'Pulsa Indosat 100.000',
      profitMargin: calculateProfitMargin(98000, 102000),
      createdAt: randomDate(new Date(2024, 0, 20), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 15), new Date())
    },
    {
      id: 15,
      name: "Pulsa Tri 10K",
      category: "Pulsa",
      brand: "Tri",
      basePrice: 9500,
      resellerPrice: 9200,
      onlinePrice: 10000,
      offlinePrice: 11000,
      active: true,
      isManual: false,
      stock: 300,
      sold: 512,
      sku: 'PTRI10-001',
      description: 'Pulsa Tri 10.000',
      profitMargin: calculateProfitMargin(9500, 10000),
      createdAt: randomDate(new Date(2024, 2, 10), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 5), new Date())
    },
    {
      id: 16,
      name: "Pulsa Smartfren 5K",
      category: "Pulsa",
      brand: "Smartfren",
      basePrice: 4800,
      resellerPrice: 4500,
      onlinePrice: 5000,
      offlinePrice: 6000,
      active: true,
      isManual: false,
      stock: 250,
      sold: 478,
      sku: 'PSMART5-001',
      description: 'Pulsa Smartfren 5.000',
      profitMargin: calculateProfitMargin(4800, 5000),
      createdAt: randomDate(new Date(2024, 1, 15), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 12), new Date())
    },
    {
      id: 17,
      name: "Pulsa Axis 20K",
      category: "Pulsa",
      brand: "Axis",
      basePrice: 19500,
      resellerPrice: 18500,
      onlinePrice: 20000,
      offlinePrice: 21000,
      active: true,
      isManual: false,
      stock: 175,
      sold: 324,
      sku: 'PAXIS20-001',
      description: 'Pulsa Axis 20.000',
      profitMargin: calculateProfitMargin(19500, 20000),
      createdAt: randomDate(new Date(2024, 2, 5), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 8), new Date())
    }
  ];

  const plnProducts: Product[] = [
    {
      id: 3,
      name: "Token PLN 100K",
      category: "PLN",
      brand: "PLN",
      basePrice: 95000,
      resellerPrice: 95000,
      onlinePrice: 100000,
      offlinePrice: 105000,
      active: true,
      isManual: false,
      stock: 75,
      sold: 89,
      sku: 'TPLN100-001',
      description: 'Token PLN 100.000',
      profitMargin: calculateProfitMargin(95000, 100000),
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-06-11')
    },
    {
      id: 18,
      name: "Token PLN 200K",
      category: "PLN",
      brand: "PLN",
      basePrice: 195000,
      resellerPrice: 195000,
      onlinePrice: 200000,
      offlinePrice: 205000,
      active: true,
      isManual: false,
      stock: 45,
      sold: 67,
      sku: 'TPLN200-001',
      description: 'Token PLN 200.000',
      profitMargin: calculateProfitMargin(195000, 200000),
      createdAt: randomDate(new Date(2024, 1, 15), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 10), new Date())
    },
    {
      id: 19,
      name: "Token PLN 50K",
      category: "PLN",
      brand: "PLN",
      basePrice: 49000,
      resellerPrice: 49000,
      onlinePrice: 50000,
      offlinePrice: 52000,
      active: true,
      isManual: false,
      stock: 120,
      sold: 210,
      sku: 'TPLN50-001',
      description: 'Token PLN 50.000',
      profitMargin: calculateProfitMargin(49000, 50000),
      createdAt: randomDate(new Date(2024, 2, 1), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 14), new Date())
    },
    {
      id: 20,
      name: "Token PLN 500K",
      category: "PLN",
      brand: "PLN",
      basePrice: 495000,
      resellerPrice: 495000,
      onlinePrice: 500000,
      offlinePrice: 510000,
      active: true,
      isManual: false,
      stock: 25,
      sold: 38,
      sku: 'TPLN500-001',
      description: 'Token PLN 500.000',
      profitMargin: calculateProfitMargin(495000, 500000),
      createdAt: randomDate(new Date(2024, 1, 10), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 5), new Date())
    },
    {
      id: 21,
      name: "Token PLN 1JT",
      category: "PLN",
      brand: "PLN",
      basePrice: 995000,
      resellerPrice: 995000,
      onlinePrice: 1000000,
      offlinePrice: 1010000,
      active: true,
      isManual: false,
      stock: 15,
      sold: 24,
      sku: 'TPLN1000-001',
      description: 'Token PLN 1.000.000',
      profitMargin: calculateProfitMargin(995000, 1000000),
      createdAt: randomDate(new Date(2024, 0, 15), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 1), new Date())
    }
  ];

  const emoneyProducts: Product[] = [
    {
      id: 4,
      name: "Gopay 25K",
      category: "E-Money",
      brand: "GoPay",
      basePrice: 24000,
      resellerPrice: 23000,
      onlinePrice: 25000,
      offlinePrice: 26000,
      active: true,
      isManual: true,
      stock: 120,
      sold: 210,
      sku: 'GOPAY25-001',
      description: 'Saldo Gopay 25.000',
      profitMargin: calculateProfitMargin(24000, 25000),
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-06-14')
    },
    {
      id: 22,
      name: "Dana 50K",
      category: "E-Money",
      brand: "DANA",
      basePrice: 49000,
      resellerPrice: 48000,
      onlinePrice: 50000,
      offlinePrice: 52000,
      active: true,
      isManual: true,
      stock: 95,
      sold: 178,
      sku: 'DANA50-001',
      description: 'Saldo DANA 50.000',
      profitMargin: calculateProfitMargin(49000, 50000),
      createdAt: randomDate(new Date(2024, 2, 10), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 12), new Date())
    },
    {
      id: 23,
      name: "OVO 100K",
      category: "E-Money",
      brand: "OVO",
      basePrice: 98000,
      resellerPrice: 96000,
      onlinePrice: 100000,
      offlinePrice: 102000,
      active: true,
      isManual: true,
      stock: 65,
      sold: 143,
      sku: 'OVO100-001',
      description: 'Saldo OVO 100.000',
      profitMargin: calculateProfitMargin(98000, 100000),
      createdAt: randomDate(new Date(2024, 1, 15), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 10), new Date())
    },
    {
      id: 24,
      name: "ShopeePay 20K",
      category: "E-Money",
      brand: "ShopeePay",
      basePrice: 19500,
      resellerPrice: 19000,
      onlinePrice: 20000,
      offlinePrice: 21000,
      active: true,
      isManual: true,
      stock: 150,
      sold: 267,
      sku: 'SPAY20-001',
      description: 'Saldo ShopeePay 20.000',
      profitMargin: calculateProfitMargin(19500, 20000),
      createdAt: randomDate(new Date(2024, 2, 1), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 8), new Date())
    },
    {
      id: 25,
      name: "LinkAja 50K",
      category: "E-Money",
      brand: "LinkAja",
      basePrice: 49000,
      resellerPrice: 48000,
      onlinePrice: 50000,
      offlinePrice: 52000,
      active: true,
      isManual: true,
      stock: 80,
      sold: 156,
      sku: 'LAJA50-001',
      description: 'Saldo LinkAja 50.000',
      profitMargin: calculateProfitMargin(49000, 50000),
      createdAt: randomDate(new Date(2024, 1, 20), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 15), new Date())
    },
    {
      id: 26,
      name: "Dana 10K",
      category: "E-Money",
      brand: "DANA",
      basePrice: 9500,
      resellerPrice: 9000,
      onlinePrice: 10000,
      offlinePrice: 11000,
      active: true,
      isManual: true,
      stock: 200,
      sold: 345,
      sku: 'DANA10-001',
      description: 'Saldo DANA 10.000',
      profitMargin: calculateProfitMargin(9500, 10000),
      createdAt: randomDate(new Date(2024, 2, 5), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 10), new Date())
    },
    {
      id: 27,
      name: "OVO 20K",
      category: "E-Money",
      brand: "OVO",
      basePrice: 19500,
      resellerPrice: 19000,
      onlinePrice: 20000,
      offlinePrice: 21000,
      active: true,
      isManual: true,
      stock: 180,
      sold: 289,
      sku: 'OVO20-001',
      description: 'Saldo OVO 20.000',
      profitMargin: calculateProfitMargin(19500, 20000),
      createdAt: randomDate(new Date(2024, 1, 10), new Date()),
      updatedAt: randomDate(new Date(2024, 5, 12), new Date())
    }
  ];

  // Combine all products
  const initialProducts: Product[] = [
    ...gameProducts,
    ...pulsaProducts,
    ...plnProducts,
    ...emoneyProducts
  ];

  return initialProducts;
};

const categories = ["Game", "Pulsa", "PLN", "E-Money"] as const;

const COLORS = {
  Game: '#3b82f6',
  Pulsa: '#10b981',
  PLN: '#f59e0b',
  'E-Money': '#8b5cf6'
};

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Calculate profit margin helper function
  const calculateProfitMargin = (basePrice: number, sellPrice: number): number => {
    return basePrice ? Math.round(((sellPrice - basePrice) / basePrice) * 100) : 0;
  };

  const [error, setError] = useState<string | null>(null);

  // Get sort icon based on current sort configuration
  const getSortIcon = (field: keyof Product) => {
    if (!sortConfig || sortConfig.key !== field) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  const [detailId, setDetailId] = useState<number | null>(null);
  // Form values are initialized directly in the useState hook below

  // Extend the Product type to include margin for form state
  interface ProductFormValues extends Omit<Product, 'id' | 'profitMargin'> {
    margin?: string; // Store as string for input field, parse to number when needed
    pricingMethod?: 'margin' | 'fixed';
  }

  const [form, setForm] = useState<ProductFormValues>({
    name: '',
    brand: '',
    category: 'Game',
    basePrice: 0,
    resellerPrice: 0,
    onlinePrice: 0,
    offlinePrice: 0,
    active: true,
    isManual: false, // Default to automatic product
    sold: 0,
    sku: '',
    description: '',
    margin: '0',
    pricingMethod: 'fixed',
  });
  const [pricingMethod, setPricingMethod] = useState<'margin' | 'fixed'>('fixed');
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortField; direction: SortDirection } | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [5, 10, 20, 50];

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(generateMockProducts());
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Reset to first page when page size changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Handle sorting
  const requestSort = (key: keyof Product) => {
    let direction: SortDirection = 'asc';

    if (sortConfig?.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }

    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    const sortableProducts = [...products];

    if (sortConfig?.key) {
      sortableProducts.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Product] ?? '';
        const bValue = b[sortConfig.key as keyof Product] ?? '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableProducts;
  }, [products, sortConfig]);

  // Use sorted products for display
  const displayProducts = sortConfig ? sortedProducts : products;

  // Filter products based on search and filters
  const filtered = React.useMemo(() => {
    return displayProducts.filter(prod => {
      const matchesSearch = search === '' ||
        prod.name.toLowerCase().includes(search.toLowerCase()) ||
        prod.category.toLowerCase().includes(search.toLowerCase()) ||
        (prod.sku && prod.sku.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = !filterCategory || prod.category === filterCategory;
      const matchesStatus = !filterStatus ||
        (filterStatus === 'active' && prod.active) ||
        (filterStatus === 'inactive' && !prod.active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [displayProducts, search, filterCategory, filterStatus]);

  // Pagination
  const totalPage = Math.ceil(filtered.length / pageSize);
  const paginated = React.useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);
  const detailProd = products.find(p => p.id === detailId);

  // Calculate summary stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const totalSales = products.reduce((sum, p) => sum + (p.sold || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.onlinePrice * (p.sold || 0)), 0);

  const handleAdd = () => {
    setForm({
      name: '',
      brand: '',
      category: 'Game',
      basePrice: 0,
      resellerPrice: 0,
      onlinePrice: 0,
      offlinePrice: 0,
      active: true,
      isManual: true,
      stock: 0,
      sold: 0,
      sku: '',
      description: '',
      margin: '0',
      pricingMethod: 'fixed',
    });
    setEditingId(null);
    setOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Prepare product data without the margin field
      // Using _ prefix to indicate we're intentionally not using this variable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { margin, ...productData } = form;

      if (editingId) {
        // Update existing product
        setProducts(products.map(p =>
          p.id === editingId
            ? {
              ...productData,
              id: editingId,
              profitMargin: calculateProfitMargin(form.basePrice, form.onlinePrice),
              updatedAt: new Date()
            }
            : p
        ));
      } else {
        // Add new product
        const newProduct: Product = {
          id: Math.max(0, ...products.map(p => p.id)) + 1,
          ...productData,
          // Set default stock to 0 if not provided
          stock: 0,
          profitMargin: calculateProfitMargin(form.basePrice, form.onlinePrice),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProducts([...products, newProduct]);
      }

      setOpen(false);
      setForm({
        name: '',
        brand: '',
        category: 'Game',
        basePrice: 0,
        resellerPrice: 0,
        onlinePrice: 0,
        offlinePrice: 0,
        active: true,
        isManual: false,
        sold: 0,
        sku: '',
        description: '',
        margin: '0',
      });
      setEditingId(null);
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan produk');
      console.error('Error saving product:', err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Simulate API call
      setTimeout(() => {
        setProducts(products.filter(product => product.id !== productToDelete));
        setDeleteDialogOpen(false);
        setIsDeleting(false);
      }, 500);
    } catch (error) {
      setDeleteError('Gagal menghapus produk. Silakan coba lagi.');
      console.error('Error deleting product:', error);
      setIsDeleting(false);
    }
  };

  // Helper to get margin as a number, defaulting to 0 if invalid or undefined
  const getMarginAsNumber = (margin: string | number | undefined): number => {
    if (margin === undefined) return 0;
    const num = typeof margin === 'string' ? parseFloat(margin) : margin;
    return isNaN(num) ? 0 : num;
  };

  // Handle pricing method change
  const handlePricingMethodChange = (method: 'margin' | 'fixed') => {
    setPricingMethod(method);

    if (method === 'margin' && form.basePrice > 0) {
      // Calculate initial margin based on online price if it exists
      if (form.onlinePrice > 0) {
        const margin = ((form.onlinePrice - form.basePrice) / form.basePrice) * 100;
        setForm(prev => ({
          ...prev,
          margin: margin.toFixed(2)
        }));
      }
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Update form state
    setForm(prev => {
      const updatedForm = {
        ...prev,
        [name]: type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number' ? Number(value) : value
      };

      // If margin or base price changes in margin mode, update reseller and online prices
      // Offline price can be edited separately
      if (pricingMethod === 'margin' && (name === 'margin' || name === 'basePrice')) {
        const margin = name === 'margin' ? getMarginAsNumber(value) : getMarginAsNumber(prev.margin);
        const basePrice = name === 'basePrice' ? Number(value) : prev.basePrice;

        if (basePrice > 0) {
          const calculatedPrice = Math.round(basePrice * (1 + (margin / 100)));
          updatedForm.resellerPrice = calculatedPrice;
          updatedForm.onlinePrice = Math.round(calculatedPrice * 1.02); // 102% of reseller price
          updatedForm.offlinePrice = Math.round(calculatedPrice * 1.04); // 104% of reseller price
          // Offline price remains unchanged to allow manual editing
        }
      }
      // If any price changes in fixed price mode, update margin based on online price
      else if (pricingMethod === 'fixed' && (name === 'resellerPrice' || name === 'onlinePrice' || name === 'offlinePrice') && prev.basePrice > 0) {
        const onlinePrice = name === 'onlinePrice' ? Number(value) : prev.onlinePrice;
        const margin = ((onlinePrice - prev.basePrice) / prev.basePrice) * 100;
        updatedForm.margin = margin.toFixed(2);
      }

      return updatedForm;
    });

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleEdit = (prod: Product) => {
    setEditingId(prod.id);
    setPricingMethod('fixed'); // Default to fixed pricing when editing

    // Calculate initial margin based on online price
    const margin = prod.basePrice > 0
      ? ((prod.onlinePrice - prod.basePrice) / prod.basePrice) * 100
      : 0;

    setForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      basePrice: prod.basePrice,
      resellerPrice: prod.resellerPrice,
      onlinePrice: prod.onlinePrice,
      offlinePrice: prod.offlinePrice,
      active: prod.active,
      isManual: prod.isManual,
      sold: prod.sold, // This will be read-only
      sku: prod.sku,
      description: prod.description,
      margin: margin.toFixed(2) // Store as string with 2 decimal places
    });
    setOpen(true);
  };

  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setSearch('');
            setFilterCategory('');
            setFilterStatus('');
            setPage(1);
          }}>
            Reset Filter
          </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
              Nama Produk {getSortIcon('name')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort('category')}>
              Kategori {getSortIcon('category')}
            </TableHead>
            <TableHead className="w-[120px] cursor-pointer hover:bg-muted/50" onClick={() => requestSort('brand')}>
              Brand {getSortIcon('brand')}
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => requestSort('resellerPrice')}>
              Harga Reseller {getSortIcon('resellerPrice')}
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => requestSort('onlinePrice')}>
              Harga Online {getSortIcon('onlinePrice')}
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => requestSort('offlinePrice')}>
              Harga Offline {getSortIcon('offlinePrice')}
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => requestSort('profitMargin')}>
              Margin {getSortIcon('profitMargin')}
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => requestSort('sold')}>
              Terjual {getSortIcon('sold')}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">{product.sku}</div>
              </TableCell>
              <TableCell>
                <div
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${COLORS[product.category as keyof typeof COLORS] || '#8884d8'}33`,
                    color: COLORS[product.category as keyof typeof COLORS] || '#8884d8',
                  }}
                >
                  {product.category}
                </div>
              </TableCell>
              <TableCell className="text-left">
                {product.brand}
              </TableCell>
              <TableCell className="text-right">{formatRupiah(product.resellerPrice)}</TableCell>
              <TableCell className="text-right">{formatRupiah(product.onlinePrice)}</TableCell>
              <TableCell className="text-right">{formatRupiah(product.offlinePrice)}</TableCell>
              <TableCell className="text-right">
                <span className={product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.profitMargin >= 0 ? '+' : ''}{product.profitMargin}%
                </span>
              </TableCell>
              <TableCell className="text-right">{product.sold || 0}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                  {product.active ? 'Aktif' : 'Tidak Aktif'}
                </div>
              </TableCell>
              <TableCell>
                {product.isManual ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Manual
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Otomatis
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(product.id);
                    }}
                    type="button"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDetailId(product.id)}
                    type="button"
                  >
                    <FiEye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(product)}
                    type="button"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <FiPackage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} aktif, {totalProducts - activeProducts} tidak aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <FiActivity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalSales / (totalSales + 1)) * 100)}% dari target
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <FiDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Rata-rata {formatRupiah(totalSales ? Math.round(totalRevenue / totalSales) : 0)} per transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produk Terlaris</CardTitle>
            <FiTag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {products.length > 0
                ? products.reduce((prev, current) => (prev.sold || 0) > (current.sold || 0) ? prev : current).name
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {products.length > 0 ? products.reduce((prev, current) => (prev.sold || 0) > (current.sold || 0) ? prev : current).sold : 0} terjual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart produk terlaris */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Grafik Penjualan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                  width={40}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">
                            <span className="text-gray-500">Total Penjualan: </span>
                            <span className="font-medium">{payload[0].value}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Jumlah Produk: </span>
                            <span className="font-medium">{chartData.find(d => d.name === label)?.count}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
          <div>
            <CardTitle className="text-xl">Daftar Produk Digital</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kelola produk digital Anda dengan mudah
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="pl-10 w-full"
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <Button onClick={handleAdd} className="ml-auto">
              <FiPlus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </CardHeader>
        <div className="px-6 py-2 border-t border-b flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Menampilkan {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} dari {filtered.length} produk
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Per Halaman:</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm w-16"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <CardContent>
          {renderTable()}
        </CardContent>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t gap-4">
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPage || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-24"
            >
              Sebelumnya
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm px-2">Halaman</span>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm w-16 text-center"
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              >
                {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="text-sm px-2">dari {totalPage || 1}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPage || totalPage === 0}
              onClick={() => setPage(p => Math.min(totalPage, p + 1))}
              className="w-24"
            >
              Berikutnya
            </Button>
          </div>
        </div>
        {/* Modal detail produk */}
        <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Detail Produk</DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informasi lengkap produk</p>
            </DialogHeader>
            {detailProd && (
              <div className="space-y-6 py-2">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiPackage className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Informasi Dasar
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama</span>
                      <span className="text-sm text-gray-900 dark:text-white">{detailProd.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{detailProd.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${COLORS[detailProd.category as keyof typeof COLORS] || '#8884d8'}33`,
                          color: COLORS[detailProd.category as keyof typeof COLORS] || '#8884d8',
                        }}>
                        {detailProd.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${detailProd.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {detailProd.active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiDollarSign className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                    Harga
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Harga Reseller</span>
                      <span className="text-sm text-gray-900 dark:text-white">Rp {detailProd.resellerPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Harga Online</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Rp {detailProd.onlinePrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Harga Offline</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Rp {detailProd.offlinePrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Margin</span>
                      <span className={`text-sm font-medium ${detailProd.profitMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {detailProd.profitMargin >= 0 ? '+' : ''}{detailProd.profitMargin}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FiActivity className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Statistik
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Terjual</span>
                      <span className="text-sm text-gray-900 dark:text-white">{detailProd.sold || 0} unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipe</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        detailProd.isManual 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }">
                        {detailProd.isManual ? 'Manual' : 'Otomatis'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Modal tambah/edit produk */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingId ? "Edit Produk" : "Tambah Produk Baru"}
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {editingId ? "Perbarui detail produk Anda" : "Tambahkan produk baru ke katalog"}
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Contoh: Diamond Mobile Legends 86"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="Contoh: Moonton, Garena, dll"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-gray-800">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Metode Penentuan Harga <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer ${pricingMethod === 'fixed' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'}`}>
                        <input
                          type="radio"
                          name="pricingMethod"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          checked={pricingMethod === 'fixed'}
                          onChange={() => handlePricingMethodChange('fixed')}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Harga Tetap
                        </span>
                      </label>
                      <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer ${pricingMethod === 'margin' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600'}`}>
                        <input
                          type="radio"
                          name="pricingMethod"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          checked={pricingMethod === 'margin'}
                          onChange={() => handlePricingMethodChange('margin')}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Gunakan Margin (%)
                        </span>
                      </label>
                    </div>
                  </div>

                  {pricingMethod === 'margin' && (
                    <div>
                      <label htmlFor="margin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Margin <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <Input
                          type="number"
                          id="margin"
                          name="margin"
                          value={form.margin ?? ''}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="pr-10 w-full"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Harga akan dihitung otomatis berdasarkan margin
                      </p>
                    </div>
                  )}
                </div>

                {/* Manual Process Toggle */}
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="isManual"
                    name="isManual"
                    checked={form.isManual}
                    onChange={(e) => setForm({ ...form, isManual: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isManual" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Proses Manual
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 hover:text-gray-600 cursor-help ml-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <div className="hidden group-hover:block absolute z-10 w-64 p-2 text-xs text-gray-600 bg-white border border-gray-300 rounded shadow-lg -left-32 -top-12">
                      Centang jika produk ini membutuhkan proses manual (contoh: isi saldo manual, top up manual, dll)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="resellerPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Harga Reseller <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <Input
                        type="number"
                        id="resellerPrice"
                        name="resellerPrice"
                        value={form.resellerPrice}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="pl-10 w-full"
                        disabled={pricingMethod === 'margin'}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="onlinePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Harga Online <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <Input
                        type="number"
                        id="onlinePrice"
                        name="onlinePrice"
                        value={form.onlinePrice}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="pl-10 w-full"
                        disabled={pricingMethod === 'margin'}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="offlinePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Harga Offline <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <Input
                        type="number"
                        id="offlinePrice"
                        name="offlinePrice"
                        value={form.offlinePrice}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="pl-10 w-full"
                        // Always allow editing offline price
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sold">Terjual</label>
                  <Input
                    id="sold"
                    name="sold"
                    type="number"
                    value={form.sold}
                    onChange={handleChange}
                    min="0"
                    disabled
                    className="w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SKU/Referensi
                  </label>
                  <Input
                    id="sku"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Kode referensi produk"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Deskripsi lengkap produk"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Produk aktif
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setDeleteError(null);
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <DialogTitle>Hapus Produk</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{deleteError}</p>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
