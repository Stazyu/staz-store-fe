"use client"

import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields, jwtClient, adminClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    plugins: [
        adminClient(),
        jwtClient(),
        inferAdditionalFields({
            user: {
                phoneNumber: {
                    type: "string",
                    required: true
                }
            }
        })
    ]
})

export default authClient;