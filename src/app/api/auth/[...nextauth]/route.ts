import NextAuth, { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    const res = await fetch('http://localhost:3001/api/v1/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password,
                        }),
                    });

                    const data = await res.json();
                    console.log(res.status);
                    if (!res.ok) {
                        // Kirim status dan pesan error ke frontend dalam JSON string
                        throw new Error(JSON.stringify({
                            status: res.status,
                            message: data?.message || 'Login failed',
                        }));
                    }

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role,
                        accessToken: data.token,
                        accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 jam
                    };
                } catch (error: unknown) {
                    throw new Error((error as Error).message || 'Terjadi kesalahan pada server.');
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 60 * 1000, // ini boleh tetap untuk cookie TTL
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User & { accessToken?: string; accessTokenExpires?: number } }) {
            if (user) {
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.accessTokenExpires = user.accessTokenExpires;
            }

            // Check if token is expired
            if (token.accessTokenExpires && typeof token.accessTokenExpires === 'number' && Date.now() > token.accessTokenExpires) {
                return {
                    ...token,
                    accessToken: null,
                    error: "AccessTokenExpired",
                };
            }

            return token;
        },

        async session({ session, token }) {
            session.user.role = token.role as string;
            session.accessToken = token.accessToken as string;
            session.error = token.error as string;
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
