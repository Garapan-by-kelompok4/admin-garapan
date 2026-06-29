import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  
  // Accept any login request for testing purposes
  const email = json?.email || "admin@garapan.test";
  const name = email.split("@")[0];
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  const user = {
    id: "mock-admin-id",
    name: formattedName || "Admin Garapan",
    email: email,
    role: "ADMIN",
  };

  const response = NextResponse.json({ user });
  
  // Set mock access and refresh tokens
  setAuthCookies(response, { 
    accessToken: "mock-access-token", 
    refreshToken: "mock-refresh-token" 
  });
  
  return response;
}
