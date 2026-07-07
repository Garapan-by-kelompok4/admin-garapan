import "server-only";

import { cookies } from "next/headers";

import type { AdminUser } from "@/store/auth-store";

import { nestjsBaseUrl } from "./api";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  type TokenPair,
} from "./cookies";
import { toAdminUser, type AdminMeResponse } from "./profile";

export type ResolvedSession = {
  user: AdminUser;
  /** Present when tokens were rotated during resolution. */
  newTokens?: TokenPair;
};

async function fetchAdminMe(accessToken: string): Promise<AdminUser | null> {
  try {
    const response = await fetch(`${nestjsBaseUrl()}/admin/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return toAdminUser((await response.json()) as AdminMeResponse);
  } catch {
    return null;
  }
}

async function refreshTokens(
  refreshToken: string,
): Promise<TokenPair | null> {
  try {
    const response = await fetch(`${nestjsBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const tokens = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (!tokens.accessToken || !tokens.refreshToken) {
      return null;
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  } catch {
    return null;
  }
}

/**
 * Read the current admin from the access-token cookie only.
 * Used by the dashboard layout for instant hydration when the JWT is still valid.
 * Cannot rotate tokens here — Server Components cannot set cookies.
 */
export async function readSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  return fetchAdminMe(accessToken);
}

/**
 * Resolve the admin session, refreshing tokens server-side when the access JWT
 * has expired but the refresh cookie is still valid. Route Handlers use this
 * so the client makes a single `/api/auth/me` call instead of me → refresh → me.
 */
export async function resolveSession(): Promise<ResolvedSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const user = await fetchAdminMe(accessToken);
    if (user) {
      return { user };
    }
  }

  if (!refreshToken) {
    return null;
  }

  const newTokens = await refreshTokens(refreshToken);
  if (!newTokens) {
    return null;
  }

  const user = await fetchAdminMe(newTokens.accessToken);
  if (!user) {
    return null;
  }

  return { user, newTokens };
}
