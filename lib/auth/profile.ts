import "server-only";

import type { AdminUser } from "@/store/auth-store";

/** Shape returned by NestJS `GET /admin/me` (subset we rely on). */
export type AdminMeResponse = {
  id: string;
  email: string;
  role: string;
  displayName: string | null;
};

/**
 * Map the backend admin profile to the client-facing {@link AdminUser}.
 * Returns null if the account is not an ADMIN — a defensive double-check on
 * top of the backend RolesGuard before we ever set session cookies.
 */
export function toAdminUser(profile: AdminMeResponse): AdminUser | null {
  if (profile.role !== "ADMIN") {
    return null;
  }
  return {
    id: profile.id,
    email: profile.email,
    name: profile.displayName?.trim() || profile.email,
    role: "ADMIN",
  };
}
