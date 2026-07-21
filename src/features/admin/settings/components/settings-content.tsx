"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import {
  User as UserIcon,
  Lock,
  Settings,
  Sparkles,
  Bell,
  Link2,
  Database,
  ShieldAlert,
  Check,
  AlertTriangle,
  RefreshCw,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  UploadCloud,
  Globe,
  Sliders,
  Radio,
  FileCheck,
  Activity
} from "lucide-react";

import {
  useAdminProfileSettings,
  useUpdateAdminProfile,
  useUpdateAdminPassword,
  useAdminPreferences,
  useUpdateAdminPreferences,
  useBrandingSettings,
  useUpdateBrandingSettings,
  useSystemSettings,
  useUpdateSystemSettings,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useIntegrationSettings,
  useUpdateIntegrationSettings,
  useRegenerateWebhookSecret,
  useAdminSessions,
  useRevokeSession,
  useLogoutAllSessions,
  useTestNotification
} from "@/hooks/useAdminSettings";

export default function SettingsPageContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Confirm password modal state
  const [confirmPasswordModal, setConfirmPasswordModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    passwordValue: string;
    onConfirm: (password: string) => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    passwordValue: "",
    onConfirm: () => {}
  });

  // Regenerated webhook secret display modal
  const [newSecretModal, setNewSecretModal] = useState<{
    isOpen: boolean;
    secret: string;
  }>({
    isOpen: false,
    secret: ""
  });

  // ─── TanStack Query Hooks ──────────────────────────────────────────────────
  const { data: profile, isLoading: loadingProfile } = useAdminProfileSettings();
  const updateProfile = useUpdateAdminProfile();

  const updatePassword = useUpdateAdminPassword();

  const { data: preferences, isLoading: loadingPref } = useAdminPreferences();
  const updatePreferences = useUpdateAdminPreferences();

  const { data: branding, isLoading: loadingBranding } = useBrandingSettings();
  const updateBranding = useUpdateBrandingSettings();

  const { data: system, isLoading: loadingSystem } = useSystemSettings();
  const updateSystem = useUpdateSystemSettings();

  const { data: notifications, isLoading: loadingNotifications } = useNotificationSettings();
  const updateNotifications = useUpdateNotificationSettings();
  const testNotifications = useTestNotification();

  const { data: integrations, isLoading: loadingIntegrations } = useIntegrationSettings();
  const updateIntegrations = useUpdateIntegrationSettings();
  const regenerateSecret = useRegenerateWebhookSecret();

  const { data: sessions, isLoading: loadingSessions } = useAdminSessions();
  const revokeSession = useRevokeSession();
  const logoutAll = useLogoutAllSessions();

  // ─── Local State for Form Modifications ───────────────────────────────────
  const [profileForm, setProfileForm] = useState({ name: "", email: "", image: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [prefForm, setPrefForm] = useState({
    theme: "dark",
    accentColor: "blue",
    sidebarMode: "expanded",
    tableDensity: "comfortable",
    language: "id",
    timezone: "Asia/Jakarta",
    dateFormat: "YYYY-MM-DD",
    currencyFormat: "IDR"
  });
  const [brandingForm, setBrandingForm] = useState({
    storeName: "",
    logo: "",
    favicon: "",
    tagline: "",
    description: "",
    whatsapp: "",
    telegram: "",
    emailSupport: "",
    socialInstagram: "",
    socialTiktok: "",
    socialFacebook: "",
    socialDiscord: ""
  });
  const [systemForm, setSystemForm] = useState({
    maintenanceMode: false,
    maintenanceMessage: "",
    allowUserRegistration: true,
    minDeposit: 10000,
    maxDeposit: 10000000,
    minOrder: 1000,
    orderExpiredMinutes: 10,
    depositExpiredMinutes: 60,
    invoicePrefix: "STZ",
    defaultCurrency: "IDR",
    systemTimezone: "Asia/Jakarta",
    failedOrderLimit: 5,
    providerRetryLimit: 3,
    providerTimeoutSeconds: 30,
    lowBalanceThreshold: 100000
  });
  const [notifForm, setNotifForm] = useState({
    adminNotificationEmail: "",
    notifyDepositIncoming: true,
    notifyOrderSuccess: true,
    notifyOrderFailed: true,
    notifyProviderError: true,
    notifyLowBalance: true,
    notifyBalanceAdjustment: true,
    notifyNewDeviceLogin: true,
    telegramWebhookChatId: "",
    discordWebhookUrl: ""
  });
  const [integrationForm, setIntegrationForm] = useState({
    webhookSecret: "",
    integrationMode: "sandbox",
    verifyCallbackSignature: true,
    retryCallbackFailed: true,
    callbackTimeoutSeconds: 15
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  // ─── Sync Local State with Query Data ──────────────────────────────────────
  useEffect(() => {
    if (profile) setProfileForm({ name: profile.name || "", email: profile.email || "", image: profile.image || "" });
  }, [profile]);

  useEffect(() => {
    if (preferences) setPrefForm({ ...preferences });
  }, [preferences]);

  useEffect(() => {
    if (branding) setBrandingForm({ ...branding });
  }, [branding]);

  useEffect(() => {
    if (system) setSystemForm({ ...system });
  }, [system]);

  useEffect(() => {
    if (notifications) setNotifForm({ ...notifications });
  }, [notifications]);

  useEffect(() => {
    if (integrations) setIntegrationForm({ ...integrations });
  }, [integrations]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // ─── Unsaved Changes Detection ──────────────────────────────────────────────
  const isProfileChanged = JSON.stringify(profileForm) !== JSON.stringify(profile ? { name: profile.name || "", email: profile.email || "", image: profile.image || "" } : {});
  const isPrefChanged = JSON.stringify(prefForm) !== JSON.stringify(preferences || {});
  const isBrandingChanged = JSON.stringify(brandingForm) !== JSON.stringify(branding || {});
  const isSystemChanged = JSON.stringify(systemForm) !== JSON.stringify(system || {});
  const isNotifChanged = JSON.stringify(notifForm) !== JSON.stringify(notifications || {});
  const isIntegrationChanged = JSON.stringify(integrationForm) !== JSON.stringify(integrations || {});

  const hasUnsavedChanges = isProfileChanged || isPrefChanged || isBrandingChanged || isSystemChanged || isNotifChanged || isIntegrationChanged;

  // ─── Validation Helpers ────────────────────────────────────────────────────
  const getPasswordStrength = (pw: string): { strength: number; label: string; color: string; checks: { label: string; done: boolean }[] } => {
    const checks = [
      { label: "Minimal 8 karakter", done: pw.length >= 8 },
      { label: "Huruf besar & huruf kecil", done: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
      { label: "Angka (0-9)", done: /[0-9]/.test(pw) },
      { label: "Simbol khusus (!@#$%^&*)", done: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) }
    ];
    const strength = checks.filter(c => c.done).length;

    let label = "Lemah";
    let color = "bg-rose-500 shadow-rose-500/50";
    if (strength === 2) {
      label = "Sedang";
      color = "bg-amber-500 shadow-amber-500/50";
    } else if (strength === 3) {
      label = "Kuat";
      color = "bg-blue-500 shadow-blue-500/50";
    } else if (strength === 4) {
      label = "Sangat Kuat";
      color = "bg-emerald-500 shadow-emerald-500/50";
    }

    return { strength, label, color, checks };
  };

  const pwStrength = getPasswordStrength(passwordForm.newPassword);

  // ─── Handle Forms ──────────────────────────────────────────────────────────

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name) {
      toast.error("Nama wajib diisi");
      return;
    }

    if (profileForm.email !== profile?.email) {
      setConfirmPasswordModal({
        isOpen: true,
        title: "Konfirmasi Perubahan Email",
        description: "Anda mengubah email admin. Silakan masukkan password Anda untuk mengonfirmasi perubahan ini.",
        passwordValue: "",
        onConfirm: (pwd) => {
          updateProfile.mutate(
            { ...profileForm, confirmPassword: pwd },
            {
              onSuccess: () => setConfirmPasswordModal(prev => ({ ...prev, isOpen: false }))
            }
          );
        }
      });
    } else {
      updateProfile.mutate(profileForm);
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }
    if (pwStrength.strength < 3) {
      toast.error("Password baru kurang kuat");
      return;
    }

    updatePassword.mutate(passwordForm, {
      onSuccess: () => {
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    });
  };

  const handlePrefSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences.mutate(prefForm, {
      onSuccess: () => {
        if (prefForm.theme) setTheme(prefForm.theme);
      }
    });
  };

  const handleBrandingSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding.mutate(brandingForm);
  };

  const handleSystemSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (systemForm.maintenanceMode !== system?.maintenanceMode) {
      setConfirmPasswordModal({
        isOpen: true,
        title: systemForm.maintenanceMode ? "Aktifkan Mode Maintenance?" : "Nonaktifkan Mode Maintenance?",
        description: `Konfirmasi password diperlukan untuk ${systemForm.maintenanceMode ? "mengaktifkan" : "menonaktifkan"} mode pemeliharaan global.`,
        passwordValue: "",
        onConfirm: (pwd) => {
          updateSystem.mutate(
            { ...systemForm, confirmPassword: pwd },
            {
              onSuccess: () => setConfirmPasswordModal(prev => ({ ...prev, isOpen: false }))
            }
          );
        }
      });
    } else {
      updateSystem.mutate(systemForm);
    }
  };

  const handleNotificationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotifications.mutate(notifForm);
  };

  const handleIntegrationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegrations.mutate(integrationForm);
  };

  const handleRegenerateSecret = () => {
    setConfirmPasswordModal({
      isOpen: true,
      title: "Regenerasi Webhook Secret?",
      description: "Tindakan ini akan membatalkan secret saat ini secara instan. Webhook callback dari client dengan secret lama akan ditolak. Masukkan password untuk regenerasi.",
      passwordValue: "",
      onConfirm: (pwd) => {
        regenerateSecret.mutate(
          { confirmPassword: pwd },
          {
            onSuccess: (res) => {
              setConfirmPasswordModal(prev => ({ ...prev, isOpen: false }));
              setNewSecretModal({ isOpen: true, secret: res.data.webhookSecret });
            }
          }
        );
      }
    });
  };

  const handleLogoutAllOther = () => {
    setConfirmPasswordModal({
      isOpen: true,
      title: "Logout Semua Perangkat Lain?",
      description: "Anda akan keluar dari semua sesi login di perangkat lain. Sesi saat ini akan tetap dipertahankan. Masukkan password konfirmasi.",
      passwordValue: "",
      onConfirm: (pwd) => {
        logoutAll.mutate(
          { confirmPassword: pwd },
          {
            onSuccess: () => setConfirmPasswordModal(prev => ({ ...prev, isOpen: false }))
          }
        );
      }
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard`);
  };

  // ─── Skeleton ──────────────────────────────────────────────────────────────
  const renderSkeleton = () => (
    <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl rounded-2xl p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-[200px] bg-slate-800/60" />
        <Skeleton className="h-4 w-[300px] bg-slate-800/40" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full bg-slate-800/40" />
        <Skeleton className="h-12 w-full bg-slate-800/40" />
        <Skeleton className="h-12 w-full bg-slate-800/40" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 w-full px-4 md:px-6 relative">
      {/* Decorative blurred background shapes */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-800/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent">
              Pengaturan Panel
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Kustomisasi profil admin, password keamanan, preferensi visual, dan sistem global Staz Store
          </p>
        </div>
        {hasUnsavedChanges && (
          <Badge className="w-fit animate-pulse py-1.5 px-3.5 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full font-semibold text-xs shadow-lg shadow-rose-500/10">
            <AlertTriangle className="h-3.5 w-3.5" />
            Perubahan belum disimpan
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* Modern Sidebar Tabs Navigation */}
        <TabsList className="flex flex-row lg:flex-col lg:w-[280px] w-full h-auto lg:h-fit overflow-x-auto lg:overflow-visible bg-slate-900/20 backdrop-blur-md p-2 rounded-2xl border border-slate-800/60 justify-start gap-1.5 flex-nowrap lg:flex-wrap scrollbar-none shadow-xl">
          {[
            { value: "profile", icon: UserIcon, label: "Profil Admin" },
            { value: "security", icon: Lock, label: "Password & Sesi" },
            { value: "preferences", icon: Settings, label: "Preferensi Tampilan" },
            { value: "branding", icon: Sparkles, label: "Branding Toko" },
            { value: "system", icon: Globe, label: "Pengaturan Sistem" },
            { value: "notifications", icon: Bell, label: "Notifikasi Admin" },
            { value: "integrations", icon: Link2, label: "Integrasi & Webhook" },
            { value: "backup", icon: Database, label: "Backup & Maintenance" }
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-3 w-auto lg:w-full justify-start py-3 px-4 text-xs lg:text-sm font-semibold rounded-xl transition-all duration-300 ease-out shrink-0
              data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 data-[state=active]:translate-x-1
              hover:bg-slate-800/40 hover:text-slate-200"
            >
              <tab.icon className="h-4.5 w-4.5 shrink-0" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content Tabs Area */}
        <div className="flex-1 w-full min-h-[500px]">
          {/* 1. Profil Admin */}
          <TabsContent value="profile" className="mt-0">
            {loadingProfile ? renderSkeleton() : (
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-500" /> Profil Admin
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Perbarui data diri profil admin dan foto avatar Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800/50">
                      <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-slate-800 shadow-inner relative group cursor-pointer">
                        {profileForm.image ? (
                          <img src={profileForm.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="h-10 w-10 text-slate-500" />
                        )}
                        <label className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-white text-[10px] font-semibold gap-1">
                          <UploadCloud className="h-5 w-5 text-blue-400" /> Upload Foto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProfileForm(p => ({ ...p, image: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <h4 className="font-bold text-lg text-slate-200">{profile?.name || "Admin"}</h4>
                        <p className="text-sm text-slate-400">{profile?.email || "email@mail.com"}</p>
                        <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                          <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800 border-none capitalize px-2.5 py-0.5 text-xs font-semibold">{profile?.role || "Admin"}</Badge>
                          <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">{profile?.status || "Aktif"}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-xs font-semibold text-slate-300">Nama Lengkap</label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Masukkan nama lengkap"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 py-5"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address</label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="admin@stazstore.com"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 py-5"
                        />
                        <p className="text-[10px] text-slate-500 italic">
                          Mengubah email akan meminta password konfirmasi admin saat melakukan penyimpanan.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-slate-900/20 border border-slate-800/40 rounded-xl space-y-1">
                          <span className="text-[10px] text-slate-500 block font-semibold">Terakhir Login</span>
                          <span className="text-xs font-bold text-slate-300">
                            {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString("id-ID") : "-"}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-900/20 border border-slate-800/40 rounded-xl space-y-1">
                          <span className="text-[10px] text-slate-500 block font-semibold">Tanggal Registrasi</span>
                          <span className="text-xs font-bold text-slate-300">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID") : "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!isProfileChanged}
                        onClick={() => setProfileForm({ name: profile.name || "", email: profile.email || "", image: profile.image || "" })}
                        className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-xl"
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isProfileChanged || updateProfile.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        {updateProfile.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Profil
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 2. Password & Keamanan */}
          <TabsContent value="security" className="mt-0">
            <div className="space-y-8">
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-500" /> Ganti Password
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Perbarui kredensial password keamanan login Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSave} className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-300">Password Lama</label>
                      <div className="relative">
                        <Input
                          type={showPassword.old ? "text" : "password"}
                          value={passwordForm.oldPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                          placeholder="Masukkan password lama"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 py-5 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => ({ ...p, old: !p.old }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-300">Password Baru</label>
                      <div className="relative">
                        <Input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                          placeholder="Masukkan password baru"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 py-5 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password strength checklist */}
                      {passwordForm.newPassword && (
                        <div className="space-y-3 pt-3 border-t border-slate-950 mt-1">
                          <div className="flex items-center gap-2 justify-between">
                            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden flex gap-0.5">
                              {[1, 2, 3, 4].map(idx => (
                                <div
                                  key={idx}
                                  className={`h-full flex-1 rounded-full transition-all duration-300 shadow-sm ${idx <= pwStrength.strength ? pwStrength.color : "bg-slate-800"}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-300">{pwStrength.label}</span>
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                            {pwStrength.checks.map((chk, i) => (
                              <li key={i} className="flex items-center gap-2 text-slate-400 font-medium">
                                <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 border transition-all ${chk.done ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-800 bg-slate-900/20 text-slate-600"}`}>
                                  {chk.done && <Check className="h-3 w-3" />}
                                </span>
                                {chk.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-300">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <Input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                          placeholder="Konfirmasi password baru"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 py-5 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">Konfirmasi password baru tidak cocok.</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-3">
                      <Button
                        type="submit"
                        disabled={!passwordForm.oldPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword || updatePassword.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        {updatePassword.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        Ganti Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Sesi Login & 2FA */}
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" /> Sesi & Perangkat Aktif
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Pantau perangkat yang terhubung dengan akun ini</CardDescription>
                  </div>
                  <Badge className="bg-slate-900 border border-slate-800 text-slate-400 rounded-full px-2.5 py-0.5 text-[10px]">
                    2FA Segera Hadir
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mock 2FA Switch */}
                  <div className="flex items-center justify-between p-4 border border-slate-800/50 bg-slate-900/10 backdrop-blur-sm rounded-2xl">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-slate-300">Google Authenticator (2FA / TOTP)</h4>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-[360px]">Amankan akun Anda secara maksimal dengan token dinamis Google Authenticator.</p>
                    </div>
                    <Switch disabled checked={false} className="data-[state=checked]:bg-blue-600" />
                  </div>

                  {/* Sesi List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-400">Daftar Sesi Login ({sessions?.length || 0})</h4>
                      {sessions && sessions.length > 1 && (
                        <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl" onClick={handleLogoutAllOther}>
                          <LogOut className="h-3.5 w-3.5 mr-1" /> Logout Perangkat Lain
                        </Button>
                      )}
                    </div>

                    {loadingSessions ? <Skeleton className="h-24 w-full" /> : (
                      <div className="space-y-2">
                        {sessions?.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-3.5 border border-slate-900/60 bg-slate-950/20 backdrop-blur-md rounded-xl text-xs hover:border-slate-800 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{s.ipAddress}</span>
                                {s.id === profile?.id ? <Badge className="bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[9px] py-0 px-1.5 rounded-full font-bold">Perangkat Ini</Badge> : null}
                              </div>
                              <p className="text-slate-400 text-[10px] max-w-[420px] truncate leading-normal">{s.userAgent}</p>
                              <span className="text-[9px] text-slate-500 block">Aktif: {new Date(s.createdAt).toLocaleString("id-ID")}</span>
                            </div>
                            {s.id !== profile?.id ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                                onClick={() => revokeSession.mutate(s.id)}
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </Button>
                            ) : null}
                          </div>
                        ))}
                        {(!sessions || sessions.length === 0) && (
                          <p className="text-center py-4 text-xs text-slate-500">Tidak ada sesi login lain.</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 3. Preferensi Tampilan */}
          <TabsContent value="preferences" className="mt-0">
            {loadingPref ? renderSkeleton() : (
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-blue-500" /> Preferensi Tampilan
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Personalisasikan preferensi navigasi dan visual panel admin Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePrefSave} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-slate-300">Tema Panel</label>
                        <div className="grid grid-cols-3 gap-3">
                          {["light", "dark", "system"].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setPrefForm(p => ({ ...p, theme: t }))}
                              className={`py-3 px-4 rounded-xl border-2 flex flex-col items-center justify-center capitalize font-semibold transition-all duration-300 ${prefForm.theme === t ? "border-blue-500 bg-blue-500/10 text-slate-200" : "border-slate-800 bg-slate-900/10 text-slate-400 hover:border-slate-700"}`}
                            >
                              <span className="text-xs">{t}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="accent" className="text-xs font-semibold text-slate-300">Warna Aksen</label>
                          <Select value={prefForm.accentColor} onValueChange={val => setPrefForm(p => ({ ...p, accentColor: val }))}>
                            <SelectTrigger id="accent" className="bg-slate-900/40 border-slate-800 rounded-xl py-5">
                              <SelectValue placeholder="Pilih Aksen" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 rounded-xl">
                              {["blue", "green", "red", "violet", "orange"].map(color => (
                                <SelectItem key={color} value={color} className="capitalize text-slate-300">{color}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="sidebar" className="text-xs font-semibold text-slate-300">Sidebar Default</label>
                          <Select value={prefForm.sidebarMode} onValueChange={val => setPrefForm(p => ({ ...p, sidebarMode: val }))}>
                            <SelectTrigger id="sidebar" className="bg-slate-900/40 border-slate-800 rounded-xl py-5">
                              <SelectValue placeholder="Pilih mode sidebar" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 rounded-xl">
                              <SelectItem value="expanded" className="text-slate-300">Expanded (Terbuka)</SelectItem>
                              <SelectItem value="collapsed" className="text-slate-300">Collapsed (Tertutup)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="density" className="text-xs font-semibold text-slate-300">Kepadatan Baris Tabel</label>
                          <Select value={prefForm.tableDensity} onValueChange={val => setPrefForm(p => ({ ...p, tableDensity: val }))}>
                            <SelectTrigger id="density" className="bg-slate-900/40 border-slate-800 rounded-xl py-5">
                              <SelectValue placeholder="Pilih tingkat kepadatan" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 rounded-xl">
                              <SelectItem value="compact" className="text-slate-300">Compact (Padat)</SelectItem>
                              <SelectItem value="comfortable" className="text-slate-300">Comfortable (Nyaman)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="language" className="text-xs font-semibold text-slate-300">Bahasa Utama</label>
                          <Select value={prefForm.language} onValueChange={val => setPrefForm(p => ({ ...p, language: val }))}>
                            <SelectTrigger id="language" className="bg-slate-900/40 border-slate-800 rounded-xl py-5">
                              <SelectValue placeholder="Pilih Bahasa" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 rounded-xl">
                              <SelectItem value="id" className="text-slate-300">Bahasa Indonesia</SelectItem>
                              <SelectItem value="en" className="text-slate-300">English (US)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                          <label htmlFor="timezone" className="text-xs font-semibold text-slate-300">Timezone Akun</label>
                          <Select value={prefForm.timezone} onValueChange={val => setPrefForm(p => ({ ...p, timezone: val }))}>
                            <SelectTrigger id="timezone" className="bg-slate-900/40 border-slate-800 rounded-xl py-5">
                              <SelectValue placeholder="Pilih Timezone" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 rounded-xl">
                              <SelectItem value="Asia/Jakarta" className="text-slate-300">WIB (Asia/Jakarta)</SelectItem>
                              <SelectItem value="Asia/Makassar" className="text-slate-300">WITA (Asia/Makassar)</SelectItem>
                              <SelectItem value="Asia/Jayapura" className="text-slate-300">WIT (Asia/Jayapura)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="currency" className="text-xs font-semibold text-slate-300">Mata Uang</label>
                          <Select value={prefForm.currencyFormat} onValueChange={val => setPrefForm(p => ({ ...p, currencyFormat: val }))}>
                            <SelectTrigger id="currency" className="bg-slate-900/40 border-slate-800 rounded-xl py-5">
                              <SelectValue placeholder="Pilih format" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 rounded-xl">
                              <SelectItem value="IDR" className="text-slate-300">IDR (Rp)</SelectItem>
                              <SelectItem value="USD" className="text-slate-300">USD ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!isPrefChanged}
                        onClick={() => setPrefForm({ ...preferences })}
                        className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-xl"
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isPrefChanged || updatePreferences.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Simpan Preferensi
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 4. Branding Toko */}
          <TabsContent value="branding" className="mt-0">
            {loadingBranding ? renderSkeleton() : (
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" /> Branding Toko (Global)
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Sesuaikan visual dan identitas utama landing page toko Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBrandingSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="storeName" className="text-xs font-semibold text-slate-300">Nama Toko</label>
                        <Input
                          id="storeName"
                          value={brandingForm.storeName}
                          onChange={e => setBrandingForm(p => ({ ...p, storeName: e.target.value }))}
                          placeholder="Staz Store"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="tagline" className="text-xs font-semibold text-slate-300">Tagline Toko</label>
                        <Input
                          id="tagline"
                          value={brandingForm.tagline}
                          onChange={e => setBrandingForm(p => ({ ...p, tagline: e.target.value }))}
                          placeholder="Layanan topup game tercepat"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="desc" className="text-xs font-semibold text-slate-300">Deskripsi Singkat SEO</label>
                      <textarea
                        id="desc"
                        rows={3}
                        value={brandingForm.description}
                        onChange={e => setBrandingForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Masukkan deskripsi metadata pencarian web..."
                        className="flex w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Logo Image URL</label>
                        <Input
                          value={brandingForm.logo}
                          onChange={e => setBrandingForm(p => ({ ...p, logo: e.target.value }))}
                          placeholder="/uploads/logo.png"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Favicon URL</label>
                        <Input
                          value={brandingForm.favicon}
                          onChange={e => setBrandingForm(p => ({ ...p, favicon: e.target.value }))}
                          placeholder="/uploads/favicon.ico"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                        />
                      </div>
                    </div>

                    <Separator className="border-slate-900" />

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Customer Services & CS</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">WhatsApp CS</label>
                          <Input
                            value={brandingForm.whatsapp}
                            onChange={e => setBrandingForm(p => ({ ...p, whatsapp: e.target.value }))}
                            placeholder="0812xxxx"
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Telegram CS Username</label>
                          <Input
                            value={brandingForm.telegram}
                            onChange={e => setBrandingForm(p => ({ ...p, telegram: e.target.value }))}
                            placeholder="cs_telegram"
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Email CS Support</label>
                          <Input
                            value={brandingForm.emailSupport}
                            onChange={e => setBrandingForm(p => ({ ...p, emailSupport: e.target.value }))}
                            placeholder="support@stazstore.com"
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Tautan Media Sosial</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Instagram</label>
                          <Input
                            value={brandingForm.socialInstagram}
                            onChange={e => setBrandingForm(p => ({ ...p, socialInstagram: e.target.value }))}
                            placeholder="https://instagram.com/..."
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">TikTok</label>
                          <Input
                            value={brandingForm.socialTiktok}
                            onChange={e => setBrandingForm(p => ({ ...p, socialTiktok: e.target.value }))}
                            placeholder="https://tiktok.com/@..."
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Facebook</label>
                          <Input
                            value={brandingForm.socialFacebook}
                            onChange={e => setBrandingForm(p => ({ ...p, socialFacebook: e.target.value }))}
                            placeholder="https://facebook.com/..."
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Discord Server</label>
                          <Input
                            value={brandingForm.socialDiscord}
                            onChange={e => setBrandingForm(p => ({ ...p, socialDiscord: e.target.value }))}
                            placeholder="https://discord.gg/..."
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!isBrandingChanged}
                        onClick={() => setBrandingForm({ ...branding })}
                        className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-xl"
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isBrandingChanged || updateBranding.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Simpan Branding
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 5. Pengaturan Sistem Toko */}
          <TabsContent value="system" className="mt-0">
            {loadingSystem ? renderSkeleton() : (
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" /> Pengaturan Sistem Toko
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Atur limit transaksi minimal/maksimal, expired timer order, dan status pemeliharaan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSystemSave} className="space-y-6">
                    {/* Maintenance Box */}
                    <div className={`p-4 border rounded-2xl space-y-4 transition-all duration-300 bg-slate-950/50 ${systemForm.maintenanceMode ? "border-amber-500/40 shadow-lg shadow-amber-500/5" : "border-slate-800"}`}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-200">Mode Pemeliharaan (Maintenance Mode)</h4>
                            {systemForm.maintenanceMode && <Badge className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] px-2 rounded-full font-bold">Aktif</Badge>}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">Saat aktif, customer tidak dapat mengakses katalog toko dan dipandu ke halaman pemeliharaan.</p>
                        </div>
                        <Switch
                          checked={systemForm.maintenanceMode}
                          onCheckedChange={val => setSystemForm(p => ({ ...p, maintenanceMode: val }))}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                      {systemForm.maintenanceMode && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-900/60 animate-fadeIn">
                          <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pesan Mode Maintenance</label>
                          <Input
                            value={systemForm.maintenanceMessage}
                            onChange={e => setSystemForm(p => ({ ...p, maintenanceMessage: e.target.value }))}
                            placeholder="Website sedang dalam pemeliharaan..."
                            className="bg-slate-900/40 border-slate-800 focus:border-amber-500 focus:ring-amber-500/10 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border border-slate-800 rounded-2xl bg-slate-900/15">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-300">Pendaftaran Customer Baru</h4>
                          <p className="text-[9px] text-slate-500 leading-normal">Buka / tutup pendaftaran akun customer baru.</p>
                        </div>
                        <Switch
                          checked={systemForm.allowUserRegistration}
                          onCheckedChange={val => setSystemForm(p => ({ ...p, allowUserRegistration: val }))}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-slate-300">Invoice Code Prefix</label>
                        <Input
                          value={systemForm.invoicePrefix}
                          onChange={e => setSystemForm(p => ({ ...p, invoicePrefix: e.target.value }))}
                          placeholder="STZ"
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                        />
                      </div>
                    </div>

                    <Separator className="border-slate-900" />

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Batasan Transaksi (Rupiah)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Minimum Deposit</label>
                          <Input
                            type="number"
                            value={systemForm.minDeposit}
                            onChange={e => setSystemForm(p => ({ ...p, minDeposit: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Maksimum Deposit</label>
                          <Input
                            type="number"
                            value={systemForm.maxDeposit}
                            onChange={e => setSystemForm(p => ({ ...p, maxDeposit: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Minimum Nominal Order</label>
                          <Input
                            type="number"
                            value={systemForm.minOrder}
                            onChange={e => setSystemForm(p => ({ ...p, minOrder: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Batas Waktu Transaksi (Menit)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Batas Waktu Transaksi Pembelian</label>
                          <Input
                            type="number"
                            value={systemForm.orderExpiredMinutes}
                            onChange={e => setSystemForm(p => ({ ...p, orderExpiredMinutes: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[10px] text-slate-500 font-semibold">Batas Waktu Deposit Invoice</label>
                          <Input
                            type="number"
                            value={systemForm.depositExpiredMinutes}
                            onChange={e => setSystemForm(p => ({ ...p, depositExpiredMinutes: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Threshold & Toleransi Provider</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="grid gap-2">
                          <label className="text-[9px] text-slate-500 font-bold uppercase">Low Balance Alert</label>
                          <Input
                            type="number"
                            value={systemForm.lowBalanceThreshold}
                            onChange={e => setSystemForm(p => ({ ...p, lowBalanceThreshold: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[9px] text-slate-500 font-bold uppercase">Limit Gagal Order</label>
                          <Input
                            type="number"
                            value={systemForm.failedOrderLimit}
                            onChange={e => setSystemForm(p => ({ ...p, failedOrderLimit: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[9px] text-slate-500 font-bold uppercase">Retry Count API</label>
                          <Input
                            type="number"
                            value={systemForm.providerRetryLimit}
                            onChange={e => setSystemForm(p => ({ ...p, providerRetryLimit: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-[9px] text-slate-500 font-bold uppercase">Timeout API (Detik)</label>
                          <Input
                            type="number"
                            value={systemForm.providerTimeoutSeconds}
                            onChange={e => setSystemForm(p => ({ ...p, providerTimeoutSeconds: Number(e.target.value) }))}
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!isSystemChanged}
                        onClick={() => setSystemForm({ ...system })}
                        className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-xl"
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isSystemChanged || updateSystem.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Simpan Perubahan
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 6. Notifikasi Admin */}
          <TabsContent value="notifications" className="mt-0">
            {loadingNotifications ? renderSkeleton() : (
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-blue-500" /> Notifikasi Admin
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Atur email alert penerima notifikasi dan webhook chat bot admin</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={testNotifications.isPending}
                    onClick={() => testNotifications.mutate()}
                    className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 rounded-xl text-xs font-semibold"
                  >
                    {testNotifications.isPending ? <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Radio className="h-3.5 w-3.5 mr-1.5" />}
                    Test Alert Notifikasi
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNotificationsSave} className="space-y-6">
                    <div className="grid gap-2">
                      <label htmlFor="notifEmail" className="text-xs font-semibold text-slate-300">Email Utama Notifikasi Admin</label>
                      <Input
                        id="notifEmail"
                        type="email"
                        value={notifForm.adminNotificationEmail}
                        onChange={e => setNotifForm(p => ({ ...p, adminNotificationEmail: e.target.value }))}
                        placeholder="alert@stazstore.com"
                        className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                      />
                    </div>

                    <Separator className="border-slate-900" />

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Saluran Event Alert</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: "notifyDepositIncoming", label: "Deposit Baru Masuk", desc: "Kirim notifikasi setiap ada transaksi invoice topup." },
                          { key: "notifyOrderSuccess", label: "Pembelian Sukses", desc: "Kirim notifikasi saat order berhasil diproses." },
                          { key: "notifyOrderFailed", label: "Alert Gagal Order", desc: "Notifikasi darurat saat provider menolak transaksi." },
                          { key: "notifyProviderError", label: "Digiflazz API Error", desc: "Alert saat server Digiflazz tidak merespon." },
                          { key: "notifyLowBalance", label: "Saldo Provider Menipis", desc: "Notifikasi saat sisa deposit Digiflazz kritis." },
                          { key: "notifyBalanceAdjustment", label: "Penyesuaian Saldo Manual", desc: "Notifikasi audit jika admin mengubah saldo." },
                          { key: "notifyNewDeviceLogin", label: "Login Lokasi Baru", desc: "Kirim alert jika login terdeteksi dari device asing." }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3.5 border border-slate-800/80 rounded-2xl bg-slate-900/5 hover:border-slate-800 transition-colors">
                            <div className="space-y-1 pr-3">
                              <span className="text-xs font-bold text-slate-300 block">{item.label}</span>
                              <p className="text-[9px] text-slate-500 leading-normal">{item.desc}</p>
                            </div>
                            <Switch
                              checked={(notifForm as any)[item.key]}
                              onCheckedChange={val => setNotifForm(p => ({ ...p, [item.key]: val }))}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="border-slate-900" />

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Webhook Chat Bot Alerts</h4>
                      <div className="grid gap-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Telegram Chat ID / Bot Token</label>
                        <Input
                          value={notifForm.telegramWebhookChatId}
                          onChange={e => setNotifForm(p => ({ ...p, telegramWebhookChatId: e.target.value }))}
                          placeholder="Telegram chat id bot..."
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Discord Webhook URL</label>
                        <Input
                          value={notifForm.discordWebhookUrl}
                          onChange={e => setNotifForm(p => ({ ...p, discordWebhookUrl: e.target.value }))}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!isNotifChanged}
                        onClick={() => setNotifForm({ ...notifications })}
                        className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-xl"
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isNotifChanged || updateNotifications.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Simpan Notifikasi
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 7. Integrasi & Webhook */}
          <TabsContent value="integrations" className="mt-0">
            {loadingIntegrations ? renderSkeleton() : (
              <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-blue-500" /> Integrasi & Webhook
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Kelola endpoint callback pembayaran dari payment gateway dan token rahasia webhook</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleIntegrationsSave} className="space-y-6">
                    {/* Callback URL list */}
                    <div className="space-y-4 p-4 border border-slate-800 bg-slate-900/15 rounded-2xl shadow-inner">
                      <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Callback Listener Endpoints</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Payment Gateway Callback URL</span>
                          <div className="flex gap-2">
                            <Input value={integrations?.paymentCallbackUrl || ""} readOnly className="bg-slate-950 border-slate-900 text-slate-400 text-xs select-all rounded-xl py-5" />
                            <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(integrations?.paymentCallbackUrl || "", "Payment Callback")} className="border-slate-800 text-slate-400 hover:bg-slate-900/40 rounded-xl shrink-0 h-10 w-10">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Provider Callback URL (Digiflazz)</span>
                          <div className="flex gap-2">
                            <Input value={integrations?.providerCallbackUrl || ""} readOnly className="bg-slate-950 border-slate-900 text-slate-400 text-xs select-all rounded-xl py-5" />
                            <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(integrations?.providerCallbackUrl || "", "Provider Callback")} className="border-slate-800 text-slate-400 hover:bg-slate-900/40 rounded-xl shrink-0 h-10 w-10">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="border-slate-900" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">Environment Mode</label>
                        <Select value={integrationForm.integrationMode} onValueChange={val => setIntegrationForm(p => ({ ...p, integrationMode: val }))}>
                          <SelectTrigger className="bg-slate-900/40 border-slate-800 rounded-xl py-5">
                            <SelectValue placeholder="Pilih Mode" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 rounded-xl">
                            <SelectItem value="sandbox" className="text-slate-300">Sandbox / Development</SelectItem>
                            <SelectItem value="production" className="text-slate-300">Production / Live</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-slate-300">Webhook Secret Token (Masked)</label>
                        <div className="flex gap-2">
                          <Input
                            value={integrationForm.webhookSecret}
                            onChange={e => setIntegrationForm(p => ({ ...p, webhookSecret: e.target.value }))}
                            placeholder="staz_whsec_••••••••abcd"
                            className="bg-slate-900/40 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5 text-slate-300 font-mono"
                          />
                          <Button type="button" onClick={handleRegenerateSecret} className="bg-amber-600/10 border border-amber-600/30 text-amber-500 hover:bg-amber-600/20 font-semibold rounded-xl px-4 shrink-0 h-10">
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 border border-slate-800 rounded-2xl bg-slate-900/10">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-300">Verifikasi Callback Signature</h4>
                          <p className="text-[9px] text-slate-500 leading-normal">Tolak request callback yang tidak lolos verifikasi validitas signature token.</p>
                        </div>
                        <Switch
                          checked={integrationForm.verifyCallbackSignature}
                          onCheckedChange={val => setIntegrationForm(p => ({ ...p, verifyCallbackSignature: val }))}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 border border-slate-800 rounded-2xl bg-slate-900/10">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-300">Auto-Retry Callback Gagal</h4>
                          <p className="text-[9px] text-slate-500 leading-normal">Ulangi pengiriman callback secara asinkron jika server client mati/502.</p>
                        </div>
                        <Switch
                          checked={integrationForm.retryCallbackFailed}
                          onCheckedChange={val => setIntegrationForm(p => ({ ...p, retryCallbackFailed: val }))}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!isIntegrationChanged}
                        onClick={() => setIntegrationForm({ ...integrations })}
                        className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-xl"
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isIntegrationChanged || updateIntegrations.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Simpan Integrasi
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 8. Backup & Maintenance */}
          <TabsContent value="backup" className="mt-0">
            <Card className="border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" /> Backup & Maintenance
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">Unduh file backup config JSON, retention cadangan database, dan informasi sistem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Export JSON config */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-800 bg-slate-900/10 rounded-2xl gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-200">Ekspor Settings Konfigurasi (JSON)</h4>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-[420px]">Salin dan unduh file settings global dalam bentuk berkas JSON untuk kebutuhan backup migrasi.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const all = { branding, system, notifications, integrations };
                      const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `staz_settings_${new Date().toISOString().split("T")[0]}.json`;
                      a.click();
                      toast.success("File settings JSON berhasil diekspor");
                    }}
                    className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 rounded-xl text-xs font-semibold"
                  >
                    Unduh Config JSON
                  </Button>
                </div>

                {/* DB Backup Manual & Auto */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-800 bg-slate-900/5 rounded-2xl gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-300">Pencadangan Database Manual (SQL)</h4>
                        <Badge className="bg-slate-900 border border-slate-800 text-slate-500 text-[9px] rounded-full px-2 py-0">Segera Hadir</Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-[420px]">Unduh dump sql data tabel transaksi, user, dan catalog secara langsung.</p>
                    </div>
                    <Button disabled variant="outline" className="rounded-xl text-xs">Backup Sekarang</Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-800 bg-slate-900/5 rounded-2xl gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-300">Jadwal Backup Otomatis</h4>
                        <Badge className="bg-slate-900 border border-slate-800 text-slate-500 text-[9px] rounded-full px-2 py-0">Belum Aktif</Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-[420px]">Buat otomatis dump sql periodik (cron job) setiap tengah malam ke S3 storage.</p>
                    </div>
                    <div className="w-[180px]">
                      <Select disabled value="daily">
                        <SelectTrigger className="bg-slate-900/40 border-slate-800 rounded-xl">
                          <SelectValue placeholder="Jadwal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Setiap Hari</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="border-slate-900" />

                {/* System info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Status Environment Mesin</h4>
                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div className="p-3.5 border border-slate-800/80 bg-slate-950/20 rounded-2xl space-y-1 leading-relaxed">
                      <span className="text-slate-500 block font-semibold">Engine Runtime / Server</span>
                      <span className="font-bold text-slate-200">Bun JS v1.1+ (Framework Next.js v16)</span>
                    </div>
                    <div className="p-3.5 border border-slate-800/80 bg-slate-950/20 rounded-2xl space-y-1 leading-relaxed">
                      <span className="text-slate-500 block font-semibold">Deploy Environment</span>
                      <span className="font-bold text-sky-400 uppercase tracking-wide">Development Mode</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Confirmation Password Modal */}
      <Dialog
        open={confirmPasswordModal.isOpen}
        onOpenChange={open => setConfirmPasswordModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[420px] bg-slate-950 border-slate-800/80 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-amber-500 font-bold text-lg">
              <ShieldAlert className="h-5 w-5" />
              {confirmPasswordModal.title}
            </DialogTitle>
            <DialogDescription className="text-xs pt-2.5 leading-relaxed text-slate-400">
              {confirmPasswordModal.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Masukkan Password Akun Anda</label>
            <Input
              type="password"
              placeholder="Password admin"
              value={confirmPasswordModal.passwordValue}
              onChange={e => setConfirmPasswordModal(prev => ({ ...prev, passwordValue: e.target.value }))}
              className="bg-slate-900 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-5"
            />
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0 pt-2 border-t border-slate-900">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmPasswordModal(prev => ({ ...prev, isOpen: false }))}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={!confirmPasswordModal.passwordValue}
              onClick={() => confirmPasswordModal.onConfirm(confirmPasswordModal.passwordValue)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/10 transition-all duration-300"
            >
              Konfirmasi Tindakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secret Display Modal */}
      <Dialog
        open={newSecretModal.isOpen}
        onOpenChange={open => setNewSecretModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[480px] bg-slate-950 border-slate-800/80 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
              <Check className="h-5 w-5" />
              Webhook Secret Baru Berhasil Dibuat
            </DialogTitle>
            <DialogDescription className="text-xs pt-2.5 leading-relaxed text-slate-400">
              Salin dan amankan token secret ini sekarang. Demi alasan privasi, token ini tidak akan ditampilkan kembali.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex gap-2 items-center">
              <Input
                readOnly
                value={newSecretModal.secret}
                className="font-mono text-xs bg-slate-900 border-slate-800 text-emerald-400 select-all rounded-xl py-5 focus-visible:ring-0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(newSecretModal.secret, "Webhook Secret")}
                className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 rounded-xl h-10 w-10 shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-amber-500 font-semibold leading-normal">
              Peringatan: Jangan pernah menaruh webhook secret ini di file/repo publik atau meneruskannya ke browser client.
            </p>
          </div>
          <DialogFooter className="pt-2 border-t border-slate-900">
            <Button type="button" onClick={() => setNewSecretModal({ isOpen: false, secret: "" })} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/15">
              Saya Mengerti & Sudah Menyimpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
