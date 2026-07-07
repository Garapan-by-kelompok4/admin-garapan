"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

import { fetchMe } from "@/lib/api/auth";
import { type AdminUser, useAuthStore } from "@/store/auth-store";

type AuthProviderProps = {
  children: React.ReactNode;
  /** Hydrated from the server when the access JWT is still valid. */
  initialUser?: AdminUser | null;
};

/**
 * Hydrates the auth store from the server layout (fast path) or /api/auth/me on
 * first mount when the access JWT has expired. `proxy.ts` already blocks
 * unauthenticated navigation; this is the client-side counterpart that also
 * handles a dead session (refresh failed) by clearing state and bouncing to
 * /login.
 */
export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const reset = useAuthStore((state) => state.reset);

  useLayoutEffect(() => {
    if (!initialUser) return;
    useAuthStore.setState({ user: initialUser, status: "authenticated" });
  }, [initialUser]);

  useEffect(() => {
    if (initialUser || status !== "loading") return;

    let active = true;
    fetchMe()
      .then(({ user }) => {
        if (!active) return;
        setUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        reset();
        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [initialUser, status, setUser, setStatus, reset, router]);

  if (!initialUser && status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return <>{children}</>;
}
