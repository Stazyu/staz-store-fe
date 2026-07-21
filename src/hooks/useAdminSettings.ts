import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithJwt } from "@/lib/api-client";
import { toast } from "react-hot-toast";

const SETTINGS_KEYS = {
  profile: ["admin", "settings", "profile"] as const,
  password: ["admin", "settings", "password"] as const,
  preferences: ["admin", "settings", "preferences"] as const,
  branding: ["admin", "settings", "branding"] as const,
  system: ["admin", "settings", "system"] as const,
  notifications: ["admin", "settings", "notifications"] as const,
  integrations: ["admin", "settings", "integrations"] as const,
  sessions: ["admin", "settings", "sessions"] as const
};

// ─── Profile Hooks ───────────────────────────────────────────────────────────

export function useAdminProfileSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.profile,
    queryFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/profile", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil profil admin");
      return data.data;
    }
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; confirmPassword?: string }) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Profil berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.profile });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui profil");
    }
  });
}

// ─── Password Hooks ──────────────────────────────────────────────────────────

export function useUpdateAdminPassword() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah password");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password berhasil diubah");
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat mengubah password");
    }
  });
}

// ─── Preferences Hooks ─────────────────────────────────────────────────────────

export function useAdminPreferences() {
  return useQuery({
    queryKey: SETTINGS_KEYS.preferences,
    queryFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/preferences", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil preferensi tampilan");
      return data.data;
    }
  });
}

export function useUpdateAdminPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui preferensi");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Preferensi tampilan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.preferences });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui preferensi");
    }
  });
}

// ─── Branding Hooks ───────────────────────────────────────────────────────────

export function useBrandingSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.branding,
    queryFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/branding", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil branding toko");
      return data.data;
    }
  });
}

export function useUpdateBrandingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui branding");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Branding toko berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.branding });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui branding");
    }
  });
}

// ─── System Settings Hooks ────────────────────────────────────────────────────

export function useSystemSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.system,
    queryFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/system", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil pengaturan sistem");
      return data.data;
    }
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/system", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui pengaturan sistem");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Pengaturan sistem berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.system });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui pengaturan sistem");
    }
  });
}

// ─── Notifications Hooks ──────────────────────────────────────────────────────

export function useNotificationSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.notifications,
    queryFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/notifications", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil pengaturan notifikasi");
      return data.data;
    }
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui notifikasi");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Pengaturan notifikasi berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.notifications });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui notifikasi");
    }
  });
}

export function useTestNotification() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/notifications/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim test notifikasi");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Test notifikasi terkirim");
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat mengirim test notifikasi");
    }
  });
}

// ─── Integration Hooks ────────────────────────────────────────────────────────

export function useIntegrationSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.integrations,
    queryFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/integrations", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil pengaturan integrasi");
      return data.data;
    }
  });
}

export function useUpdateIntegrationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui integrasi");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Pengaturan integrasi berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.integrations });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui integrasi");
    }
  });
}

export function useRegenerateWebhookSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { confirmPassword: string }) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/integrations/regenerate-webhook-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal meregenerasi secret");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.integrations });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat meregenerasi webhook secret");
    }
  });
}

// ─── Security Sesi Hooks ──────────────────────────────────────────────────────

export function useAdminSessions() {
  return useQuery({
    queryKey: SETTINGS_KEYS.sessions,
    queryFn: async () => {
      const res = await fetchWithJwt("/api/v1/admin/settings/security/sessions", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil sesi aktif");
      return data.data;
    }
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetchWithJwt(`/api/v1/admin/settings/security/sessions/${sessionId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus sesi");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Sesi berhasil dicabut");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.sessions });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat mencabut sesi");
    }
  });
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { confirmPassword: string }) => {
      const res = await fetchWithJwt("/api/v1/admin/settings/security/logout-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal logout perangkat lain");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Logout dari semua perangkat lain berhasil");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.sessions });
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat logout semua perangkat lain");
    }
  });
}
