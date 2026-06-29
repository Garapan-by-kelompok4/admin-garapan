"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { logout } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";

/** Revoke the session on the backend, clear the store, and return to /login. */
export function useLogout() {
  const router = useRouter();
  const reset = useAuthStore((state) => state.reset);

  return useCallback(async () => {
    await logout();
    reset();
    router.replace("/login");
  }, [reset, router]);
}
