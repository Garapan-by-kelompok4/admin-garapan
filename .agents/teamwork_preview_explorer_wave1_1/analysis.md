# Wave 1 (Foundation) Analysis & Implementation Plan

This document outlines the detailed architecture, directory layout, interface contracts, and exact code implementations proposed for Wave 1 of the **GARAPAN Admin Panel** project.

---

## 1. Scaffold & Theme Integration Analysis

### Next.js & Tailwind CSS v4 Setup
The project utilizes **Next.js 16.2.9** and **Tailwind CSS v4** (via `@tailwindcss/postcss`). In Tailwind v4, configuration is handled directly in the CSS file (`app/globals.css`) under the `@theme` directive, rather than a separate `tailwind.config.ts`. 

### Theme Verification against GARAPAN Design Tokens
A review of `app/globals.css` reveals that most GARAPAN design tokens (colors, semantic map, font-families) are correctly registered. However, to achieve full parity with the `design_handoff_skillmahasiswa_admin` specification, several additional utilities and missing token configurations are proposed.

#### Proposed Theme Extensions (`app/globals.css`):
1. **Missing Feedback Colors**: The core theme config is missing background and dark text tokens for status variants (`success-700`, `success-50`, `warn-700`, `warn-50`, `danger-700`, `danger-50`, `info-50`, `info-500`).
2. **Shadows**: Custom shadows (`--sh-1`, `--sh-2`, `--sh-3`) defined in the Figma handoff must be mapped to Tailwind classes (`shadow-sh-1`, `shadow-sh-2`, `shadow-sh-3`).
3. **Avatar Gradients**: Eight gradient variations (`av-0` to `av-7`) used for user avataring must be available as utilities.
4. **Status Pills**: An elegant CSS class system (`pill`, `pill-dot`, `pill-success` etc.) will simplify the markup for user and listings tables.

### Proposed Code for `app/globals.css` Modifications
These additions should be merged into the existing `app/globals.css` under the `@theme inline` block and as custom `@utility` rules:

```css
/* Add inside @theme inline */
  --shadow-sh-1: var(--sh-1);
  --shadow-sh-2: var(--sh-2);
  --shadow-sh-3: var(--sh-3);
  
  --color-success-50: var(--success-50);
  --color-success-700: var(--success-700);
  --color-warn-50: var(--warn-50);
  --color-warn-700: var(--warn-700);
  --color-danger-50: var(--danger-50);
  --color-danger-700: var(--danger-700);
  --color-info-50: var(--info-50);
  --color-info-500: var(--info-500);

/* Add below the @theme block */
@utility av-0 { background-image: linear-gradient(135deg, #F7C38D, #E9765A); }
@utility av-1 { background-image: linear-gradient(135deg, #93C5FD, #2563EB); }
@utility av-2 { background-image: linear-gradient(135deg, #A7F3D0, #059669); }
@utility av-3 { background-image: linear-gradient(135deg, #FCA5A5, #DC2626); }
@utility av-4 { background-image: linear-gradient(135deg, #C4B5FD, #7C3AED); }
@utility av-5 { background-image: linear-gradient(135deg, #FDE68A, #D97706); }
@utility av-6 { background-image: linear-gradient(135deg, #F9A8D4, #DB2777); }
@utility av-7 { background-image: linear-gradient(135deg, #A5F3FC, #0E7490); }

@utility pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.2;
}

@utility pill-dot {
  position: relative;
  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background-color: currentColor;
    opacity: 0.8;
  }
}

@utility pill-success {
  background-color: var(--success-50);
  color: var(--success-700);
}

@utility pill-danger {
  background-color: var(--danger-50);
  color: var(--danger-700);
}

@utility pill-warn {
  background-color: var(--warn-50);
  color: var(--warn-700);
}

@utility pill-info {
  background-color: var(--info-50);
  color: var(--info-500);
}

@utility pill-neutral {
  background-color: var(--surface-3);
  color: var(--ink-500);
}
```

---

## 2. Server-Side Cookie Helpers (`lib/auth/cookies.ts`)

To avoid code duplication and ensure uniform security attributes, a server-only cookie manager is proposed. Next.js 15+ rules require async interaction with the `cookies()` API.

