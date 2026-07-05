# Wave 1 (Foundation) Analysis & Implementation Plan

This document provides a comprehensive, read-only analysis and concrete implementation strategy for **Wave 1 (Foundation)** of the GARAPAN Admin Panel frontend. 

It covers theme token checks, BFF authentication routing, wildcard proxying, route protection, layout shell components, and login page wiring, complete with full, ready-to-implement code proposals designed for Next.js 15+ App Router, TanStack Query, Zustand, and shadcn/ui.

---

## 1. Scaffold Integration & Design Token Audit

### Current Status
- **Next.js & React version:** Next.js `16.2.9` / React `19.2.4` (defined in `package.json`).
- **Tailwind Version:** Tailwind CSS v4 (`tailwindcss: "^4"`, `@tailwindcss/postcss: "^4"`).
- **Styling Architecture:** Custom CSS variables are defined inside `:root` in `app/globals.css`, and mapped inside `@theme inline` for Tailwind.

### Design Token Reconcile
A gap audit was performed between `design_handoff_skillmahasiswa_admin/README.md` and the existing `app/globals.css`. 

1. **Colors:** Mapped correctly (Brand, Ink, Surface, Feedback groups).
2. **Typography:** Font families (`Inter`, `Plus Jakarta Sans`, `JetBrains Mono`) are set up via Next.js Google Fonts and variables. Font scale mappings match.
3. **Spacing:** Standard spacing utilities are active.
4. **Border Radius:** Mapped correctly (`--radius-sm`, `--radius-md`, `--radius-lg` at 10px, `--radius-xl` at 14px).
5. **Shadows (Gap Found):** The design handoff outlines 3 specific shadows (`--sh-1`, `--sh-2`, `--sh-3`) which are **not** currently declared inside the Tailwind `@theme` configuration.

### Solution / Recommendation
Add the custom shadow tokens directly inside the `@theme inline` block in `app/globals.css` to allow classes like `shadow-sh1`, `shadow-sh2`, and `shadow-sh3` to be used in Tailwind v4:

```css
/* Add inside @theme inline in app/globals.css */
  --shadow-sh1: 0 1px 2px rgba(15, 23, 41, 0.04), 0 1px 3px rgba(15, 23, 41, 0.04);
  --shadow-sh2: 0 4px 12px rgba(15, 23, 41, 0.06), 0 2px 4px rgba(15, 23, 41, 0.04);
  --shadow-sh3: 0 20px 40px -12px rgba(15, 23, 41, 0.18), 0 8px 16px rgba(15, 23, 41, 0.06);
```

---

## 2. BFF Authentication Architecture & Session Management

The NestJS backend generates JWT tokens in response payloads (`accessToken` and `refreshToken`). Storing these in `localStorage` or `sessionStorage` in client browsers is vulnerable to XSS.

**Proposed BFF Pattern:**
- A Next.js BFF (Route Handlers) acts as a gateway on the admin domain.
- The BFF sets `httpOnly`, `Secure` (in production), `SameSite=Lax` cookies to manage sessions.
- Browser client components only communicate with BFF routes, never holding tokens.

### The Cookie Path Architectural Challenge
ADR 002 specifies scoping `refresh_token` to `Path=/api/auth` for security.
However, because Next.js `middleware.ts` runs on page requests like `/dashboard` (which does not start with `/api/auth`), **the browser will not send the refresh token to the middleware**. 
- If `access_token` (15m TTL) expires, `middleware.ts` will see no access token, cannot see the refresh token, and will redirect the user to `/login` during a page reload—forcing a logout every 15 minutes!

### Proposed Cookie Resolution
We recommend setting the `Path` for **both** `access_token` and `refresh_token` to `/` on the admin domain. Since both cookies are `httpOnly`, `Secure`, and `SameSite=Lax`, they remain highly protected from XSS and CSRF, while permitting the middleware to check for session presence.

Alternatively, if `Path=/api/auth` is strictly required, the login route must set a lightweight httpOnly session indicator cookie (e.g. `logged_in=true`) with `Path=/` and `Max-Age=604800` (7 days) that the middleware checks.

---

## 3. Wildcard BFF Proxy Route (`/api/proxy/[...path]`)

