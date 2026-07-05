# Analysis & Implementation Plan — Wave 1 (Foundation)

This document provides a comprehensive read-only analysis and a concrete implementation strategy for the **Wave 1 (Foundation)** milestones of the **GARAPAN** Admin Panel. It outlines the codebase layout, design token alignment under Tailwind v4, BFF cookie-based authentication architecture, and provides exact code proposals for all required routes, layouts, and components.

---

## 1. Scaffold Integration & Design Tokens Verification

The admin workspace is scaffolded with **Next.js 16.2.9**, **React 19**, and **Tailwind CSS v4** (using `@tailwindcss/postcss`). 

### Tailwind v4 Configuration Assessment
Unlike Tailwind v3, Tailwind v4 does not use a `tailwind.config.js/ts` file. Instead, it relies on CSS-first configuration via `@theme` directives directly in the global styles.
- **File Checked**: `app/globals.css`
- **Observations**: 
  - Standard GARAPAN design tokens (colors, font variables, base states) are defined in `:root` and mapped under `@theme inline` (lines 7–71).
  - Semantic shadcn tokens are mapped to GARAPAN tokens (e.g., `--background` maps to `var(--surface-2)` which is `#F7F8FB`, and `--primary` maps to `var(--brand-500)` which is `#2047C9`).
  - Typography is integrated: `--font-sans` maps to `var(--font-sans)` (Inter) and `--font-heading` maps to `var(--font-display)` (Plus Jakarta Sans).

### Recommended Enhancements to `app/globals.css`
To support the hi-fidelity visual layout from the design handoff (particularly the login page hero gradient and custom shadows), we recommend adding the following custom classes and theme properties under `@theme inline` in `app/globals.css`:

```css
@theme inline {
  /* ... existing config ... */
  
  /* Add custom shadows from design handoff */
  --shadow-sh-1: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
  --shadow-sh-2: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.08);
  --shadow-sh-3: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.08);
  
  /* Add radial gradient utility for brand hero panel */
  --background-image-brand-hero: radial-gradient(120% 80% at 0% 0%, var(--brand-400) 0%, var(--brand-600) 40%, var(--brand-800) 100%);
}
```

---

## 2. BFF Authentication Routes

The admin uses a **Next.js BFF (Backend-For-Frontend)** architecture (ADR 002). The client calls BFF routes under `/api/auth/*` which proxy NestJS authentication endpoints and set secure, `httpOnly` cookies on the admin domain.

### Cookie Attributes (Production vs. Local)
- **`access_token`**: `httpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/`, `Max-Age=900` (15m).
- **`refresh_token`**: `httpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/api/auth`, `Max-Age=604800` (7d).
- **`has_session` (Session Indicator)**: `httpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/`, `Max-Age=604800` (7d). This cookie acts as a lightweight, non-sensitive session indicator that allows the middleware to determine if a session exists (since the actual `refresh_token` cookie is scoped only to `Path=/api/auth` and is not visible to the middleware on pages like `/dashboard`).