### Proposed Code: `lib/auth/cookies.ts`
```typescript
import { cookies } from "next/headers";

/**
 * Sets access_token and refresh_token cookies with appropriate options.
 * access_token:  httpOnly, Secure, SameSite=Lax, Path=/, Max-Age=900 (15m)
 * refresh_token: httpOnly, Secure, SameSite=Lax, Path=/api/auth, Max-Age=604800 (7d)
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set({
    name: "access_token",
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 900, // 15 minutes
  });

  cookieStore.set({
    name: "refresh_token",
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth", // Restricted only to /api/auth paths for token rotation
    maxAge: 604800, // 7 days
  });
}

/**
 * Clears access and refresh tokens.
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set({
    name: "access_token",
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set({
    name: "refresh_token",
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value;
}
```

---

## 3. BFF Authentication Routes

BFF auth endpoints execute on the Next.js server, call the NestJS REST API, and translate JSON tokens into httpOnly cookies on the client browser.

### Route 1: Login (`app/api/auth/login/route.ts`)
Validates that only `ADMIN` roles are permitted access. If NestJS returns `requiresTwoFactor: true`, login is blocked (since OTP 2FA is deferred in v1).

#### Proposed Code:
```typescript
import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const backendUrl = process.env.NESTJS_API_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { message: "NestJS backend URL is not configured on BFF" },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Kredensial tidak valid" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const accessToken = data.accessToken || data.access_token;
    const refreshToken = data.refreshToken || data.refresh_token;
    const user = data.user;

    if (!accessToken || !refreshToken || !user) {
      return NextResponse.json(
        { message: "Format response server autentikasi tidak valid" },
        { status: 502 }
      );
    }

    // Role Enforcement
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya Administrator yang diperbolehkan masuk." },
        { status: 403 }
      );
    }

    // OTP 2FA Check (Deferred in v1)
    if (data.requiresTwoFactor) {
      return NextResponse.json(
        { message: "Autentikasi dua faktor (2FA) belum didukung di panel ini." },
        { status: 403 }
      );
    }

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("BFF Login Error:", error);
    return NextResponse.json(
      { message: "Gagal menghubungkan ke server login" },
      { status: 500 }
    );
  }
}
```

### Route 2: Logout (`app/api/auth/logout/route.ts`)
Clears cookies and sends a backend revoke request to NestJS.

#### Proposed Code:
```typescript
import { NextResponse } from "next/server";
import { getAccessToken, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const accessToken = await getAccessToken();
    const backendUrl = process.env.NESTJS_API_URL;

    if (accessToken && backendUrl) {
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch((err) => {
        console.error("Gagal melakukan pencabutan token di backend:", err);
      });
    }

    await clearAuthCookies();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BFF Logout Error:", error);
    await clearAuthCookies();
    return NextResponse.json({ success: true });
  }
}
```

### Route 3: Refresh Session (`app/api/auth/refresh/route.ts`)
Invokes the backend token rotation API using the refresh token from cookie, then sets the new access and refresh token cookies. If rotation fails, it clears all auth cookies to initiate clean client logout.

#### Proposed Code:
```typescript
import { NextResponse } from "next/server";
import { getRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return NextResponse.json({ message: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const backendUrl = process.env.NESTJS_API_URL;
    if (!backendUrl) {
      return NextResponse.json({ message: "Backend URL tidak dikonfigurasi" }, { status: 500 });
    }

    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken, refresh_token: refreshToken }),
    });

    if (!response.ok) {
      await clearAuthCookies();
      return NextResponse.json({ message: "Sesi Anda telah kedaluwarsa" }, { status: 401 });
    }

    const data = await response.json();
    const newAccessToken = data.accessToken || data.access_token;
    const newRefreshToken = data.refreshToken || data.refresh_token;

    if (!newAccessToken || !newRefreshToken) {
      await clearAuthCookies();
      return NextResponse.json(
        { message: "Response perpanjangan sesi tidak valid" },
        { status: 502 }
      );
    }

    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BFF Refresh Error:", error);
    await clearAuthCookies();
    return NextResponse.json({ message: "Terjadi kesalahan internal perpanjangan sesi" }, { status: 500 });
  }
}
```

### Route 4: Get Profile (`app/api/auth/me/route.ts`)
Used on client layout load to fetch admin metadata for Zustand hydration.

