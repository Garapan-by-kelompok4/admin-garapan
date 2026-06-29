import { NextResponse, type NextRequest } from "next/server";

import { nestjsBaseUrl } from "@/lib/auth/api";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { toAdminUser, type AdminMeResponse } from "@/lib/auth/profile";

/**
 * GET /api/auth/me — hydrate the client auth store.
 *
 * Returns the admin profile for the current access-token cookie, or 401 if the
 * token is missing/expired/non-admin. The client may then call
 * /api/auth/refresh and retry once before falling back to /login.
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const meResponse = await fetch(`${nestjsBaseUrl()}/admin/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const user = meResponse.ok
    ? toAdminUser((await meResponse.json()) as AdminMeResponse)
    : null;

  if (!user) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
