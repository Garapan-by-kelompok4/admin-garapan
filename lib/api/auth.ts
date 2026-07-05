import type { AdminUser } from "@/store/auth-store";
import type { LoginInput } from "@/lib/validators/auth";

/** Error carrying the HTTP status so callers can branch on it. */
export class AuthError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

async function readMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: unknown;
  } | null;
  return typeof body?.message === "string" ? body.message : fallback;
}

/** POST /api/auth/login — sets httpOnly cookies, returns the admin profile. */
export async function login(input: LoginInput): Promise<{ user: AdminUser }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new AuthError(
      await readMessage(response, "Gagal masuk, coba lagi"),
      response.status,
    );
  }
  return response.json() as Promise<{ user: AdminUser }>;
}

/** POST /api/auth/logout — clears cookies (best-effort revoke on the backend). */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => undefined);
}

/**
 * GET /api/auth/me — hydrate the auth store. On a 401 (e.g. the 15m access JWT
 * expired) it tries /api/auth/refresh once and retries, so a still-valid 7d
 * session is not dropped on a hard refresh.
 */
export async function fetchMe(
  retryOnUnauthorized = true,
): Promise<{ user: AdminUser }> {
  const response = await fetch("/api/auth/me", { credentials: "include" });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      return fetchMe(false);
    }
  }

  if (!response.ok) {
    throw new AuthError(
      await readMessage(response, "Sesi tidak valid"),
      response.status,
    );
  }
  return response.json() as Promise<{ user: AdminUser }>;
}
