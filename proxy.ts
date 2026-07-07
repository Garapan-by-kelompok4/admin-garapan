import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

/**
 * Route protection (ADR 002). In Next.js 16 this is the `proxy` convention
 * (formerly `middleware`); it runs on the Node.js runtime.
 *
 * - No session cookie on a dashboard route → redirect to /login (carrying the
 *   intended path as `?redirect=`).
 * - Session cookie on /login → bounce to /dashboard.
 *
 * Presence of the access-token cookie is the session signal. Real verification
 * happens at the proxy/BFF; this only gates navigation.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/users",
  "/moderation",
  "/disputes",
  "/transactions",
  "/chat",
  "/articles",
  "/settings",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/moderation/:path*",
    "/disputes/:path*",
    "/transactions/:path*",
    "/chat/:path*",
    "/articles/:path*",
    "/settings/:path*",
    "/login",
  ],
};
