import { create } from "zustand";

export type AuthStatus = "loading" | "authenticated" | "guest";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
};

type AuthState = {
  user: AdminUser | null;
  status: AuthStatus;
  setUser: (user: AdminUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  reset: () => set({ user: null, status: "guest" }),
}));
