import type { NextResponse } from "next/server";

/**
 * httpOnly cookie names. The access token is readable on every route (Path=/);
 * the refresh token is scoped to /api/auth so it is only ever sent to the auth
 * Route Handlers (login/logout/refresh), never to the proxy or page navigations.
 *
 * Kept dependency-light: this module is imported by `proxy.ts` as well as the
 * auth Route Handlers, so it must not pull in `server-only`.
 */
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7d — full refresh/session window
const REFRESH_TOKEN_PATH = "/api/auth";

/**
 * The access-token *cookie* lives for the whole session window (7d), while the
 * access *JWT* inside it still expires in 15m (enforced by NestJS). This
 * decouples route gating from token validity: `proxy.ts` can treat the cookie
 * as "a session exists", and when the 15m JWT has expired the proxy/refresh
 * flow swaps in a fresh access token. Without this, the cookie would vanish
 * after 15m and bounce an otherwise-valid session to /login. (ADR 002)
 */
const ACCESS_TOKEN_MAX_AGE = SESSION_MAX_AGE;
const REFRESH_TOKEN_MAX_AGE = SESSION_MAX_AGE;

// Secure cookies require HTTPS; disabling on dev lets them work over localhost.
const secure = process.env.NODE_ENV === "production";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export function setAuthCookies(
  response: NextResponse,
  tokens: TokenPair,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: REFRESH_TOKEN_PATH,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: REFRESH_TOKEN_PATH,
    maxAge: 0,
  });
}
