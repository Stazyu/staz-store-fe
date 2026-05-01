"use client";


import { useEffect, useState } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import authClient from '@/lib/auth-client';
import {
    User,
    Mail,
    Phone,
    MessageSquare,
    Save,
    ArrowLeft,
    Shield,
    Calendar,
    Pen
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileEditPage() {
    const router = useRouter();
    const session = authClient.useSession();

    // Use React Query hooks
    const { data: profileData, isLoading: isProfileLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        phoneNumber: '',
        whatsappId: '',
        telegramId: '',
        sellOffline: false,
    });

    // Sync form data with profile data when it loads
    useEffect(() => {
        if (profileData) {
            setFormData({
                id: profileData.id,
                name: profileData.name || '',
                phoneNumber: profileData.phoneNumber || '',
                whatsappId: profileData.whatsappId || '',
                telegramId: profileData.telegramId || '',
                sellOffline: profileData.sellOffline || false,
            });
        }
    }, [profileData]);

    useEffect(() => {
        if (session.isPending === false && !session.data) {
            router.push('/');
        }
    }, [session, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        updateProfileMutation.mutate(formData, {
            onSuccess: () => {
                router.refresh();
                router.push('/profile');
            }
        });
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'USER';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isProfileLoading || session.isPending) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <Card className="w-full md:w-1/3">
                        <CardHeader className="flex flex-col items-center">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-6 w-32 mt-4" />
                            <Skeleton className="h-4 w-48 mt-2" />
                        </CardHeader>
                    </Card>
                    <Card className="w-full md:w-2/3">
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Use profileData for sidebar display
    const userData = profileData;

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Profil</h1>
                <p className="text-muted-foreground">
                    Perbarui informasi pribadi dan kontak Anda.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar / Identity Card - Keep consistent with ProfilePage */}
                <aside className="w-full lg:w-80 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col items-center text-center pb-2">
                            <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary/10">
                                <AvatarImage src={userData?.image} alt={userData?.name} />
                                <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                                    {getInitials(userData?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl">{userData?.name}</CardTitle>
                            <CardDescription>{userData?.email}</CardDescription>
                            <div className="flex items-center gap-2 mt-1">
                                {userData?.sellOffline && (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                                        Offline Seller
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-sm font-medium text-muted-foreground">Saldo Dompet</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(userData?.balance || 0)}</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Button asChild className="w-full" variant="outline">
                                    <Link href="/profile">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Profil
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content - Edit Form */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Profil</CardTitle>
                                <CardDescription>
                                    Ubah detail identitas dan informasi kontak Anda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Nama Lengkap
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="pl-9"
                                                placeholder="Nama Lengkap Anda"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="phoneNumber" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Nomor Telepon
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="pl-9"
                                                placeholder="08123456789"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="whatsappId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Nomor WhatsApp
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="whatsappId"
                                                name="whatsappId"
                                                value={formData.whatsappId}
                                                onChange={handleChange}
                                                className="pl-9"
                                                placeholder="08123456789"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="telegramId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            ID Telegram
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="telegramId"
                                                name="telegramId"
                                                value={formData.telegramId}
                                                onChange={handleChange}
                                                className="pl-9"
                                                placeholder="Username Telegram"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <div className="flex items-center space-x-2 rounded-md border p-4">
                                            <input
                                                type="checkbox"
                                                id="sellOffline"
                                                name="sellOffline"
                                                checked={formData.sellOffline}
                                                onChange={handleChange}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <div className="flex-1 space-y-1">
                                                <label
                                                    htmlFor="sellOffline"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Jual Offline
                                                </label>
                                                <p className="text-sm text-muted-foreground">
                                                    Aktifkan jika Anda ingin menjual produk secara offline / konter.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t px-6 py-4">
                                <Button variant="ghost" asChild>
                                    <Link href="/profile">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? (
                                        <>
                                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}

