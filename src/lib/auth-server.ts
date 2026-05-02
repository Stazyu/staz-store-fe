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
import { cookies } from "next/headers";

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
    const cookieStore = await cookies();
    const cookie = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    try {
        const res = await fetch(
            `${process.env.BACKEND_URL}/api/auth/get-session`,
            {
                headers: { cookie },
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