#### Proposed Code:
```typescript
import { NextResponse } from "next/server";
import { getAccessToken, clearAuthCookies } from "@/lib/auth/cookies";

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ user: null, status: "guest" });
    }

    const backendUrl = process.env.NESTJS_API_URL;
    if (!backendUrl) {
      return NextResponse.json({ message: "Backend URL tidak dikonfigurasi" }, { status: 500 });
    }

    // Query profile endpoint to verify current status and role
    const response = await fetch(`${backendUrl}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ user: null, status: "guest" });
    }

    const user = await response.json();

    if (user.role !== "ADMIN") {
      await clearAuthCookies();
      return NextResponse.json({ user: null, status: "guest" }, { status: 403 });
    }

    return NextResponse.json({ user, status: "authenticated" });
  } catch (error) {
    console.error("BFF Auth Me Error:", error);
    return NextResponse.json({ user: null, status: "guest" });
  }
}
```

---

## 4. Wildcard BFF Proxy Route (`app/api/proxy/[...path]/route.ts`)

Intercepts all other client API requests (e.g. `/api/proxy/admin/stats`), appends the `access_token` cookie as a `Bearer` header, and passes them to `NESTJS_API_URL`.

### Proposed Code:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/cookies";

export async function generateStaticParams() {
  return [];
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const backendUrl = process.env.NESTJS_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: "Backend API URL not configured" },
        { status: 500 }
      );
    }

    const { path } = await params;
    const pathString = path.join("/");
    const url = new URL(request.url);
    const targetUrl = `${backendUrl}/${pathString}${url.search}`;

    const accessToken = await getAccessToken();

    const headers = new Headers();
    
    // Copy safe headers from request
    const headersToForward = ["content-type", "accept", "accept-language"];
    for (const headerName of headersToForward) {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let body: any = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await request.text();
      } else {
        body = await request.arrayBuffer();
      }
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const responseData = await response.json().catch(() => ({}));
      return NextResponse.json(responseData, { status: response.status });
    } else {
      const responseText = await response.text();
      return new NextResponse(responseText, {
        status: response.status,
        headers: {
          "content-type": contentType,
        },
      });
    }
  } catch (error) {
    console.error("BFF Proxy Error:", error);
    return NextResponse.json(
      { message: "Gagal menghubungkan ke server backend" },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
```

---

## 5. Route Protection (`middleware.ts`)

Restricts all admin dashboard paths and handles redirection logic based on the presence of the `access_token` cookie.