The client components call `/api/proxy/*` for all API calls. The proxy intercepts the call, reads the `access_token` from httpOnly cookies, appends it as `Authorization: Bearer <token>`, and forwards the request to the NestJS backend.

**Key Design Decisions:**
1. **Async Params Compatibility:** Next.js 15+ mandates that route params must be awaited: `const { path } = await params`.
2. **Body Stream Forwarding:** The proxy must handle payloads safely. Using `await request.arrayBuffer()` is highly robust because it supports JSON, raw text, and multipart uploads (crucial for Article CMS cover image uploads in Wave 3).
3. **Query String Preservation:** Reconstruct query params using `searchParams` to support table page filters.

---

## 4. Proposed Code Specifications

Below are the exact code implementations for the Wave 1 files.

### 4.1 Cookie Helper (`lib/auth/cookie-helper.ts`)
Creates standard helpers for setting and clearing secure httpOnly session cookies.

```typescript
import { cookies } from "next/headers";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  // Set access token cookie (15 minutes expiry)
  cookieStore.set("access_token", accessToken, {
    ...COOKIE_OPTIONS,
    path: "/",
    maxAge: 900, // 15 minutes
  });

  // Set refresh token cookie (7 days expiry)
  // Scoped to '/' to permit middleware to evaluate session status
  cookieStore.set("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS,
    path: "/",
    maxAge: 604800, // 7 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set("access_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("refresh_token", "", { maxAge: 0, path: "/" });
}
```

---

### 4.2 BFF Auth Routes

#### `app/api/auth/login/route.ts`
Proxies backend login, checks role authorization, sets secure cookies, and returns the profile.

```typescript
import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookie-helper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NESTJS_API_URL || "http://localhost:3000";
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Email atau password salah" },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // Enforce role === ADMIN
    if (data.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya Administrator yang dapat masuk." },
        { status: 403 }
      );
    }

    // Set secure cookies
    await setAuthCookies(data.accessToken, data.refreshToken);

    // Return profile only (tokens are omitted from response body)
    return NextResponse.json({
      user: data.user,
    });
  } catch (error) {
    console.error("Login BFF Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
```

#### `app/api/auth/logout/route.ts`
Invalidates refresh tokens on the backend (using the refresh token as Bearer auth) and clears client cookies.

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/auth/cookie-helper";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    const backendUrl = process.env.NESTJS_API_URL || "http://localhost:3000";
    
    if (refreshToken) {
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      }).catch((err) => {
        console.error("Failed to revoke token on backend logout:", err);
      });
    }

    await clearAuthCookies();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout BFF Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
```

#### `app/api/auth/refresh/route.ts`
Performs backend-driven token rotation and cookie updates when client requests fail with 401.

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth/cookie-helper";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Session expired" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NESTJS_API_URL || "http://localhost:3000";
    const res = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearAuthCookies();
      return NextResponse.json(
        { message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    const data = await res.json();
    await setAuthCookies(data.accessToken, data.refreshToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refresh BFF Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
```

