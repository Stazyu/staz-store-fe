"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
    Image as ImageIcon,
    Search,
    Plus,
    Filter,
    RefreshCw,
    Eye,
    Edit2,
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
    ExternalLink,
    Calendar,
    Monitor,
    Tablet,
    Phone,
    UploadCloud,
    X,
    CheckCircle,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
    fetchBannersAdmin,
    createBanner,
    updateBanner,
    deleteBanner,
    updateBannerStatus,
    duplicateBanner,
    reorderBanners,
    uploadBannerImage,
} from "@/services/banner.client";
import type { Banner, BannerPosition, BannerStatus } from "@/types/banner.types";
import Image from "next/image";

const POSITION_LABELS: Record<BannerPosition, string> = {
    HOME_HERO: "Home Hero",
    HOME_CAROUSEL: "Home Carousel",
    HOME_PROMO_SECTION: "Promo Section",
    PRODUCT_TOP: "Product Page Top",
    CATEGORY_TOP: "Category Page Top",
    CHECKOUT_TOP: "Checkout Page Top",
};

const STATUS_BADGES: Record<BannerStatus, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400",
    INACTIVE: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
    SCHEDULED: "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:text-blue-400",
    EXPIRED: "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-rose-400",
};

export default function BannersTable() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Dialog/Form States
    const [formOpen, setFormOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
    const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

    // Form inputs state
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [ctaText, setCtaText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [imageDesktop, setImageDesktop] = useState("");
    const [imageMobile, setImageMobile] = useState("");
    const [altText, setAltText] = useState("");
    const [objectPosition, setObjectPosition] = useState("center center");
    const [position, setPosition] = useState<BannerPosition>("HOME_HERO");
    const [order, setOrder] = useState<number>(0);
    const [status, setStatus] = useState<BannerStatus>("INACTIVE");
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");

    const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
    const [isUploadingMobile, setIsUploadingMobile] = useState(false);

    // Queries
    const { data: banners = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ["adminBanners", { search, positionFilter, statusFilter }],
        queryFn: () => fetchBannersAdmin({
            search: search || undefined,
            position: positionFilter as BannerPosition,
            status: statusFilter as BannerStatus,
        }),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createBanner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
            queryClient.invalidateQueries({ queryKey: ["publicBanners"] });
            toast.success("Banner berhasil dibuat!");
            setFormOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal membuat banner.");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Banner> }) => updateBanner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
            queryClient.invalidateQueries({ queryKey: ["publicBanners"] });
            toast.success("Banner berhasil diperbarui!");
            setFormOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal memperbarui banner.");
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateBannerStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
            queryClient.invalidateQueries({ queryKey: ["publicBanners"] });
            toast.success("Status banner berhasil diubah!");
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal mengubah status banner.");
        },
    });

    const duplicateMutation = useMutation({
        mutationFn: duplicateBanner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
            queryClient.invalidateQueries({ queryKey: ["publicBanners"] });
            toast.success("Banner berhasil diduplikasi!");
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal menduplikasi banner.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBanner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
            queryClient.invalidateQueries({ queryKey: ["publicBanners"] });
            toast.success("Banner berhasil dihapus!");
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal menghapus banner.");
        },
    });

    const reorderMutation = useMutation({
        mutationFn: reorderBanners,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
            queryClient.invalidateQueries({ queryKey: ["publicBanners"] });
            toast.success("Urutan banner diperbarui!");
        },
        onError: (err: any) => {
            toast.error(err.message || "Gagal memperbarui urutan.");
        },
    });

    // Form handlers
    const resetForm = () => {
        setTitle("");
        setSubtitle("");
        setCtaText("");
        setLinkUrl("");
        setImageDesktop("");
        setImageMobile("");
        setAltText("");
        setObjectPosition("center center");
        setPosition("HOME_HERO");
        setOrder(0);
        setStatus("INACTIVE");
        setStartsAt("");
        setEndsAt("");
        setSelectedBanner(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setFormOpen(true);
    };

    const handleOpenEdit = (banner: Banner) => {
        setSelectedBanner(banner);
        setTitle(banner.title);
        setSubtitle(banner.subtitle || "");
        setCtaText(banner.ctaText || "");
        setLinkUrl(banner.linkUrl || "");
        setImageDesktop(banner.imageDesktop);
        setImageMobile(banner.imageMobile || "");
        setAltText(banner.altText);
        setObjectPosition(banner.objectPosition || "center center");
        setPosition(banner.position);
        setOrder(banner.order);
        setStatus(banner.status);
        setStartsAt(banner.startsAt ? banner.startsAt.substring(0, 16) : "");
        setEndsAt(banner.endsAt ? banner.endsAt.substring(0, 16) : "");
        setFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !imageDesktop || !altText) {
            toast.error("Mohon lengkapi semua field wajib.");
            return;
        }

        const data: Partial<Banner> = {
            title,
            subtitle: subtitle || null,
            ctaText: ctaText || null,
            linkUrl: linkUrl || null,
            imageDesktop,
            imageMobile: imageMobile || null,
            altText,
            objectPosition,
            position,
            order: Number(order),
            status,
            startsAt: startsAt ? new Date(startsAt).toISOString() : null,
            endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        };

        if (selectedBanner) {
            updateMutation.mutate({ id: selectedBanner.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleToggleStatus = (id: string, currentStatus: BannerStatus) => {
        const nextActive = currentStatus !== "ACTIVE";
        statusMutation.mutate({ id, isActive: nextActive });
    };

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleDuplicate = (id: string) => {
        duplicateMutation.mutate(id);
    };

    const handleMove = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= banners.length) return;

        const updated = [...banners];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        const ids = updated.map((b) => b.id);
        reorderMutation.mutate(ids);
    };

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === "desktop") setIsUploadingDesktop(true);
        else setIsUploadingMobile(true);

        try {
            const url = await uploadBannerImage(file);
            if (type === "desktop") setImageDesktop(url);
            else setImageMobile(url);
            toast.success("Gambar berhasil diunggah!");
        } catch (err: any) {
            toast.error(err.message || "Gagal mengunggah gambar.");
        } finally {
            if (type === "desktop") setIsUploadingDesktop(false);
            else setIsUploadingMobile(false);
        }
    };

    const handleOpenPreview = (banner: Banner) => {
        setPreviewBanner(banner);
        setPreviewViewport("desktop");
        setPreviewOpen(true);
    };

    const resolveImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
            return path;
        }
        return path; // Rewrites proxy handles relative paths beginning with /uploads
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 dark:border-blue-500/10 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:bg-none dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_35%),linear-gradient(135deg,#07111f_0%,#081e3d_45%,#071a33_100%)] shadow-[0_20px_80px_rgba(37,99,235,0.08)] p-6">
                <div
                    className="absolute inset-0 opacity-5 dark:opacity-10"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25">
                            <ImageIcon className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Banner</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Kelola banner promo di homepage dan halaman produk.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-800"
                        >
                            <RefreshCw className="size-4 mr-2" /> Segarkan
                        </Button>
                        <Button
                            onClick={handleOpenCreate}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20"
                        >
                            <Plus className="size-4 mr-2" /> Tambah Banner
                        </Button>
                    </div>
                </div>
            </div>

            {/* List Banners Card */}
            <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 backdrop-blur-md">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Daftar Banner</CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Atur banner promosi yang tampil di website.
                        </CardDescription>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-44">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul/link..."
                                className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 text-xs"
                            />
                        </div>

                        <Select value={positionFilter} onValueChange={setPositionFilter}>
                            <SelectTrigger className="w-[140px] h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 rounded-md">
                                <SelectValue placeholder="Semua Posisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Posisi</SelectItem>
                                {Object.entries(POSITION_LABELS).map(([val, label]) => (
                                    <SelectItem key={val} value={val}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-300 rounded-md">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                                <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch("");
                                setPositionFilter("all");
                                setStatusFilter("all");
                            }}
                            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-slate-500 dark:text-slate-400"
                        >
                            <Filter className="size-4 mr-2" /> Reset
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Banner</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Posisi</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Link Tujuan</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Urutan</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Status</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold">Jadwal/Tanggal</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-center">Performa</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-right pr-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="size-8 animate-spin text-blue-500" />
                                                <p className="text-sm font-medium">Memuat data banner...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-20 text-center text-rose-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-sm font-bold">Terjadi Kesalahan</p>
                                                <p className="text-xs text-slate-400">{(error as Error).message}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : banners.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <ImageIcon className="size-10 text-slate-400 dark:text-slate-600" />
                                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                    Belum ada banner
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    Buat banner promo pertama untuk landing page kamu.
                                                </p>
                                                <Button
                                                    onClick={handleOpenCreate}
                                                    size="sm"
                                                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                                >
                                                    <Plus className="size-4 mr-2" /> Tambah Banner
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    banners.map((banner, index) => (
                                        <TableRow
                                            key={banner.id}
                                            className="border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                        >
                                            <TableCell className="max-w-[220px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative size-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                                                        <Image
                                                            src={resolveImageUrl(banner.imageDesktop)}
                                                            alt={banner.altText}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{banner.title}</p>
                                                        {banner.subtitle && (
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{banner.subtitle}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {POSITION_LABELS[banner.position] || banner.position}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate text-xs font-mono text-slate-500 dark:text-slate-400">
                                                {banner.linkUrl ? (
                                                    <a
                                                        href={banner.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline flex items-center gap-1 hover:text-blue-500"
                                                    >
                                                        {banner.linkUrl} <ExternalLink className="size-3 shrink-0" />
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>{banner.order}</span>
                                                    <div className="flex flex-col">
                                                        <button
                                                            disabled={index === 0}
                                                            onClick={() => handleMove(index, "up")}
                                                            className="text-slate-400 hover:text-slate-950 dark:hover:text-white disabled:opacity-30"
                                                        >
                                                            <ArrowUp className="size-3" />
                                                        </button>
                                                        <button
                                                            disabled={index === banners.length - 1}
                                                            onClick={() => handleMove(index, "down")}
                                                            className="text-slate-400 hover:text-slate-950 dark:hover:text-white disabled:opacity-30"
                                                        >
                                                            <ArrowDown className="size-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-bold ${STATUS_BADGES[banner.displayStatus || banner.status]}`}
                                                >
                                                    {banner.displayStatus || banner.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {banner.startsAt || banner.endsAt ? (
                                                    <div className="space-y-0.5">
                                                        {banner.startsAt && (
                                                            <p className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-400">Mulai:</span>{" "}
                                                                {new Date(banner.startsAt).toLocaleDateString("id-ID")}
                                                            </p>
                                                        )}
                                                        {banner.endsAt && (
                                                            <p className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-400">Selesai:</span>{" "}
                                                                {new Date(banner.endsAt).toLocaleDateString("id-ID")}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Selamanya</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center text-xs whitespace-nowrap">
                                                <div className="text-left inline-block">
                                                    <p className="text-slate-500"><span className="font-bold text-slate-800 dark:text-slate-200">{banner.views}</span> Views</p>
                                                    <p className="text-slate-500"><span className="font-bold text-slate-800 dark:text-slate-200">{banner.clicks}</span> Clicks</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 whitespace-nowrap space-x-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenPreview(banner)}
                                                    className="size-8 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Preview"
                                                >
                                                    <Eye className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(banner)}
                                                    className="size-8 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDuplicate(banner.id)}
                                                    className="size-8 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Duplicate"
                                                >
                                                    <Copy className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleToggleStatus(banner.id, banner.status)}
                                                    className={`size-8 rounded-lg ${
                                                        banner.status === "ACTIVE"
                                                            ? "text-amber-500 hover:bg-amber-500/10"
                                                            : "text-emerald-500 hover:bg-emerald-500/10"
                                                    }`}
                                                    title={banner.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                                >
                                                    <CheckCircle className="size-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(banner.id)}
                                                    className="size-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Form Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
                    <DialogHeader>
                        <DialogTitle>{selectedBanner ? "Edit Banner" : "Tambah Banner"}</DialogTitle>
                        <DialogDescription>
                            Isi detail formulir di bawah ini untuk menyimpan perubahan banner.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-xs font-semibold">Judul Banner *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Masukkan judul banner"
                                    required
                                />
                            </div>

                            {/* Subtitle */}
                            <div className="space-y-2">
                                <Label htmlFor="subtitle" className="text-xs font-semibold">Subjudul / Deskripsi Singkat</Label>
                                <Input
                                    id="subtitle"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    placeholder="Masukkan deskripsi singkat (opsional)"
                                />
                            </div>

                            {/* CTA Text */}
                            <div className="space-y-2">
                                <Label htmlFor="ctaText" className="text-xs font-semibold">Teks Tombol CTA</Label>
                                <Input
                                    id="ctaText"
                                    value={ctaText}
                                    onChange={(e) => setCtaText(e.target.value)}
                                    placeholder="Contoh: Beli Sekarang (opsional)"
                                />
                            </div>

                            {/* Link URL */}
                            <div className="space-y-2">
                                <Label htmlFor="linkUrl" className="text-xs font-semibold">Link Tujuan URL / Path</Label>
                                <Input
                                    id="linkUrl"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="Contoh: /topup/mlbb (opsional)"
                                />
                            </div>

                            {/* Position */}
                            <div className="space-y-2">
                                <Label htmlFor="position" className="text-xs font-semibold">Posisi Banner *</Label>
                                <Select value={position} onValueChange={(v) => setPosition(v as BannerPosition)}>
                                    <SelectTrigger id="position">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(POSITION_LABELS).map(([val, label]) => (
                                            <SelectItem key={val} value={val}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-xs font-semibold">Status *</Label>
                                <Select value={status} onValueChange={(v) => setStatus(v as BannerStatus)}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Starts At */}
                            <div className="space-y-2">
                                <Label htmlFor="startsAt" className="text-xs font-semibold">Mulai Ditampilkan (Jadwal)</Label>
                                <Input
                                    id="startsAt"
                                    type="datetime-local"
                                    value={startsAt}
                                    onChange={(e) => setStartsAt(e.target.value)}
                                />
                            </div>

                            {/* Ends At */}
                            <div className="space-y-2">
                                <Label htmlFor="endsAt" className="text-xs font-semibold">Selesai Ditampilkan (Jadwal)</Label>
                                <Input
                                    id="endsAt"
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                />
                            </div>

                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label htmlFor="altText" className="text-xs font-semibold">Alt Text Gambar *</Label>
                                <Input
                                    id="altText"
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                    placeholder="Deskripsi text untuk aksesibilitas/SEO"
                                    required
                                />
                            </div>

                            {/* Object Position / Focal Point */}
                            <div className="space-y-2">
                                <Label htmlFor="objectPosition" className="text-xs font-semibold">Focal Point Posisi Gambar</Label>
                                <Select value={objectPosition} onValueChange={setObjectPosition}>
                                    <SelectTrigger id="objectPosition">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="center center">Center Center (Tengah)</SelectItem>
                                        <SelectItem value="top center">Top Center (Atas)</SelectItem>
                                        <SelectItem value="bottom center">Bottom Center (Bawah)</SelectItem>
                                        <SelectItem value="center left">Center Left (Kiri Tengah)</SelectItem>
                                        <SelectItem value="center right">Center Right (Kanan Tengah)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Order */}
                            <div className="space-y-2">
                                <Label htmlFor="order" className="text-xs font-semibold">Urutan Banner *</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min={0}
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Image Uploaders */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Desktop Image */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Gambar Desktop * (Wajib)</Label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 min-h-[140px] relative">
                                    {imageDesktop ? (
                                        <div className="w-full text-center space-y-2">
                                            <div className="relative h-20 w-full rounded-md overflow-hidden border">
                                                <Image src={resolveImageUrl(imageDesktop)} alt="Desktop Image" fill className="object-contain" />
                                            </div>
                                            <p className="text-[10px] text-emerald-500 font-medium truncate">{imageDesktop}</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setImageDesktop("")}
                                                className="text-rose-500 h-6 px-2 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                            >
                                                Ganti Gambar
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer text-center flex flex-col items-center gap-2">
                                            <UploadCloud className="size-8 text-slate-400 animate-pulse" />
                                            <span className="text-xs text-slate-500">
                                                {isUploadingDesktop ? "Mengunggah..." : "Unggah Gambar Desktop"}
                                            </span>
                                            <span className="text-[10px] text-slate-400">JPG, PNG, WEBP, GIF. Max 5MB.</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isUploadingDesktop}
                                                onChange={(e) => handleUploadImage(e, "desktop")}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Image */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Gambar Mobile (Opsional)</Label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 min-h-[140px] relative">
                                    {imageMobile ? (
                                        <div className="w-full text-center space-y-2">
                                            <div className="relative h-20 w-full rounded-md overflow-hidden border">
                                                <Image src={resolveImageUrl(imageMobile)} alt="Mobile Image" fill className="object-contain" />
                                            </div>
                                            <p className="text-[10px] text-emerald-500 font-medium truncate">{imageMobile}</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setImageMobile("")}
                                                className="text-rose-500 h-6 px-2 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                            >
                                                Ganti Gambar
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer text-center flex flex-col items-center gap-2">
                                            <UploadCloud className="size-8 text-slate-400" />
                                            <span className="text-xs text-slate-500">
                                                {isUploadingMobile ? "Mengunggah..." : "Unggah Gambar Mobile"}
                                            </span>
                                            <span className="text-[10px] text-slate-400">Opsional (fallback ke desktop)</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isUploadingMobile}
                                                onChange={(e) => handleUploadImage(e, "mobile")}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={isSubmitting}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                {isSubmitting ? "Menyimpan..." : "Simpan Banner"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Preview Banner Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl p-6 rounded-xl">
                    <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="size-5 text-blue-500" />
                            <span>Preview Banner: {previewBanner?.title}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tampilan banner pada perangkat Desktop, Tablet, dan Mobile.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Viewport Selectors */}
                    <div className="flex justify-center gap-2 my-4">
                        <Button
                            variant={previewViewport === "desktop" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewViewport("desktop")}
                            className="gap-2"
                        >
                            <Monitor className="size-4" /> Desktop
                        </Button>
                        <Button
                            variant={previewViewport === "tablet" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewViewport("tablet")}
                            className="gap-2"
                        >
                            <Tablet className="size-4" /> Tablet
                        </Button>
                        <Button
                            variant={previewViewport === "mobile" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewViewport("mobile")}
                            className="gap-2"
                        >
                            <Phone className="size-4" /> Mobile
                        </Button>
                    </div>

                    {/* Preview Box Frame */}
                    <div className="bg-slate-100 dark:bg-slate-900 border rounded-xl p-6 flex justify-center items-center overflow-x-auto min-h-[350px]">
                        {previewBanner && (
                            <div
                                className="relative overflow-hidden border shadow-lg bg-slate-950 transition-all duration-300 rounded-lg"
                                style={{
                                    width:
                                        previewViewport === "desktop"
                                            ? "100%"
                                            : previewViewport === "tablet"
                                            ? "768px"
                                            : "375px",
                                    height:
                                        previewViewport === "desktop"
                                            ? "320px"
                                            : previewViewport === "tablet"
                                            ? "280px"
                                            : "240px",
                                }}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={resolveImageUrl(
                                            previewViewport === "mobile" && previewBanner.imageMobile
                                                ? previewBanner.imageMobile
                                                : previewBanner.imageDesktop
                                        )}
                                        alt={previewBanner.altText}
                                        className="w-full h-full object-cover"
                                        style={{
                                            objectPosition: previewBanner.objectPosition || "center center",
                                        }}
                                    />
                                    {/* Gradient overlay to make text readable */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent z-10" />
                                </div>

                                {/* Text content overlays */}
                                <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-12 text-white max-w-[70%]">
                                    {/* Mini Badge */}
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-600/30 border border-blue-500/50 rounded-full mb-3 backdrop-blur-sm self-start">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping"></span>
                                        <span className="text-[10px] font-bold tracking-wider uppercase">Preview</span>
                                    </div>

                                    <h2 className="text-2xl md:text-4xl font-extrabold mb-2 text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text leading-tight truncate">
                                        {previewBanner.title}
                                    </h2>
                                    {previewBanner.subtitle && (
                                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4 line-clamp-2">
                                            {previewBanner.subtitle}
                                        </p>
                                    )}

                                    {/* Action button */}
                                    {previewBanner.ctaText && (
                                        <Button
                                            size="sm"
                                            className="self-start bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-xs"
                                        >
                                            {previewBanner.ctaText}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
                            Tutup Preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
