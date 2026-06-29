import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  // Bypass verification for mock tokens
  if (accessToken === "mock-access-token") {
    return NextResponse.json({
      user: {
        id: "mock-admin-id",
        name: "Admin Garapan",
        email: "admin@garapan.test",
        role: "ADMIN",
      }
    });
  }

  return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
}
