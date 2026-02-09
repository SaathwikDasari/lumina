const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL!;

export async function login(email: string, password: string) {
    const res = await fetch(`${AUTH_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // IMPORTANT: stores refresh cookie in browser
    body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Login failed");
    return data as { accessToken: string; user: { id: string; email: string; name: string | null } };
}

export async function register(email: string, password: string, name?: string) {
    const res = await fetch(`${AUTH_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Register failed");
    return data;
    }

export async function refresh() {
    const res = await fetch(`${AUTH_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", // sends refresh cookie
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Refresh failed");
    return data as { accessToken: string };
}

export async function logout() {
    const res = await fetch(`${AUTH_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Logout failed");
    return data;
}
