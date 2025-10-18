// types/next-auth.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
    interface JWT {
        accessToken?: string;
        accessTokenExpires?: number;
        error?: string;
        [key: string]: unknown;
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            role?: string;
        };
        accessToken?: string;
        accessTokenExpires?: number;
        error?: string;
    }

    interface User {
        id: string;
        role?: string;
        accessToken?: string;
        accessTokenExpires?: number;
    }
}
