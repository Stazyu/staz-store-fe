"use client";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import authClient from '@/lib/auth-client';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Lock,
  Shield,
  MessageSquare,
  Wallet
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';


const formatDate = (dateString: Date | string) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProfilePage() {
  const { data: user, isLoading: loading } = useProfile();

  const session = authClient.useSession();

  if (session.data === null && !session.isPending) {
    redirect('/');
  }

  // Manual fetch removed


  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'USER';
  };

  if (loading || !user) {
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
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi akun, preferensi, dan keamanan Anda.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar / Identity Card */}
        <aside className="w-full lg:w-80 space-y-6">
          <Card>
            <CardHeader className="flex flex-col items-center text-center pb-2">
              <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary/10">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="flex items-center gap-2 mt-1">
                {user?.sellOffline && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    Offline Seller
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-muted-foreground">Saldo Dompet</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(user?.balance || 0)}</p>
              </div>

              <div className="space-y-2 pt-2">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                  <Link href="/profile/topup">
                    <Wallet className="mr-2 h-4 w-4" /> Top Up Saldo
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/profile/edit">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profil
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/profile/change-password">
                    <Lock className="mr-2 h-4 w-4" /> Ganti Password
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan Sistem</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID Akun</span>
                <span className="font-mono text-xs">{user?.id?.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bergabung</span>
                <span>{user?.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id }) : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Update Terakhir</span>
                <span>{user?.updatedAt ? format(new Date(user.updatedAt), 'dd MMM yyyy', { locale: id }) : '-'}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Detail Profil</CardTitle>
                <CardDescription>
                  Informasi lengkap mengenai identitas dan kontak Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informasi Pribadi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">Nama Lengkap</span>
                      </div>
                      <p className="font-medium">{user?.name}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="font-medium">{user?.email}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Role Akun</span>
                      </div>
                      <p className="font-medium capitalize">{user?.role}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Tanggal Bergabung</span>
                      </div>
                      <p className="font-medium">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Kontak & Media Sosial</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm font-medium">Nomor Telepon</span>
                      </div>
                      <p className="font-medium">{user?.phoneNumber || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm font-medium">WhatsApp</span>
                      </div>
                      <p className="font-medium">{user?.whatsappId || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm font-medium">Telegram</span>
                      </div>
                      <p className="font-medium">{user?.telegramId || '-'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
