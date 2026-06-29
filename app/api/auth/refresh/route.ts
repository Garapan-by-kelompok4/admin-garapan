import { NextResponse, type NextRequest } from "next/server";
import {
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/auth/cookies";

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

  // Bypass for mock refresh
  if (refreshToken === "mock-refresh-token") {
    const response = NextResponse.json({ ok: true });
    setAuthCookies(response, {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    });
    return response;
  }

  const response = NextResponse.json(
    { message: "Sesi berakhir, silakan login kembali" },
    { status: 401 }
  );
  clearAuthCookies(response);
  return response;
}
