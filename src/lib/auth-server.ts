/**
 * auth-server.ts
 * 
 * Server-side auth helper. Menggunakan React cache() agar fetch get-session
 * hanya terjadi SEKALI per request, walaupun dipanggil dari banyak Server Components.
 *
 * ⚠️ File ini hanya boleh di-import dari Server Components / Server Actions.
 *    Jangan import ke Client Components.
 */

import { cache } from "react";
import { headers } from "next/headers";

export type SessionUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    phoneNumber?: string;
    image?: string | null;
};

export type SessionData = {
    session: {
        id: string;
        userId: string;
        expiresAt: string;
    };
    user: SessionUser;
} | null;

/**
 * getSession()
 * 
 * Fetch session dari backend. Menggunakan React cache() sehingga:
 * - Dalam satu request lifecycle, hanya 1x HTTP call ke backend.
 * - Safe dipanggil dari multiple Server Components (layout + page, dll).
 */
export const getSession = cache(async (): Promise<SessionData> => {
    // 1. Dapatkan semua headers dari request Next.js (termasuk cookie, origin, user-agent, dll)
    const headersList = await headers();
    
    // Convert ReadonlyHeaders ke Headers object standar yang bisa dipakai fetch
    const fetchHeaders = new Headers();
    headersList.forEach((value, key) => {
        // Pengecualian host header (biarkan fetch mengatur host target backend)
        if (key.toLowerCase() !== 'host') {
            fetchHeaders.append(key, value);
        }
    });

    try {
        const res = await fetch(
            `${process.env.BACKEND_URL}/api/auth/get-session`,
            {
                headers: fetchHeaders,
                cache: "no-store",
            }
        );

        if (!res.ok) return null;

        const data = await res.json();

        // better-auth mengembalikan null jika tidak ada sesi aktif
        if (!data?.user) return null;

        return data as SessionData;
    } catch (error) {
        console.error("[getSession] fetch failed:", error);
        return null;
    }
});
