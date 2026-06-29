import { NextResponse, type NextRequest } from "next/server";

import { nestjsBaseUrl } from "@/lib/auth/api";
import {
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/auth/cookies";

/**
 * POST /api/auth/refresh — rotate tokens server-side.
 *
 * Reads the httpOnly refresh cookie, exchanges it at NestJS `POST /auth/refresh`
 * (which revokes the old token and issues a new pair), and rewrites both
 * cookies. On any failure the session is cleared so the client falls back to
 * /login.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    const response = NextResponse.json(
      { message: "Sesi tidak ditemukan" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const upstream = await fetch(`${nestjsBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const response = NextResponse.json(
      { message: "Sesi berakhir, silakan login kembali" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const tokens = (await upstream.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  if (!tokens.accessToken || !tokens.refreshToken) {
    const response = NextResponse.json(
      { message: "Sesi berakhir, silakan login kembali" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, tokens);
  return response;
}