#### `app/api/auth/me/route.ts`
Retrieves and validates the current active user profile on app load to hydrate Zustand.

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NESTJS_API_URL || "http://localhost:3000";
    const res = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: res.status }
      );
    }

    const user = await res.json();
    
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak" },
        { status: 403 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me BFF Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
```

---

### 4.3 Wildcard BFF Proxy Route (`app/api/proxy/[...path]/route.ts`)
Forwards requests downstream, injecting the Bearer access token on the fly.

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

async function handleProxy(request: Request, { path }: { path: string[] }) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendUrl = process.env.NESTJS_API_URL || "http://localhost:3000";
    const targetUrl = new URL(path.join("/"), backendUrl);
    
    // Retain query string params (important for paginated/filtered tables)
    const { searchParams } = new URL(request.url);
    targetUrl.search = searchParams.toString();

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");
    
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // Fetch supporting binary array buffers (e.g. image uploads)
    let body: ArrayBuffer | undefined = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body,
    });

    return new Response(response.body, {
      status: response.status,
      headers: new Headers(response.headers),
    });
  } catch (error) {
    console.error("Wildcard Proxy Error:", error);
    return NextResponse.json(
      { message: "Gagal menghubungkan ke backend API" },
      { status: 502 }
    );
  }
}
```

---

### 4.4 Route Protection (`middleware.ts`)
Guards private dashboard pages while handling auth redirects.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset =
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // Session verification (checking either token ensures validity during rotation)
  const isLogged = request.cookies.has("access_token") || request.cookies.has("refresh_token");

  // Root path routing
  if (pathname === "/") {
    return NextResponse.redirect(new URL(isLogged ? "/dashboard" : "/login", request.url));
  }

  // Dashboard page protection
  if (!isPublicPath && !isLogged) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent logged-in users from accessing login page
  if (isPublicPath && isLogged) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

### 4.5 Main Dashboard Layout Shell (`app/(dashboard)/layout.tsx`)
Constructs the responsive Sidebar + TopBar shell layout, hydrates the Zustand auth store, and handles initial skeleton loading state.

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status, setUser, setStatus } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("guest");
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to hydrate auth store:", err);
        setUser(null);
        setStatus("guest");
        router.push("/login");
      }
    };

    if (status === "loading") {
      hydrate();
    }
  }, [status, setUser, setStatus, router]);

  // Prevent flash of unauthenticated layout
  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen bg-background">
        <div className="hidden w-[248px] border-r bg-surface p-4 md:flex flex-col space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="mt-auto flex items-center gap-3 pt-4 border-t">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <header className="flex h-[64px] items-center justify-between border-b bg-surface px-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-60 rounded-full" />
          </header>
          <main className="flex-1 p-8 space-y-6 bg-surface-2">
            <Skeleton className="h-8 w-44" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-[138px]" />
              <Skeleton className="h-[138px]" />
              <Skeleton className="h-[138px]" />
              <Skeleton className="h-[138px]" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[248px] border-r-0">
          <SheetTitle className="sr-only">Navigasi Admin</SheetTitle>
          <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Header and Child Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

#### `components/layout/sidebar.tsx`
Sidebar component supporting grouped navigation and pending badges.

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Grid,
  Users,
  Shield,
  Flag,
  Wallet,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

type SidebarProps = {
  counts?: {
    moderation?: number;
    disputes?: number;
    chat?: number;
  };
  onCloseMobile?: () => void;
};

