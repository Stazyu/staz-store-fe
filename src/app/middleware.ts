// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

/**
 * Helper: fetch session dari backend.
 * Middleware berjalan di edge runtime — tidak bisa pakai React cache().
 * Fetch di sini satu kali per request middleware saja.
 */
async function fetchSession(req: NextRequest) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/auth/get-session`, {
        headers: {
            cookie: req.headers.get('cookie') || '',
        },
        cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.user ? data : null;
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Lewati middleware untuk static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api/')
    ) {
        return NextResponse.next();
    }

    // Proteksi admin routes
    if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
        let sessionData = null;

        try {
            sessionData = await fetchSession(req);
        } catch (error) {
            console.error('[Middleware] Admin session fetch failed:', error);
            return NextResponse.redirect(new URL('/', req.url));
        }

        if (!sessionData?.user) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        const role = sessionData.user.role as string;
        const isAdmin = role.toLowerCase() === 'admin' || role.toLowerCase() === 'super_admin';

        if (!isAdmin) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        // Forward user info via header agar Server Components tidak perlu fetch ulang
        // (optional optimization — admin/layout.tsx saat ini pakai getSession() dengan React cache)
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-role', role);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    // Arahkan user yang sudah login agar tidak bisa mengakses halaman auth
    if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
        let sessionData = null;

        try {
            sessionData = await fetchSession(req);
        } catch {
            // Biarkan lanjut ke halaman auth jika fetch gagal
            return NextResponse.next();
        }

        if (sessionData?.user) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match semua path kecuali static files & _next
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