### Route 1: `POST /api/auth/login` (`app/api/auth/login/route.ts`)
Proxies NestJS `POST /auth/login`, validates that `role === 'ADMIN'`, and sets the httpOnly cookies.

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const nestApiUrl = process.env.NESTJS_API_URL || "http://localhost:3000";

    const response = await fetch(`${nestApiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Email atau password salah" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check role constraint (ADR 002 / ADR 001)
    if (data.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya Administrator yang dapat masuk." },
        { status: 403 }
      );
    }

    // Check for OTP flow (2FA is deferred in v1)
    if (data.requiresTwoFactor) {
      return NextResponse.json(
        { message: "Autentikasi dua faktor belum didukung pada versi ini." },
        { status: 403 }
      );
    }

    const { access_token, refresh_token, user } = data;
    const isProduction = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();

    // Set httpOnly access_token cookie
    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 900, // 15 minutes
    });

    // Set httpOnly refresh_token cookie (scoped to /api/auth)
    cookieStore.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 604800, // 7 days
    });

    // Set a lightweight session indicator cookie visible to middleware on all paths
    cookieStore.set("has_session", "true", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 604800, // 7 days
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login BFF error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
```

### Route 2: `POST /api/auth/logout` (`app/api/auth/logout/route.ts`)
Clears the session cookies and calls NestJS logout if required.

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const nestApiUrl = process.env.NESTJS_API_URL || "http://localhost:3000";
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // Call NestJS backend to revoke token/session
    if (refreshToken) {
      await fetch(`${nestApiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshToken}`,
        },
      }).catch((err) => console.error("NestJS logout error:", err));
    }

    // Clear all BFF cookies
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("has_session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout BFF error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

### Route 3: `POST /api/auth/refresh` (`app/api/auth/refresh/route.ts`)
Rotates access/refresh tokens. Scoped under `/api/auth` so the browser automatically attaches the `refresh_token` cookie.

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const nestApiUrl = process.env.NESTJS_API_URL || "http://localhost:3000";

    const response = await fetch(`${nestApiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      // If refresh fails on NestJS, clear session
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      cookieStore.delete("has_session");
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    const data = await response.json();
    const { access_token, refresh_token } = data;
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 900,
    });

    if (refresh_token) {
      cookieStore.set("refresh_token", refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/api/auth",
        maxAge: 604800,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refresh BFF error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
```

### Route 4: `GET /api/auth/me` (`app/api/auth/me/route.ts`)
Hydrates the client Zustand auth store by verifying the token and fetching user data.

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const nestApiUrl = process.env.NESTJS_API_URL || "http://localhost:3000";

    // Call NestJS me/profile endpoint
    const response = await fetch(`${nestApiUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const user = await response.json();
    
    // Ensure user has admin privileges
    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me BFF error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
```

---

## 3. Wildcard BFF Proxy Route (`app/api/proxy/[...path]/route.ts`)

A catch-all route that proxies standard client API requests to the NestJS backend, appending the `access_token` as a Bearer header.

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = path.join("/");
    
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : "";

    const nestApiUrl = process.env.NESTJS_API_URL || "http://localhost:3000";
    const targetUrl = `${nestApiUrl}/${subpath}${queryString}`;

    // Read accessToken cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    // Prepare headers to forward
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Omit host, cookie, and other local headers
      if (!["host", "cookie", "connection", "content-length"].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Attach Bearer token from cookie
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // Read body content for mutation requests
    let body: any = undefined;
    if (!["GET", "HEAD"].includes(request.method)) {
      body = await request.arrayBuffer();
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // duplex is required by node-fetch/undici when body is a stream/arraybuffer
      duplex: body ? "half" : undefined,
    } as any);

    // Prepare proxy response
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Prevent security and compression issues on forward
      if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Koneksi ke backend gagal." },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
```

---

## 4. Route Protection (`middleware.ts`)

Middleware intercepts all traffic to guard the `(dashboard)/*` subfolder and `/login`. It verifies if either the `access_token` or the `has_session` cookie is present.

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const isDashboardRoute = pathname.startsWith("/dashboard") || 
                           pathname === "/" ||
                           pathname === "/users" ||
                           pathname === "/moderation" ||
                           pathname === "/disputes" ||
                           pathname === "/transactions" ||
                           pathname === "/chat" ||
                           pathname === "/articles" ||
                           pathname === "/settings";

  // Public authentication page
  const isLoginRoute = pathname === "/login";

  // Check credentials
  const hasAccessToken = request.cookies.has("access_token");
  const hasSessionIndicator = request.cookies.has("has_session");
  const isAuthenticated = hasAccessToken || hasSessionIndicator;

  // 1. Guard Dashboard: Redirect to /login if unauthenticated
  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Preserves the original destination for post-login redirect
    if (pathname !== "/" && pathname !== "/dashboard") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Guard Login: Redirect to /dashboard if already authenticated
  if (isLoginRoute && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Root fallback: Redirect authenticated users to /dashboard
  if (pathname === "/" && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Matches all routes except static assets, media, and API routes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|admin.html).*)",
  ],
};
```

---

## 5. Main Dashboard Layout Shell (`app/(dashboard)/layout.tsx`)

The dashboard layout provides the shell comprising the Sidebar, TopBar, and Client Hydration wrapper.

### Sub-component: `components/layout/sidebar.tsx`
Handles navigation, badge indicators for moderation/disputes/chat, and the admin profile summary with logout action.

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Flag, 
  Wallet, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SidebarProps {
  counts?: {
    moderation?: number;
    disputes?: number;
    chat?: number;
  };
}

export function Sidebar({ counts }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, reset } = useAuthStore();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      reset();
      router.push("/login");
      toast.success("Berhasil keluar.");
    } catch {
      toast.error("Gagal melakukan logout.");
    }
  };

  const navGroups = [
    {
      label: "Umum",
      items: [
        { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Manajemen",
      items: [
        { id: "users", label: "Manajemen User", path: "/users", icon: Users },
        { id: "moderation", label: "Moderasi Konten", path: "/moderation", icon: ShieldAlert, badge: counts?.moderation },
        { id: "disputes", label: "Dispute & Laporan", path: "/disputes", icon: Flag, badge: counts?.disputes },
        { id: "transactions", label: "Transaksi & Escrow", path: "/transactions", icon: Wallet },
      ],
    },
    {
      label: "Komunikasi & Konten",
      items: [
        { id: "chat", label: "Live Chat", path: "/chat", icon: MessageSquare, badge: counts?.chat },
        { id: "articles", label: "Artikel & Blog", path: "/articles", icon: FileText },
      ],
    },
    {
      label: "Sistem",
      items: [
        { id: "settings", label: "Profil & Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[248px] flex-col border-r border-border bg-card">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex size-[34px] items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 font-heading text-sm font-extrabold text-white">
          G
        </div>
        <div>
          <div className="font-heading text-sm font-extrabold text-ink-900 leading-tight">
            GARAPAN
          </div>
          <div className="text-[10px] text-ink-400 font-semibold tracking-wider uppercase leading-tight">
            Admin Console
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <h4 className="px-3 text-[10.5px] font-bold tracking-wider text-ink-400 uppercase">
              {group.label}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150 hover:bg-surface-3 hover:text-ink-900",
                      isActive 
                        ? "bg-brand-50 font-semibold text-brand-600 dark:bg-brand-900/20" 
                        : "text-ink-700"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("size-4 shrink-0", isActive ? "text-brand-500" : "text-ink-400")} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                        isActive 
                          ? "bg-brand-500 text-white" 
                          : "bg-danger-50 text-danger-700"
                      )}>
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="flex items-center gap-3 border-t border-border p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-100 font-heading text-xs font-bold text-brand-700">
          {user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "AD"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-xs font-bold text-ink-900 leading-tight">
            {user?.name || "Administrator"}
          </div>
          <div className="text-[11px] text-ink-400 leading-none mt-0.5">
            Admin Utama
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={handleLogout}
          title="Keluar"
          className="text-ink-400 hover:text-danger-500 hover:bg-danger-50 shrink-0"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
```

### Sub-component: `components/layout/topbar.tsx`
Displays page contextual breadcrumbs, a styled mock search input (deferred search behavior), and notification/profile quick menus.

```tsx
"use client";

import { Bell, ChevronDown, ChevronRight, HelpCircle, Search, User, Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  crumbs?: string[];
}

export function TopBar({ title, crumbs }: TopBarProps) {
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, reset } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    reset();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 right-0 z-10 flex h-16 w-[calc(100%-248px)] items-center justify-between border-b border-border bg-card px-8">
      {/* Title & Breadcrumbs */}
      <div>
        {crumbs && crumbs.length > 0 && (
          <div className="flex items-center gap-1 text-[11.5px] text-ink-400 font-medium">
            {crumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight className="size-3 text-ink-300" />}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="font-heading text-base font-bold text-ink-900 leading-tight">
          {title}
        </h1>
      </div>

      {/* Actions Panel */}
      <div className="flex items-center gap-6">
        {/* Mock Search Bar (⌘K shortcut styling per Handoff) */}
        <div className="relative flex w-64 items-center">
          <Search className="absolute left-3 size-4 text-ink-400" />
          <input 
            type="text" 
            placeholder="Cari user, transaksi, laporan..." 
            className="h-8 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-12 text-xs text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-brand-400 focus:bg-card"
          />
          <kbd className="absolute right-3 hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-card px-1.5 font-mono text-[9px] font-medium text-ink-400 shadow-sm sm:flex">
            ⌘K
          </kbd>
        </div>

        {/* Support Alert Link */}
        <button className="text-ink-400 hover:text-brand-500 transition-colors" title="Bantuan">
          <HelpCircle className="size-5" />
        </button>

        {/* Notifications Alert Bell */}
        <div className="relative">
          <button className="relative text-ink-400 hover:text-brand-500 transition-colors" title="Notifikasi">
            <Bell className="size-5" />
            <span className="absolute top-0 right-0.5 size-2 rounded-full bg-brand-500 ring-2 ring-card" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* User Dropdown Profile Box */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setOpenProfile(!openProfile)} 
            className="flex items-center gap-2.5 rounded-full hover:bg-surface-3 p-1 transition-colors"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-brand-100 font-heading text-xs font-bold text-brand-700">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "AD"}
            </div>
            <span className="text-xs font-bold text-ink-900 hidden sm:inline-block">
              {user?.name ? user.name.split(" ")[0] : "Admin"}
            </span>
            <ChevronDown className="size-3.5 text-ink-400" />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card p-1 shadow-sh-3 z-50">
              <Link 
                href="/settings" 
                onClick={() => setOpenProfile(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink-700 hover:bg-surface-2 hover:text-ink-900 transition-colors"
              >
                <User className="size-4 text-ink-400" />
                Profil Saya
              </Link>
              <Link 
                href="/settings" 
                onClick={() => setOpenProfile(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink-700 hover:bg-surface-2 hover:text-ink-900 transition-colors"
              >
                <Settings className="size-4 text-ink-400" />
                Pengaturan
              </Link>
              <hr className="my-1 border-border" />
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-danger-700 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="size-4 text-danger-500" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Layout Wrapper File: `app/(dashboard)/layout.tsx`
Serves as the main layout containing Sidebar and TopBar, wrapped in a Hydration/Authentication status check to ensure layout stability.

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status, setUser, setStatus } = useAuthStore();

  // Call /api/auth/me BFF endpoint to hydrate user session (and verify if token is valid)
  const { data, error, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Unauthorized");
      return res.json() as Promise<{ user: any }>;
    },
    retry: false,
    staleTime: 300000, // cache for 5 minutes
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      setStatus("authenticated");
    } else if (error) {
      setStatus("guest");
      router.push("/login");
    }
  }, [data, error, setUser, setStatus, router]);

  // Loading indicator to prevent layout flash during initial session hydration
  if (isLoading || status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-4 bg-surface-2">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    );
  }

  // Derive dynamic breadcrumbs & title based on the active path
  // (In Wave 2, page-level headings will hook into context or paths)
  return (
    <div className="min-h-screen bg-surface-2 antialiased">
      <Sidebar />
      <div className="pl-[248px] pt-16">
        <TopBar title="Dashboard Utama" crumbs={["GARAPAN", "Umum", "Dashboard"]} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 6. Login Page (`app/(auth)/login/page.tsx`)

A desktop-first authentication screen built with **React Hook Form**, **Zod**, and **TanStack Query** (via `/api/auth/login`), implementing the precise look of the design handoff.

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().default(true),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setStatus } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@garapan.test", // Seed Admin default value for development
      password: "",
      rememberMe: true,
    },
  });

  const rememberMeValue = watch("rememberMe");

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email atau password salah");
      }

      setUser(data.user);
      setStatus("authenticated");
      toast.success("Login berhasil! Selamat datang kembali.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Koneksi ke server gagal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-card">
      {/* Left Column: Brand Hero Panel */}
      <div className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden text-white bg-brand-hero">
        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex size-[42px] items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-heading text-lg font-extrabold text-white">
            G
          </div>
          <div>
            <div className="font-heading text-lg font-extrabold tracking-wide">
              GARAPAN
            </div>
            <div className="text-xs opacity-70">Admin Console · v2.4</div>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="my-auto max-w-[460px] z-10 space-y-4">
          <span className="text-xs font-semibold tracking-widest uppercase opacity-75">
            Panel Administrator
          </span>
          <h1 className="font-heading text-[38px] font-extrabold leading-tight tracking-tight">
            Kelola marketplace freelancer mahasiswa IT dengan satu dashboard.
          </h1>
          <p className="text-sm leading-relaxed opacity-80">
            Verifikasi akun, moderasi jasa, pantau transaksi escrow, dan selesaikan dispute — semuanya dari satu tempat.
          </p>

          {/* Quick Metrics */}
          <div className="flex gap-8 pt-8 border-t border-white/10 mt-8">
            <div>
              <div className="font-heading text-2xl font-bold tracking-tight">12.4K</div>
              <div className="text-[12.5px] opacity-70 mt-0.5">Mahasiswa aktif</div>
            </div>
            <div>
              <div className="font-heading text-2xl font-bold tracking-tight">3.8K</div>
              <div className="text-[12.5px] opacity-70 mt-0.5">Klien terverifikasi</div>
            </div>
            <div>
              <div className="font-heading text-2xl font-bold tracking-tight">Rp 4.2M</div>
              <div className="text-[12.5px] opacity-70 mt-0.5">Transaksi / bulan</div>
            </div>
          </div>
        </div>

        {/* Decorative SVG Circles */}
        <svg
          className="absolute -right-20 -top-20 opacity-15 pointer-events-none select-none"
          width="520"
          height="520"
          viewBox="0 0 520 520"
        >
          <circle cx="260" cy="260" r="258" fill="none" stroke="#fff" strokeWidth="1" />
          <circle cx="260" cy="260" r="200" fill="none" stroke="#fff" strokeWidth="1" />
          <circle cx="260" cy="260" r="140" fill="none" stroke="#fff" strokeWidth="1" />
          <circle cx="260" cy="260" r="80" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>

        <div className="text-[12px] opacity-60 z-10">
          © 2026 GARAPAN. Hanya untuk akses internal.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          <div>
            <h2 className="font-heading text-[26px] font-bold tracking-tight text-ink-900">
              Masuk ke akun Admin
            </h2>
            <p className="text-sm text-ink-400 mt-2.5 leading-relaxed">
              Gunakan email kantor dan password yang diberikan oleh Super Admin.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-bold text-ink-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4.5 text-ink-400" />
                <Input
                  type="email"
                  placeholder="name@garapan.test"
                  {...register("email")}
                  className={`pl-10 h-10 ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-danger-700">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-bold text-ink-700">Password</label>
                <Link
                  href="#"
                  className="text-xs font-semibold text-brand-600 hover:underline"
                  onClick={() => toast.info("Hubungi Administrator Utama untuk reset password.")}
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4.5 text-ink-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`pl-10 pr-12 h-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-ink-400 hover:text-ink-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-danger-700">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 py-1">
              <Checkbox
                id="rememberMe"
                checked={rememberMeValue}
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
              />
              <label
                htmlFor="rememberMe"
                className="text-xs font-medium text-ink-500 select-none cursor-pointer"
              >
                Ingat saya di perangkat ini selama 7 hari
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-[14px] font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? "Memproses..." : "Masuk ke Dashboard"}
              {!isSubmitting && <ArrowRight className="size-4" />}
            </Button>
          </form>

          {/* Audit Log Footer Info */}
          <p className="text-center text-[12px] text-ink-400 leading-relaxed pt-4 border-t border-border">
            Akses dibatasi untuk admin terdaftar. Semua aktivitas dicatat dalam audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Verification & Operational Directives

### Local Environment Verification
To test the full Wave 1 functionality:
1. Ensure `.env.local` contains the proper URL bindings:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NESTJS_API_URL=http://localhost:3000
   ```
2. Start the development server using the verified package manager:
   ```bash
   pnpm dev
   ```
3. Open `http://localhost:3000/login` to confirm the login form loads correctly.
4. Try typing credentials and submitting.
   - Using email `admin@garapan.test` and password `Password123!` (Prisma seed admin credentials) will trigger the request flow.
   - Confirm cookies are correctly created in the DevTools Application Tab (`access_token` with `Path=/`, `refresh_token` with `Path=/api/auth`, and `has_session` with `Path=/`).
5. Confirm redirect to `/dashboard` occurs, and refreshing the page stays authenticated.
6. Verify `/dashboard` layout displays the shell structure (Sidebar left, TopBar header, content area styled with `var(--surface-2)` background color).
7. Test the "Keluar" (Logout) button: it must purge all three cookies, reset Zustand state, and trigger redirect back to `/login`.
8. Direct access checks:
   - Try navigating to `/dashboard` directly without logging in. The middleware must immediately redirect to `/login`.
   - Try navigating to `/login` directly while logged in. The middleware must redirect to `/dashboard`.
