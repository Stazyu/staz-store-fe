import authClient from "./auth-client";

export async function fetchWithJwt(
    url: string,
    options: RequestInit = {}
) {
    // 1) Ambil JWT dari Better-Auth client
    const { data, error } = await authClient.token();

    if (error) {
        console.error("Gagal ambil JWT:", error);
        throw new Error(error.message || "Gagal otentikasi");
    }
    if (!data?.token) {
        throw new Error("Token JWT tidak tersedia");
    }

    const token = data.token;

    // 2) Tambahkan header Authorization secara otomatis
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers ?? {}),
            Authorization: `Bearer ${token}`,
        }
    });

    return response;
}
