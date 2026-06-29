import { NextResponse, type NextRequest } from "next/server";

import { nestjsBaseUrl } from "@/lib/auth/api";
import { setAuthCookies } from "@/lib/auth/cookies";
import { toAdminUser, type AdminMeResponse } from "@/lib/auth/profile";
import { loginSchema } from "@/lib/validators/auth";

type LoginUpstream =
  | { accessToken: string; refreshToken: string }
  | { requiresTwoFactor: true; preAuthToken: string };

/**
 * POST /api/auth/login — BFF login.
 *
 * 1. Validate input, proxy to NestJS `POST /auth/login`.
 * 2. Reject the deferred 2FA path (ADR 002: no admin 2FA in v1).
 * 3. Gate on ADMIN role via `GET /admin/me` (RolesGuard-protected).
 * 4. On success: set httpOnly cookies, return the admin profile only.
 *    On non-admin: revoke the freshly issued refresh token, set no cookies.
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Email atau password tidak valid" },
      { status: 400 },
    );
  }

  const base = nestjsBaseUrl();

  const loginResponse = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!loginResponse.ok) {
    // 401 invalid credentials / unverified / banned — all opaque to the client.
    return NextResponse.json(
      { message: "Email atau password salah" },
      { status: 401 },
    );
  }

  const data = (await loginResponse.json()) as LoginUpstream;

  if ("requiresTwoFactor" in data) {
    return NextResponse.json(
      { message: "Login 2FA admin belum didukung" },
      { status: 403 },
    );
  }

  const { accessToken, refreshToken } = data;
  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { message: "Login gagal, coba lagi" },
      { status: 502 },
    );
  }

  // Verify admin role + fetch the profile in one call.
  const meResponse = await fetch(`${base}/admin/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const user = meResponse.ok
    ? toAdminUser((await meResponse.json()) as AdminMeResponse)
    : null;

  if (!user) {
    // Not an admin (or profile lookup failed): never leave a usable refresh
    // token behind for a rejected login.
    await fetch(`${base}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);

    return NextResponse.json(
      { message: "Akun ini tidak memiliki akses admin" },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ user });
  setAuthCookies(response, { accessToken, refreshToken });
  return response;
}