### Proposed Code:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has("access_token");

  const isAuthRoute = pathname.startsWith("/login");
  
  // Dashboard path routes to protect
  const isDashboardRoute =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/moderation") ||
    pathname.startsWith("/disputes") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/settings");

  // Root redirect
  if (pathname === "/") {
    if (hasAccessToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 1. Guard dashboard routes
  if (isDashboardRoute && !hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Prevent accessing login page when logged in
  if (isAuthRoute && hasAccessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ignore assets, favicon and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## 6. Main Dashboard Layout Shell

Implements the 248px sticky Sidebar and 62px backdrop-blur TopBar with custom badges, client-side active route highlighting, breadcrumbs, search placeholder, and dropdown systems.

### Zustand Session Hydrator Hook (`hooks/use-auth-hydration.ts`)
Ensures Zustand store is populated on first mount using `GET /api/auth/me`.

#### Proposed Code:
```typescript
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function useAuthHydration() {
  const { setUser, setStatus, status } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    async function hydrate() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setStatus("authenticated");
          } else {
            setUser(null);
            setStatus("guest");
            router.push("/login");
          }
        } else {
          setUser(null);
          setStatus("guest");
          router.push("/login");
        }
      } catch (err) {
        console.error("Hydration error:", err);
        setUser(null);
        setStatus("guest");
        router.push("/login");
      }
    }

    if (status === "loading") {
      hydrate();
    }
  }, [status, setUser, setStatus, router]);
}
```

### Dashboard Layout (`app/(dashboard)/layout.tsx`)
Fully typed client component including mobile navigation drawer toggling.

#### Proposed Code:
```typescript
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutGrid, 
  Users, 
  ShieldAlert, 
  Flag, 
  Wallet, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  Search,
  HelpCircle,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badgeKey?: "moderation" | "disputes" | "chat";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthHydration();
  const { user, status } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initial mockup badge counts
  const [badges] = useState({
    moderation: 8,
    disputes: 12,
    chat: 3,
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navGroups: NavGroup[] = [
    {
      label: "Umum",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      ],
    },
    {
      label: "Manajemen",
      items: [
        { id: "users", label: "Manajemen User", href: "/users", icon: Users },
        { id: "moderation", label: "Moderasi Konten", href: "/moderation", icon: ShieldAlert, badgeKey: "moderation" },
        { id: "disputes", label: "Dispute & Laporan", href: "/disputes", icon: Flag, badgeKey: "disputes" },
        { id: "transactions", label: "Transaksi & Escrow", href: "/transactions", icon: Wallet },
      ],
    },
    {
      label: "Komunikasi & Konten",
      items: [
        { id: "chat", label: "Live Chat", href: "/chat", icon: MessageSquare, badgeKey: "chat" },
        { id: "articles", label: "Artikel & Blog", href: "/articles", icon: FileText },
      ],
    },
    {
      label: "Sistem",
      items: [
        { id: "settings", label: "Profil & Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface-2">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="mt-2 text-sm text-ink-500 font-medium">Memuat session...</p>
        </div>
      </div>
    );
  }

  const getCrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part) => {
      const map: Record<string, string> = {
        dashboard: "Dashboard",
        users: "Manajemen User",
        moderation: "Moderasi Konten",
        disputes: "Dispute & Laporan",
        transactions: "Transaksi & Escrow",
        chat: "Live Chat",
        articles: "Artikel & Blog",
        settings: "Profil & Settings",
      };
      return map[part] || part;
    });
  };

  const getPageTitle = () => {
    const crumbs = getCrumbs();
    return crumbs[crumbs.length - 1] || "GARAPAN";
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header */}
      <div className="flex h-[62px] items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-extrabold text-lg select-none">
          G
        </div>
        <div>
          <div className="font-heading font-extrabold text-sm text-ink-900 leading-tight">
            GARAPAN
          </div>
          <div className="text-[11px] text-ink-400 font-medium leading-none mt-0.5">
            Admin Console
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              {group.label}
            </div>
            <div className="space-y-0.5 mt-2">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const badge = item.badgeKey ? badges[item.badgeKey] : null;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-155 group font-medium ${
                      isActive
                        ? "bg-brand-50 text-brand-600 font-semibold"
                        : "text-ink-700 hover:bg-surface-2 hover:text-ink-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`h-[18px] w-[18px] stroke-[1.75] ${
                          isActive ? "text-brand-500" : "text-ink-500 group-hover:text-ink-700"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {badge ? (
                      <span
                        className={`inline-flex min-w-[20px] h-5 items-center justify-center rounded-full text-[11px] font-bold px-1.5 ${
                          isActive
                            ? "bg-brand-100 text-brand-700"
                            : "bg-brand-500 text-white"
                        }`}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin footer info */}
      <div className="border-t border-border p-4 flex items-center justify-between bg-surface-2/40">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 bg-gradient-to-br from-orange-400 to-red-500 ring-2 ring-white">
            <AvatarFallback className="text-white text-xs font-bold bg-transparent">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900 truncate">
              {user?.name || "Administrator"}
            </div>
            <div className="text-[11.5px] text-ink-400 font-medium">
              Super Admin
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-ink-500 hover:bg-surface-3 hover:text-danger-700 transition-all shadow-sm"
          title="Keluar"
        >
          <LogOut className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );

  const crumbs = getCrumbs();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-2 text-ink-700 font-sans antialiased">
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-[248px] h-full flex-shrink-0 border-r border-border sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative flex w-[248px] flex-col h-full bg-white animate-in slide-in-from-left duration-200">
            <button
              className="absolute right-4 top-4 rounded-md p-1.5 border border-border text-ink-500 hover:bg-surface-2"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <header className="h-[62px] border-b border-border bg-white/88 backdrop-blur-md sticky top-0 z-40 px-4 md:px-[28px] flex items-center justify-between flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-2 rounded-lg border border-border text-ink-700 hover:bg-surface-2 flex-shrink-0"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 hidden sm:block">
              {crumbs.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-ink-400 select-none">
                  <span>GARAPAN</span>
                  {crumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-ink-300">/</span>
                      <span className={idx === crumbs.length - 1 ? "text-ink-500 font-semibold" : ""}>
                        {crumb}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
              <h2 className="font-heading font-bold text-base text-ink-900 leading-tight mt-0.5 tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-[520px] relative hidden lg:block">
            <Search className="absolute left-3.5 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
            <input
              placeholder="Cari user, transaksi, laporan..."
              className="w-full h-[38px] pl-10 pr-12 bg-surface-2 border border-border-strong rounded-lg text-[13.5px] placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-55 transition-all font-medium"
            />
            <span className="absolute right-3 top-2.5 px-1.5 py-0.5 rounded border border-border-strong bg-white text-[10px] font-bold text-ink-400 leading-none select-none pointer-events-none shadow-sm">
              ⌘K
            </span>
          </div>

          {/* TopBar Actions */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <button
              className="h-9 w-9 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-ink-700 transition-all"
              title="Bantuan"
            >
              <HelpCircle className="h-[18px] w-[18px] stroke-[1.75]" />
            </button>

            {/* Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-9 w-9 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-ink-700 transition-all relative"
                  title="Notifikasi"
                >
                  <Bell className="h-[18px] w-[18px] stroke-[1.75]" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[340px] p-0 rounded-xl shadow-sh-3 border-border bg-white">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-ink-900">Notifikasi</span>
                  <button className="text-xs font-semibold text-brand-600 hover:underline">
                    Tandai dibaca
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                  {[
                    { id: 1, title: "Laporan Baru", desc: "Mahasiswa MH-0239 dilaporkan oleh Klien CL-0012", time: "5m lalu", initials: "LN", color: "from-red-400 to-red-600" },
                    { id: 2, title: "Pembayaran Escrow", desc: "Dana escrow Rp 2.500.000 untuk Pesanan #1289 diterima", time: "1j lalu", initials: "PE", color: "from-green-400 to-green-600" },
                    { id: 3, title: "Verifikasi Jasa", desc: "Jasa baru 'Web Portfolio React' memerlukan review", time: "3j lalu", initials: "VJ", color: "from-brand-400 to-brand-600" },
                  ].map((item) => (
                    <div key={item.id} className="p-3 flex gap-3 hover:bg-surface-2 transition-all cursor-pointer">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                        {item.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink-900 leading-tight">{item.title}</div>
                        <div className="text-[12px] text-ink-500 leading-snug mt-0.5 truncate">{item.desc}</div>
                        <div className="text-[10.5px] text-ink-400 mt-1 font-medium">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center text-xs font-semibold text-brand-600 border-t border-border hover:bg-surface-2 transition-all rounded-b-xl cursor-pointer">
                  Lihat semua notifikasi
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border hover:bg-surface-2 transition-all select-none">
                  <Avatar className="h-[26px] w-[26px] bg-gradient-to-br from-orange-400 to-red-500">
                    <AvatarFallback className="text-white text-[9.5px] font-bold bg-transparent">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] font-semibold text-ink-700 hidden sm:block max-w-[80px] truncate">
                    {user?.name?.split(" ")[0] || "Admin"}
                  </span>
                  <ChevronDown className="h-[14px] w-[14px] text-ink-400 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1 rounded-xl shadow-sh-3 border-border bg-white">
                <DropdownMenuLabel className="px-2.5 py-2">
                  <div className="text-xs font-semibold text-ink-900 leading-none">{user?.name}</div>
                  <div className="text-[10px] text-ink-400 font-medium leading-none mt-1">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="rounded-lg text-sm text-ink-700 hover:bg-surface-2" onClick={() => router.push("/settings")}>
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg text-sm text-ink-700 hover:bg-surface-2" onClick={() => router.push("/settings")}>
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="rounded-lg text-sm text-danger-700 hover:bg-danger-50 focus:text-danger-700" onClick={handleLogout}>
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-[28px] py-6 md:py-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## 7. Login Page

The login screen comprises a split 50/50 dashboard hero panel and an validation-controlled credential form using React Hook Form + Zod.

### Zod Form Schema (`lib/validators/auth.ts`)
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### Login Page Component (`app/(auth)/login/page.tsx`)
```typescript
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth-store";
import { loginSchema, LoginInput } from "@/lib/validators/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Email atau password salah");
      }

      toast.success("Berhasil masuk ke dashboard");
      setUser(result.user);
      setStatus("authenticated");
      router.push(callbackUrl);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal masuk ke dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left Panel - Hero */}
      <div className="relative bg-[radial-gradient(120%_80%_at_0%_0%,var(--brand-400)_0%,var(--brand-600)_40%,var(--brand-800)_100%)] text-white p-12 md:p-[48px_56px] flex flex-col justify-between overflow-hidden">
        {/* Header Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white font-extrabold text-lg shadow-sm border border-brand-300/30">
            G
          </div>
          <div>
            <div className="font-heading font-extrabold text-lg tracking-tight">GARAPAN</div>
            <div className="text-[11px] opacity-70 font-medium">Admin Console · v2.4</div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="mt-auto mb-auto md:mb-0 md:mt-auto relative z-10 space-y-4">
          <div className="text-[11.5px] font-bold tracking-widest text-brand-100 uppercase select-none">
            Panel Administrator
          </div>
          <h1 className="font-heading text-3xl md:text-[38px] font-extrabold leading-[1.1] tracking-tight text-white max-w-[480px]">
            Kelola marketplace freelancer mahasiswa IT dengan satu dashboard.
          </h1>
          <p className="text-[14.5px] leading-relaxed opacity-80 max-w-[450px]">
            Verifikasi akun, moderasi jasa, pantau transaksi escrow, dan selesaikan dispute — semuanya dari satu tempat.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 mt-8">
            {[
              { val: "12.4K", label: "Mahasiswa aktif" },
              { val: "3.8K", label: "Klien terverifikasi" },
              { val: "Rp 4.2M", label: "Transaksi / bulan" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="font-heading font-extrabold text-xl md:text-2xl tracking-tight text-white">
                  {stat.val}
                </div>
                <div className="text-[11.5px] opacity-70 mt-1 font-medium leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SVG Decorative Circles */}
        <svg
          className="absolute -right-20 -top-20 opacity-[0.14] pointer-events-none select-none"
          width="520"
          height="520"
          viewBox="0 0 520 520"
        >
          <circle cx="260" cy="260" r="258" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="200" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="140" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="80" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* Footer Copyright */}
        <div className="absolute left-14 bottom-8 text-[11px] opacity-50 font-medium hidden md:block">
          © 2026 GARAPAN. Hanya untuk akses internal.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-[400px]">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink-900">
            Masuk ke akun Admin
          </h2>
          <p className="text-sm text-ink-500 mt-2">
            Gunakan email kantor dan password yang diberikan oleh Super Admin.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-[18px] w-[18px] text-ink-400" />
                <input
                  type="email"
                  placeholder="admin@garapan.test"
                  {...register("email")}
                  className={`w-full h-11 pl-10 pr-4 bg-white border rounded-lg text-sm placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium ${
                    errors.email ? "border-danger-500 focus:ring-danger-50" : "border-border-strong"
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-danger-700">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-semibold text-ink-700">Password</label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Silakan hubungi tim IT Super Admin untuk mereset password Anda.");
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline"
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-[18px] w-[18px] text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full h-11 pl-10 pr-24 bg-white border rounded-lg text-sm placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium ${
                    errors.password ? "border-danger-500 focus:ring-danger-50" : "border-border-strong"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2 px-2.5 py-1 bg-surface-3 hover:bg-surface-3/80 border-0 rounded text-[11px] font-bold text-ink-700 cursor-pointer select-none transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-danger-700">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="rememberMe"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-border-strong text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                disabled={isLoading}
              />
              <label
                htmlFor="rememberMe"
                className="text-xs font-medium text-ink-700 cursor-pointer select-none"
              >
                Ingat saya di perangkat ini selama 7 hari
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Masuk..." : "Masuk ke Dashboard"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>

            {/* SSO Deactivation Notice */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-[1px] bg-border" />
              <span className="text-[10px] font-bold text-ink-400 tracking-wider">ATAU</span>
              <div className="flex-1 h-[1px] bg-border" />
            </div>

            <button
              type="button"
              disabled
              className="w-full h-11 bg-surface-2 border border-border text-ink-400 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
              title="Google SSO dinonaktifkan demi keamanan panel admin"
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.2-5.2l-6.1-5.2c-2 1.4-4.5 2.4-7.1 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.1 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.1 5.2c-.4.4 6.7-4.9 6.7-14.6 0-1.3-.1-2.3-.4-3.5z" />
              </svg>
              Masuk dengan Google Workspace
            </button>
            <p className="text-[11px] text-center text-ink-400 font-medium">
              SSO dinonaktifkan untuk membatasi akses ke admin terverifikasi secara internal.
            </p>
          </form>

          <p className="text-center text-[11px] text-ink-400 mt-8 font-medium">
            Akses dibatasi untuk admin terdaftar. Semua aktivitas dicatat dalam audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
```
