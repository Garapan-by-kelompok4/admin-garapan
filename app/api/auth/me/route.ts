import { NextResponse, type NextRequest } from "next/server";

import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { resolveSession } from "@/lib/auth/session";

/**
 * GET /api/auth/me — hydrate the client auth store.
 *
 * Returns the admin profile for the current session. When the 15m access JWT
 * has expired but the refresh cookie is still valid, this handler refreshes
 * server-side and rewrites cookies so the client only needs one round trip.
 */
export async function GET(_request: NextRequest) {
  const session = await resolveSession();

  if (!session) {
    const response = NextResponse.json(
      { message: "Tidak terautentikasi" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ user: session.user });
  if (session.newTokens) {
    setAuthCookies(response, session.newTokens);
  }

  return response;
}