export function Sidebar({ counts, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, reset } = useAuthStore();

  const groups = [
    {
      label: "Umum",
      items: [
        { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: Grid },
      ],
    },
    {
      label: "Manajemen",
      items: [
        { id: "users", href: "/users", label: "Manajemen User", icon: Users },
        {
          id: "moderation",
          href: "/moderation",
          label: "Moderasi Konten",
          icon: Shield,
          badge: counts?.moderation,
        },
        {
          id: "disputes",
          href: "/disputes",
          label: "Dispute & Laporan",
          icon: Flag,
          badge: counts?.disputes,
        },
        { id: "transactions", href: "/transactions", label: "Transaksi & Escrow", icon: Wallet },
      ],
    },
    {
      label: "Komunikasi & Konten",
      items: [
        {
          id: "chat",
          href: "/chat",
          label: "Live Chat",
          icon: MessageSquare,
          badge: counts?.chat,
        },
        { id: "articles", href: "/articles", label: "Artikel & Blog", icon: FileText },
      ],
    },
    {
      label: "Sistem",
      items: [
        { id: "settings", href: "/settings", label: "Profil & Settings", icon: Settings },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        reset();
        toast.success("Berhasil keluar");
        router.push("/login");
      } else {
        toast.error("Gagal melakukan logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Terjadi kesalahan");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <aside className="flex h-full w-[248px] flex-col border-r border-border bg-surface text-ink-700">
      <div className="flex h-[64px] items-center gap-3 px-6 border-b border-border">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-gradient-to-br from-brand-500 to-brand-700 font-heading text-[18px] font-extrabold text-white animate-fade-in">
          G
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-[16px] font-extrabold text-ink-900 leading-none">
            GARAPAN
          </span>
          <span className="mt-1 text-[11px] text-ink-400 font-medium leading-none">
            Admin Console
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            <div className="px-3 text-[11.5px] font-semibold uppercase tracking-wider text-ink-400">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center justify-between rounded-[8px] px-3 py-2 text-[13.5px] font-medium transition-colors hover:bg-surface-3",
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-ink-700 hover:text-ink-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={cn(
                          "h-[18px] w-[18px]",
                          isActive ? "text-brand-700" : "text-ink-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span
                        className={cn(
                          "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                          isActive
                            ? "bg-brand-100 text-brand-700"
                            : "bg-brand-500 text-white"
                        )}
                      >
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

      <div className="flex items-center gap-3 border-t border-border p-4 bg-surface-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-heading text-[13.5px] font-bold text-brand-700">
          {user?.name ? getInitials(user.name) : "AD"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-[13px] font-semibold text-ink-900">
            {user?.name || "Admin"}
          </div>
          <div className="text-[11.5px] text-ink-400 truncate">
            {user?.role === "ADMIN" ? "Super Admin" : "Admin"}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-ink-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
          title="Keluar"
        >
          <LogOut className="h-[16px] w-[16px]" />
        </button>
      </div>
    </aside>
  );
}
```

---

#### `components/layout/topbar.tsx`
TopBar component supporting breadcrumbs, page titles, and notification dropdown.

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
} from "lucide-react";

type TopBarProps = {
  onOpenMobileSidebar: () => void;
};

export function TopBar({ onOpenMobileSidebar }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, reset } = useAuthStore();

  const [openNotif, setOpenNotif] = useState(false);
  const [openProf, setOpenProf] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenNotif(false);
        setOpenProf(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        reset();
        toast.success("Berhasil keluar");
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getPageInfo = () => {
    const segments = pathname.split("/").filter(Boolean);
    const primary = segments[0] || "dashboard";

    const titles: Record<string, { title: string; crumbs: string[] }> = {
      dashboard: { title: "Dashboard", crumbs: ["Beranda", "Dashboard"] },
      users: { title: "Manajemen User", crumbs: ["Beranda", "Manajemen User"] },
      moderation: { title: "Moderasi Konten", crumbs: ["Beranda", "Moderasi Konten"] },
      disputes: { title: "Dispute & Laporan", crumbs: ["Beranda", "Dispute & Laporan"] },
      transactions: { title: "Transaksi & Escrow", crumbs: ["Beranda", "Transaksi & Escrow"] },
      chat: { title: "Live Chat", crumbs: ["Beranda", "Live Chat"] },
      articles: { title: "Artikel & Blog", crumbs: ["Beranda", "Artikel & Blog"] },
      settings: { title: "Profil & Settings", crumbs: ["Beranda", "Profil & Settings"] },
    };

    return titles[primary] || { title: "Dashboard", crumbs: ["Beranda", "Dashboard"] };
  };

  const { title, crumbs } = getPageInfo();

  const notifications = [
    { title: "Laporan Baru", body: "Klien melaporkan pesanan #TRX-9481.", time: "5m" },
    { title: "Jasa Baru Diajukan", body: "Web Development: Landing Page Tailwind.", time: "12m" },
    { title: "Dispute Selesai", body: "Pencairan dana #TRX-9238 disetujui.", time: "1j" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header
      ref={ref}
      className="flex h-[64px] items-center justify-between border-b border-border bg-surface px-6 text-ink-900"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-border md:hidden hover:bg-surface-2"
          title="Menu"
        >
          <Menu className="h-5 w-5 text-ink-700" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5 text-[12px] text-ink-400 font-medium">
            {crumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" />}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
          <h2 className="font-heading text-[16px] font-bold tracking-tight text-ink-900 leading-tight">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative hidden max-w-[320px] flex-1 md:block">
        <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          placeholder="Cari user, transaksi, laporan..."
          className="h-[38px] w-full rounded-[8px] border border-border-strong bg-surface pl-10 pr-12 text-[13.5px] outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
        />
        <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-400 border border-border">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-3 text-ink-500 transition-colors"
          title="Bantuan"
        >
          <HelpCircle className="h-[20px] w-[20px]" />
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setOpenNotif(!openNotif);
              setOpenProf(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-3 text-ink-500 transition-colors"
            title="Notifikasi"
          >
            <Bell className="h-[20px] w-[20px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger-500 animate-pulse" />
          </button>

          {openNotif && (
            <div className="absolute right-0 top-11 z-50 w-[340px] rounded-[12px] border border-border bg-surface shadow-sh3 py-2 text-ink-700 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="font-heading text-[14px] font-bold text-ink-900">
                  Notifikasi
                </span>
                <button className="text-[12px] font-semibold text-brand-600 hover:text-brand-700">
                  Tandai dibaca
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="flex gap-3 p-3 hover:bg-surface-2 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-700">
                      {notif.title[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                        {notif.title}
                      </div>
                      <p className="mt-1 text-[12.5px] text-ink-500 leading-snug">
                        {notif.body}
                      </p>
                      <span className="mt-1 block text-[11px] text-ink-400">
                        {notif.time} yang lalu
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-2 text-center text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 cursor-pointer">
                Lihat semua notifikasi
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setOpenProf(!openProf);
              setOpenNotif(false);
            }}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 hover:bg-surface-2 transition-colors"
          >
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-brand-100 font-heading text-[11px] font-bold text-brand-700">
              {user?.name ? getInitials(user.name) : "AD"}
            </div>
            <span className="hidden text-[13px] font-medium text-ink-700 md:inline">
              {user?.name ? user.name.split(" ")[0] : "Admin"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
          </button>

          {openProf && (
            <div className="absolute right-0 top-11 z-50 w-[220px] rounded-[12px] border border-border bg-surface shadow-sh3 p-1.5 text-ink-700 animate-in fade-in slide-in-from-top-1 duration-150">
              <Link
                href="/settings"
                onClick={() => setOpenProf(false)}
                className="flex items-center gap-3 rounded-[8px] px-3 py-2 text-[13.5px] font-medium hover:bg-surface-3 transition-colors text-ink-750"
              >
                <User className="h-[16px] w-[16px] text-ink-400" />
                <span>Profil Saya</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpenProf(false)}
                className="flex items-center gap-3 rounded-[8px] px-3 py-2 text-[13.5px] font-medium hover:bg-surface-3 transition-colors text-ink-750"
              >
                <Settings className="h-[16px] w-[16px] text-ink-400" />
                <span>Pengaturan</span>
              </Link>
              <div className="my-1.5 border-t border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-[13.5px] font-medium text-danger-700 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="h-[16px] w-[16px] text-danger-500" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

### 4.6 Login Page (`app/(auth)/login/page.tsx`)
Zod-validated Login Form using React Hook Form, styled per the split hero panel mockup, containing mock statistics and using `GARAPAN` branding with *no Google SSO*.

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format alamat email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setStatus } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
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
      router.push(redirectPath);
    } catch (error: any) {
      toast.error(error.message || "Gagal masuk ke akun");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-surface animate-fade-in">
      {/* Left Column: Hero Brand Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[radial-gradient(120%_80%_at_0%_0%,var(--brand-400)_0%,var(--brand-600)_40%,var(--brand-800)_100%)] p-[48px_56px] text-white md:flex">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-gradient-to-br from-brand-500 to-brand-700 font-heading text-[18px] font-extrabold text-white">
            G
          </div>
          <div>
            <div className="font-heading text-[18px] font-extrabold leading-none">
              GARAPAN
            </div>
            <div className="mt-1 text-[12px] text-brand-100 opacity-70 leading-none">
              Admin Console · v2.4
            </div>
          </div>
        </div>

        {/* Hero Title & Platform stats */}
        <div className="relative z-10 my-auto pt-16">
          <span className="text-[13px] font-bold tracking-wider text-brand-200 uppercase">
            Panel Administrator
          </span>
          <h1 className="mt-3 font-heading text-[38px] font-extrabold leading-[1.1] tracking-tight text-white animate-slide-up">
            Kelola marketplace freelancer mahasiswa IT dengan satu dashboard.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-50 opacity-80 max-w-[460px]">
            Verifikasi akun, moderasi jasa, pantau transaksi escrow, dan selesaikan dispute — semuanya dari satu tempat.
          </p>

          <div className="mt-10 flex gap-10">
            {[
              { value: "12.4K", label: "Mahasiswa aktif" },
              { value: "3.8K", label: "Klien terverifikasi" },
              { value: "Rp 4.2M", label: "Transaksi / bulan" },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="font-heading text-[24px] font-extrabold leading-none text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="mt-2 text-[12.5px] text-brand-100 opacity-70 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SVG Decorative circles */}
        <svg
          className="absolute -right-20 -top-20 opacity-[0.14] select-none pointer-events-none"
          width="520"
          height="520"
          viewBox="0 0 520 520"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="260" cy="260" r="258" strokeWidth="1" />
          <circle cx="260" cy="260" r="200" strokeWidth="1" />
          <circle cx="260" cy="260" r="140" strokeWidth="1" />
          <circle cx="260" cy="260" r="80" strokeWidth="1" />
        </svg>

        <div className="text-[12px] text-brand-100 opacity-60">
          © 2026 GARAPAN. Hanya untuk akses internal.
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-[400px] space-y-8">
          <div>
            <h2 className="font-heading text-[26px] font-bold tracking-tight text-ink-900">
              Masuk ke akun Admin
            </h2>
            <p className="mt-1.5 text-[14px] text-ink-400">
              Gunakan email kantor dan password yang diberikan oleh Super Admin.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-semibold text-ink-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="name@garapan.test"
                  disabled={isLoading}
                  className="h-[44px] w-full rounded-[8px] border border-border-strong bg-surface pl-10 pr-4 text-[13.5px] outline-none transition-colors placeholder:text-ink-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
                />
              </div>
              {errors.email && (
                <p className="text-[12px] font-medium text-danger-700 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-semibold text-ink-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Fitur reset password didelegasikan ke Database / Super Admin.");
                  }}
                  className="text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="h-[44px] w-full rounded-[8px] border border-border-strong bg-surface pl-10 pr-28 text-[13.5px] outline-none transition-colors placeholder:text-ink-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 h-[26px] -translate-y-1/2 rounded bg-surface-3 px-3 text-[11.5px] font-semibold text-ink-500 hover:bg-border transition-colors border-none cursor-pointer"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {errors.password && (
                <p className="text-[12px] font-medium text-danger-700 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-1 pb-2">
              <input
                type="checkbox"
                id="rememberMe"
                {...register("rememberMe")}
                disabled={isLoading}
                className="h-4.5 w-4.5 rounded border-border-strong text-brand-500 focus:ring-brand-500"
              />
              <label
                htmlFor="rememberMe"
                className="text-[13px] text-ink-500 font-medium cursor-pointer select-none"
              >
                Ingat saya di perangkat ini selama 7 hari
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] bg-brand-500 text-[14px] font-semibold text-white shadow-sh1 transition-colors hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{isLoading ? "Memproses..." : "Masuk ke Dashboard"}</span>
              <ArrowRight className="h-[16px] w-[16px]" />
            </button>
          </form>

          {/* Footer Warning */}
          <p className="text-center text-[12px] text-ink-400 leading-normal">
            Akses dibatasi untuk admin terdaftar.
            <br />
            Semua aktivitas dicatat dalam audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Next Steps & Integration Plan

The Implementer should execute the following steps to construct the Wave 1 codebase:

1. **Verify Tailwind Configuration:** Ensure that the custom shadows (`shadow-sh1`, etc.) are declared in the `globals.css` `@theme` block.
2. **Install Dependencies:**
   Ensure `@hookform/resolvers`, `zod`, `react-hook-form`, `lucide-react`, and `sonner` are fully installed.
3. **Implement Cookie Helpers:** Write the helper functions in `lib/auth/cookie-helper.ts`.
4. **Scaffold BFF Endpoints:** Create `app/api/auth/login/route.ts`, `logout/route.ts`, `refresh/route.ts`, and `me/route.ts`.
5. **Create Wildcard Proxy:** Setup `app/api/proxy/[...path]/route.ts`.
6. **Apply Middleware:** Setup `middleware.ts` in the project root.
7. **Scaffold Shell Layout:** Create the layout components in `components/layout/sidebar.tsx` and `components/layout/topbar.tsx`, and construct `app/(dashboard)/layout.tsx`.
8. **Build Login Page:** Code the login form in `app/(auth)/login/page.tsx`.
9. **Verification:**
   - Run `pnpm dev` to verify compilations.
   - Access `http://localhost:3000/` and verify that the middleware correctly redirects unauthenticated traffic to `/login`.
   - Perform a mock authentication request to test token generation and the proxy's functionality.
