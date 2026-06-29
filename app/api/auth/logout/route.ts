import { NextResponse, type NextRequest } from "next/server";

import { nestjsBaseUrl } from "@/lib/auth/api";
import { REFRESH_TOKEN_COOKIE, clearAuthCookies } from "@/lib/auth/cookies";

/**
 * POST /api/auth/logout — revoke the refresh token on NestJS (best-effort) and
 * always clear the session cookies, even if revocation fails.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${nestjsBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
