// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin/dashboard'];
const PUBLIC_PATHS = ['/auth/login', '/', '/(app)'];
const APP_PATHS = ['/(app)'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    // Skip middleware for public paths
    if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return NextResponse.next();
    }

    // Check admin routes
    if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store',
            });

            if (!response.ok) {
                return NextResponse.redirect(new URL('/', req.url));
            }

            const { user } = await response.json();
            
            if (user.role !== 'admin') {
                return NextResponse.redirect(new URL('/', req.url));
            }

            // Add user info to request headers for server components
            const requestHeaders = new Headers(req.headers);
            requestHeaders.set('x-user-role', user.role);
            
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (error) {
            console.error('Middleware error:', error);
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Handle app routes
    if (APP_PATHS.some(path => pathname.startsWith(path))) {
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store',
            });

            if (!response.ok) {
                return NextResponse.redirect(new URL('/auth/login', req.url));
            }

            const { user } = await response.json();
            
            // Add user info to request headers for server components
            const requestHeaders = new Headers(req.headers);
            requestHeaders.set('x-user-role', user.role);
            
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (error) {
            console.error('Middleware error:', error);
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
