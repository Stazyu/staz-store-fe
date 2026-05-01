'use client';

import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

import authClient from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { useQueryClient } from '@tanstack/react-query';

export default function ChangePasswordPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: true,
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const session = authClient.useSession();

    if (session.data === null && !session.isPending) {
        redirect('/auth/login');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.currentPassword.length < 8) {
            toast.error('Password saat ini minimal 8 karakter');
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Password baru dan konfirmasi password tidak cocok');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error('Password baru minimal 8 karakter');
            setLoading(false);
            return;
        }

        try {
            const res = await authClient.changePassword({
                newPassword: formData.newPassword,
                currentPassword: formData.currentPassword,
                revokeOtherSessions: formData.revokeOtherSessions,
            });

            if (res.error) {
                toast.error(res.error.message || 'Gagal mengubah password');
            } else {
                toast.success('Password berhasil diubah');
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    revokeOtherSessions: true,
                });
                await authClient.signOut();
                await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
                router.push('/auth/login');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan yang tidak diketahui');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="icon" asChild className="-ml-2 h-8 w-8">
                        <Link href="/profile">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Ganti Password</h1>
                </div>
                <p className="text-muted-foreground ml-8">
                    Amankan akun Anda dengan memperbarui password secara berkala.
                </p>
            </div>

            <div className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Ubah Password</CardTitle>
                        <CardDescription>
                            Masukkan password lama Anda untuk verifikasi, lalu buat password baru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="currentPassword"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Password Saat Ini
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password lama"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <label
                                    htmlFor="newPassword"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Minimal 8 karakter"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Konfirmasi Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Ulangi password baru"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="revokeOtherSessions"
                                    name="revokeOtherSessions"
                                    checked={formData.revokeOtherSessions}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                    htmlFor="revokeOtherSessions"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Log out dari semua perangkat lain
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button variant="outline" type="button" asChild>
                                    <Link href="/profile">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Simpan Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
