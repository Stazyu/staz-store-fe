// lib/auth.ts
"use server";
import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';

const JWT_SECRET = process.env.NEXTAUTH_SECRET!; // sama dengan NEXTAUTH_SECRET di NextAuth config

export async function auth() {
  const token = (await cookies()).get('next-auth.session-token')?.value || (await cookies()).get('__Secure-next-auth.session-token')?.value;
  if (!token) return null;

  try {
    const decoded = await decode({ token, secret: JWT_SECRET });

    const res = await fetch('http://localhost:3001/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${decoded?.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      user: data.user,
      accessToken: decoded?.accessToken as string,
    };
  } catch (err) {
    console.error('Invalid JWT or fetch error', err);
    return null;
  }
}
