"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { fetchMe } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";

/**
 * Hydrates the auth store from /api/auth/me on first mount and gates the
 * dashboard shell until the session is confirmed. `proxy.ts` already blocks
 * unauthenticated navigation; this is the client-side counterpart that also
 * handles a dead session (refresh failed) by clearing state and bouncing to
 * /login.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    if (status !== "loading") return;

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
  }, [status, setUser, setStatus, reset, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return <>{children}</>;
}
