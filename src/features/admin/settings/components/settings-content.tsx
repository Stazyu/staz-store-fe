"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FiUser, FiLock, FiSun, FiImage, FiMoon, FiMonitor, FiUpload, FiCheck, FiAlertCircle, FiCamera } from "react-icons/fi";

export default function SettingsPageContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "Admin", email: "admin@mail.com", avatar: "" });
  const [password, setPassword] = useState({ old: "", new: "", confirm: "" });
  const [branding, setBranding] = useState({ storeName: "Staz Store", logo: "" });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profil diperbarui!");
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    alert("Password diubah!");
  };

  const handleBranding = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Branding toko diperbarui!");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBranding(b => ({ ...b, logo: file.name }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPasswordStrength = (pw: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pw.length >= 6) strength++;
    if (pw.length >= 8) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;

    if (strength <= 1) return { strength, label: "Lemah", color: "bg-red-500" };
    if (strength <= 2) return { strength, label: "Sedang", color: "bg-yellow-500" };
    if (strength <= 3) return { strength, label: "Kuat", color: "bg-blue-500" };
    return { strength, label: "Sangat Kuat", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password.new);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 bg-muted/50 p-1">
        <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <FiUser className="h-4 w-4" />
          Profil
        </TabsTrigger>
        <TabsTrigger value="password" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <FiLock className="h-4 w-4" />
          Password
        </TabsTrigger>
        <TabsTrigger value="theme" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <FiSun className="h-4 w-4" />
          Tema
        </TabsTrigger>
        <TabsTrigger value="branding" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <FiImage className="h-4 w-4" />
          Branding
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profil Admin</CardTitle>
            <CardDescription>Perbarui informasi profil dan avatar Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfile} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FiCamera className="h-6 w-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setLogoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Klik avatar untuk mengubah foto</p>
                </div>
              </div>

              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nama</label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nama lengkap"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@contoh.com"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Simpan Perubahan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Password Tab */}
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Ganti Password</CardTitle>
            <CardDescription>Perbarui password akun Anda untuk keamanan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label htmlFor="oldPassword" className="text-sm font-medium">Password Lama</label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={password.old}
                  onChange={e => setPassword(p => ({ ...p, old: e.target.value }))}
                  placeholder="Masukkan password lama"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">Password Baru</label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password.new}
                  onChange={e => setPassword(p => ({ ...p, new: e.target.value }))}
                  placeholder="Masukkan password baru"
                  required
                />
                {password.new && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-1.5">
                        {password.new.length >= 6 ? <FiCheck className="h-3 w-3 text-green-500" /> : <FiAlertCircle className="h-3 w-3" />}
                        Minimal 6 karakter
                      </li>
                      <li className="flex items-center gap-1.5">
                        {/[A-Z]/.test(password.new) ? <FiCheck className="h-3 w-3 text-green-500" /> : <FiAlertCircle className="h-3 w-3" />}
                        Huruf besar
                      </li>
                      <li className="flex items-center gap-1.5">
                        {/[0-9]/.test(password.new) ? <FiCheck className="h-3 w-3 text-green-500" /> : <FiAlertCircle className="h-3 w-3" />}
                        Angka
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Konfirmasi Password Baru</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={password.confirm}
                  onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Ulangi password baru"
                  required
                />
                {password.confirm && password.new !== password.confirm && (
                  <p className="text-xs text-red-500">Password tidak cocok</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={!password.old || !password.new || password.new !== password.confirm}>
                  Ganti Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Theme Tab */}
      <TabsContent value="theme">
        <Card>
          <CardHeader>
            <CardTitle>Preferensi Tema</CardTitle>
            <CardDescription>Pilih tema tampilan untuk dashboard admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  {theme === "light" && (
                    <div className="absolute top-2 right-2">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <FiCheck className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="w-full h-28 bg-white rounded-lg mb-3 overflow-hidden border border-gray-200 shadow-sm">
                    <div className="h-4 bg-blue-500" />
                    <div className="p-2 space-y-1.5">
                      <div className="h-2 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 rounded w-1/2" />
                      <div className="h-2 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiSun className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Light</span>
                  </div>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  {theme === "dark" && (
                    <div className="absolute top-2 right-2">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <FiCheck className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="w-full h-28 bg-gray-900 rounded-lg mb-3 overflow-hidden border border-gray-700 shadow-sm">
                    <div className="h-4 bg-blue-600" />
                    <div className="p-2 space-y-1.5">
                      <div className="h-2 bg-gray-700 rounded w-3/4" />
                      <div className="h-2 bg-gray-700 rounded w-1/2" />
                      <div className="h-2 bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMoon className="h-5 w-5 text-indigo-400" />
                    <span className="font-medium">Dark</span>
                  </div>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  {theme === "system" && (
                    <div className="absolute top-2 right-2">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <FiCheck className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="w-full h-28 relative bg-white dark:bg-gray-900 rounded-lg mb-3 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 h-full bg-white" />
                      <div className="w-1/2 h-full bg-gray-900" />
                    </div>
                    <div className="absolute inset-0 p-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1.5" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMonitor className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">System</span>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  {theme === "system"
                    ? "Mengikuti pengaturan tema sistem perangkat Anda"
                    : `Mode ${theme === "dark" ? "gelap" : "terang"} aktif`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Branding Tab */}
      <TabsContent value="branding">
        <Card>
          <CardHeader>
            <CardTitle>Branding Toko</CardTitle>
            <CardDescription>Kustomisasi tampilan toko Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBranding} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="storeName" className="text-sm font-medium">Nama Toko</label>
                  <Input
                    id="storeName"
                    value={branding.storeName}
                    onChange={e => setBranding(b => ({ ...b, storeName: e.target.value }))}
                    placeholder="Nama toko Anda"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo Toko</label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <FiImage className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                        <FiUpload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Pilih file logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Format: PNG, JPG, atau SVG. Maksimal 2MB.
                      </p>
                      {branding.logo && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <FiCheck className="h-3 w-3" />
                          {branding.logo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit">Simpan Branding</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
