import { headers } from "next/headers";


export async function GET(req: Request) {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const cookie = req.headers.get("cookie") ?? "";
    // const headerList = await headers();
    // const session = await auth.api.getSession({
    //     headers: Object.fromEntries(headerList.entries()),
    //     returnHeaders: true,
    // });

    // Token hadir di header response jika Better‑Auth mengeluarkannya
    const res = await fetch(
        `${process.env.BACKEND_URL}/api/auth/token`,
        {
            method: "GET",
            credentials: "include", // penting: sertakan cookie session
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookie,
            },
        }
    );

    console.log("cookie :", req.headers);

    if (!res.ok) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await res.json();

    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kirim ke backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "cookie": cookieHeader,
        },
    });

    const data = await response.json();
    const profile = {
        // id: session.response?.user.id,
        // email: session.response?.user.email,
        // name: session.response?.user.name,
        // phoneNumber: session.response?.user.phoneNumber,
        ...data.user
    }

    console.log("profile", profile);

    return Response.json(profile);
}

export async function PATCH(req: Request) {
    const cookie = req.headers.get("cookie") ?? "";
    const body = await req.json();

    // Token hadir di header response jika Better‑Auth mengeluarkannya
    const res = await fetch(
        `${process.env.BACKEND_URL}/api/auth/token`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookie,
            },
        }
    );

    if (!res.ok) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await res.json();

    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kirim ke backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/profile/${body.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "cookie": cookie,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
}