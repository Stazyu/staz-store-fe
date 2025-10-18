"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FiUser, FiLock, FiSun, FiImage, FiMoon, FiMonitor } from "react-icons/fi";

export default function SettingsPageContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "Admin", email: "admin@mail.com" });
  const [password, setPassword] = useState({ old: "", new: "" });
  const [branding, setBranding] = useState({ storeName: "Staz Store", logo: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  // Dummy handlers
  const handleProfile = (e: React.FormEvent) => { e.preventDefault(); alert("Profil diperbarui!"); };
  const handlePassword = (e: React.FormEvent) => { e.preventDefault(); alert("Password diubah!"); };
  const handleBranding = (e: React.FormEvent) => { e.preventDefault(); alert("Branding toko diperbarui!"); };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="profile"><FiUser className="inline mr-1" />Profil</TabsTrigger>
        <TabsTrigger value="password"><FiLock className="inline mr-1" />Password</TabsTrigger>
        <TabsTrigger value="theme"><FiSun className="inline mr-1" />Tema</TabsTrigger>
        <TabsTrigger value="branding"><FiImage className="inline mr-1" />Branding</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader><CardTitle>Profil Admin</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleProfile} className="space-y-4 max-w-md">
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Nama" required />
              <Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="Email" required />
              <Button type="submit">Simpan</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader><CardTitle>Ganti Password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePassword} className="space-y-4 max-w-md">
              <Input type="password" value={password.old} onChange={e => setPassword(p => ({ ...p, old: e.target.value }))} placeholder="Password lama" required />
              <Input type="password" value={password.new} onChange={e => setPassword(p => ({ ...p, new: e.target.value }))} placeholder="Password baru" required />
              <Button type="submit">Ganti Password</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="theme">
        <Card>
          <CardHeader><CardTitle>Preferensi Tema</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === "light" ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <div className="w-full h-24 bg-white rounded-md mb-2 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="h-3 bg-blue-500"></div>
                    <div className="p-2">
                      <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiSun className="mr-2 text-yellow-500" />
                    <span>Light</span>
                  </div>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === "dark" ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <div className="w-full h-24 bg-gray-900 rounded-md mb-2 overflow-hidden border border-gray-700">
                    <div className="h-3 bg-blue-600"></div>
                    <div className="p-2">
                      <div className="h-2 bg-gray-700 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiMoon className="mr-2 text-indigo-300" />
                    <span>Dark</span>
                  </div>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === "system" ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <div className="w-full h-24 relative bg-white dark:bg-gray-900 rounded-md mb-2 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 h-full bg-white"></div>
                      <div className="w-1/2 h-full bg-gray-900"></div>
                    </div>
                    <div className="absolute inset-0 p-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiMonitor className="mr-2 text-gray-500" />
                    <span>System</span>
                  </div>
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {theme === "system"
                  ? "Mengikuti pengaturan tema sistem perangkat Anda"
                  : `Mode ${theme === "dark" ? "gelap" : "terang"} aktif`}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="branding">
        <Card>
          <CardHeader><CardTitle>Branding Toko</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleBranding} className="space-y-4 max-w-md">
              <Input value={branding.storeName} onChange={e => setBranding(b => ({ ...b, storeName: e.target.value }))} placeholder="Nama Toko" required />
              <Input type="file" onChange={e => setBranding(b => ({ ...b, logo: e.target.files?.[0]?.name || "" }))} />
              <Button type="submit">Simpan Branding</Button>
            </form>
            {branding.logo && <div className="mt-2 text-xs">Logo terpilih: {branding.logo}</div>}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
