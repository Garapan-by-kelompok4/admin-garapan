# GARAPAN Admin Panel — Requirements

## Required reading (in order)

1. **This file** — stack, pages, API patterns, auth architecture
2. **`../../docs/superpowers/specs/2026-04-27-garapan-design.md`** — full system design
3. **`design_handoff_skillmahasiswa_admin/README.md`** — visual/UX source of truth for every screen
4. **`.docs/adr/`** — accepted decisions (product scope, auth BFF, API gaps)
5. **`.docs/glossary.md`** — domain terms (Pesanan, Laporan, Jasa, etc.)

Do not implement UI until items 1–3 are read. Check ADRs before making architectural choices.

---

## Overview

Production admin console for the **GARAPAN** IT Freelancer Marketplace. Used exclusively by **Admin** users to monitor the platform, moderate content, resolve disputes, manage escrow transactions, publish blog articles, and handle live support chat.

The mobile app (Kotlin) and this admin panel share the same **NestJS** backend on Railway. The admin is deployed separately on **Vercel**.

**Scope:** Full production build — all 9 screens from **`design_handoff_skillmahasiswa_admin`**, wired to real APIs. Not an MVP.

**Visual/UX authority:** Layout, spacing, colors, typography, component states, modals, and Bahasa Indonesia copy come from the design handoff. Backend requirements and API wiring come from this file and the system spec.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | **Next.js 15+** (App Router) + TypeScript |
| UI Components | **shadcn/ui** + **Tailwind CSS** (GARAPAN design tokens) |
| Server state | **TanStack Query v5** |
| Tables | **TanStack Table v8** inside shared `DataTable` |
| Client state | **Zustand** — auth *UI state only* (user profile, not tokens) |
| Forms | **React Hook Form** + **Zod** |
| Charts | **Recharts** (dashboard) |
| Icons | **Lucide React** |
| Toasts | **Sonner** (via shadcn) |
| Auth transport | **httpOnly cookies** via Next.js BFF Route Handlers |
| Package manager | **pnpm** (match backend: `pnpm@10.33.0`) |
| Hosting | **Vercel** (admin) → **Railway** (NestJS API) |

### Package manager

Use **pnpm** for all install, run, and add commands — same as `garapan/backend`. Do not use npm or yarn.

```bash
pnpm install
pnpm dev
pnpm build
```

Set `"packageManager": "pnpm@10.33.0"` in `package.json` when scaffolding. Use `pnpm dlx` for one-off CLIs (e.g. `shadcn` init).

### Why Next.js BFF for auth

The NestJS API uses JWT Bearer tokens in JSON responses (required by the Android app). Admin and API run on **different origins** (Vercel vs Railway), so the browser cannot safely store cross-origin cookies from NestJS directly.

**Pattern:** Next.js Route Handlers proxy auth to NestJS and set **httpOnly cookies on the admin domain**. Client components never see or store access/refresh tokens.

The mobile app continues using Bearer tokens — **no change to mobile auth**.

---

## Project Structure

```
admin/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + TopBar shell
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── moderation/page.tsx
│   │   ├── disputes/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── articles/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── refresh/route.ts
│       │   └── me/route.ts
│       └── proxy/[...path]/route.ts   # Attach Bearer from cookie → NestJS
│
├── components/
│   ├── ui/                         # shadcn/ui (do not edit manually)
│   ├── layout/                     # Sidebar, TopBar, Shell
│   ├── data-table/                 # Shared DataTable (TanStack Table)
│   └── charts/                     # Recharts wrappers
│
├── lib/
│   ├── api/                        # Typed API clients — call /api/proxy only
│   │   ├── users.ts
│   │   ├── orders.ts
│   │   ├── disputes.ts
│   │   ├── content.ts
│   │   ├── articles.ts
│   │   └── chat.ts
│   ├── auth/                       # Server-only cookie helpers
│   └── validators/                 # Zod schemas
│
├── hooks/                          # useDebounce, query key factories, etc.
├── store/
│   └── auth-store.ts               # Zustand: { user, status } — no tokens
└── middleware.ts                   # Redirect unauthenticated users
```

---

## Design handoff — `design_handoff_skillmahasiswa_admin/`

**Location:** `admin/design_handoff_skillmahasiswa_admin/` (repo root of the admin project)

This folder is the **hi-fidelity design reference** for the admin panel. It was produced as an interactive HTML/JSX prototype (branded “SkillMahasiswa” in the mockups). When implementing, use **GARAPAN** for product naming unless product decides otherwise — but keep the **visual system** from the handoff.

### What it is

- **High-fidelity prototypes** — final colors, typography, spacing, hover/active states, Indonesian dummy data
- **Not production code** — do not copy JSX into the Next.js app verbatim; rebuild with shadcn/ui, App Router, and TanStack patterns from this requirements doc

### How to use it during implementation

1. Open **`design_handoff_skillmahasiswa_admin/README.md`** for per-screen layout specs, design tokens, component inventory, and interaction rules
2. Open **`admin.html`** (or `SkillMahasiswa Admin Panel.html`) in a browser to click through all 9 screens
3. For a specific page, read the matching **`src/page_*.jsx`** file alongside building the Next.js route
4. Reuse **`src/shell.jsx`** as reference for Sidebar, TopBar, Modal, Pagination, StatusPill
5. Reuse **`src/charts.jsx`** as reference for dashboard chart layout (implement with Recharts in production)
6. Map CSS variables from the README **Design Tokens** section → `tailwind.config.ts` + global CSS

### Prototype file → Next.js route map

| Handoff file | Interactive route | Next.js page |
|---|---|---|
| `src/page_login.jsx` | `login` | `app/(auth)/login/page.tsx` |
| `src/page_dashboard.jsx` | `dashboard` | `app/(dashboard)/dashboard/page.tsx` |
| `src/page_users.jsx` | `users` | `app/(dashboard)/users/page.tsx` |
| `src/page_moderation.jsx` | `moderation` | `app/(dashboard)/moderation/page.tsx` |
| `src/page_disputes.jsx` | `disputes` | `app/(dashboard)/disputes/page.tsx` |
| `src/page_transactions.jsx` | `transactions` | `app/(dashboard)/transactions/page.tsx` |
| `src/page_chat.jsx` | `chat` | `app/(dashboard)/chat/page.tsx` |
| `src/page_articles.jsx` | `articles` | `app/(dashboard)/articles/page.tsx` |
| `src/page_settings.jsx` | `settings` | `app/(dashboard)/settings/page.tsx` |
| `src/shell.jsx` | — | `components/layout/` (Sidebar, TopBar, Modal, etc.) |
| `src/charts.jsx` | — | `components/charts/` |
| `src/data.jsx` | — | Reference only for column labels and ID formats; **replace with API data** |
| `src/icons.jsx` | — | Replace with **Lucide React** equivalents |

### Fidelity expectations

- **Layout & visual:** Match the handoff closely (sidebar 248px, top bar, card padding, table density, modals)
- **Copy:** Bahasa Indonesia; IDR via `Intl.NumberFormat('id-ID')`; Indonesian dates
- **Data:** Wire to NestJS APIs — prototype dummy data is not shipped to production
- **Interactions:** Modals, tabs, filters, and pagination behavior per README **Interactions & Behavior** — but use **server-side** pagination/filters where the API supports it

### Other files in the package

| File | Use |
|---|---|
| `admin.html` | Main clickable multi-page prototype |
| `SkillMahasiswa Admin Panel.html` | Offline bundle of the prototype |
| `SkillMahasiswa Admin Panel - Figma Export.html` | All pages stacked — useful for visual comparison |

---

## Pages & Features

Each page below lists **API wiring** (this doc). For **layout, components, and copy**, follow the matching section in `design_handoff_skillmahasiswa_admin/README.md` and `src/page_*.jsx`.

### Login (`/login`)
- Email + password form (React Hook Form + Zod)
- `POST /api/auth/login` → proxies NestJS `POST /auth/login`
- Reject non-`ADMIN` role before setting cookies
- On success: httpOnly cookies set by Route Handler; Zustand stores user profile; redirect to `/dashboard`
- Layout per design handoff (split hero panel + form)

### Dashboard (`/dashboard`)
- Stat cards, line chart, donut chart, recent activity, alerts panel
- Primary data: `GET /admin/stats` (via proxy)
- Charts/analytics may require `GET /admin/analytics` (backend extension)
- Activity feed: `GET /admin/activity`

### Users (`/users`)
- Tabs: Mahasiswa / Klien
- `DataTable`: search, status filter, server-side pagination
- Detail modal: profile, order history, laporan history
- `GET /admin/users`, `GET /admin/users/:id` (backend extension), `PATCH /admin/users/:id/ban`

### Moderation (`/moderation`)
- Summary stat cards + flagged content table
- Review modal with report reasons and actions
- `GET /admin/content`, `PATCH /admin/content/:id/remove`
- Richer per-post moderation may require backend v2

### Disputes (`/disputes`)
- Stat cards + filterable table
- Detail modal with resolution flow
- `GET /admin/disputes`, `PATCH /admin/disputes/:id/resolve` with `{ outcome: 'RELEASE' | 'REFUND' }`

### Transactions (`/transactions`)
- Escrow monitoring table + detail modal with timeline
- `GET /admin/orders`, `GET /admin/orders/:id`
- Read-only monitor; fund resolution stays on disputes page

### Live Chat (`/chat`)
- 3-column: session list, messages, user info sidebar
- Polling or WebSocket for new messages
- `GET /live-chat-admin`, `GET /live-chat-admin/:userId`, `POST /live-chat-admin/:userId`

### Articles (`/articles`)
- List view + editor view (toggle, not separate route)
- Create, edit, publish, unpublish, thumbnail upload
- `GET /admin/artikel` (backend extension), `POST /artikel`, `PATCH /artikel/:id`, `PATCH /artikel/:id/publish`, upload endpoint

### Settings (`/settings`)
- Sub-tabs: Informasi Profil, Keamanan, Notifikasi, Tim & Izin, Log Aktivitas
- `GET/PATCH /admin/me` (backend extension), `GET /admin/activity`
- Team/RBAC and notification prefs depend on backend scope decisions

---

## DataTable Component

All list pages use one shared `DataTable` built on **TanStack Table v8** + shadcn `Table`.

- Column definitions declared per page
- **Server-side** pagination, search, and filters (NestJS returns `{ data, total, page, limit }`)
- TanStack Query `keepPreviousData` to avoid flicker between pages
- Handles: loading skeleton, empty state, error state

```tsx
// Pattern: page owns columns + query; DataTable owns table UI
const { data, isPending } = useQuery({
  queryKey: ['admin', 'users', { page, search, role }],
  queryFn: () => usersApi.list({ page, search, role }),
  placeholderData: keepPreviousData,
})

<DataTable columns={userColumns} data={data?.data ?? []} total={data?.total} ... />
```

Do not build custom one-off tables per page.

---

## Sidebar Navigation

Per design handoff — grouped nav with badge counts for pending items:

```
Umum
  Dashboard

Manajemen
  Manajemen User
  Moderasi Konten      [badge]
  Dispute & Laporan    [badge]
  Transaksi & Escrow

Komunikasi & Konten
  Live Chat            [badge]
  Artikel & Blog

Sistem
  Profil & Settings
```

Active route highlighted. Use Next.js `Link` + `usePathname()`.

---

## Auth & Route Protection

### Middleware (`middleware.ts`)

- Protected: all `(dashboard)` routes
- Public: `/login`
- If no session cookie on protected route → redirect `/login`
- If session cookie on `/login` → redirect `/dashboard`

### BFF Route Handlers

| Route | Behavior |
|---|---|
| `POST /api/auth/login` | Proxy NestJS login → set `access_token` + `refresh_token` httpOnly cookies |
| `POST /api/auth/logout` | Clear cookies + revoke refresh on NestJS |
| `POST /api/auth/refresh` | Rotate tokens server-side, update cookies |
| `GET /api/auth/me` | Return admin user for Zustand hydration |
| `/api/proxy/[...path]` | Read access token from cookie → `Authorization: Bearer` → NestJS |

### Cookie settings (production)

```
access_token:  httpOnly, Secure, SameSite=Lax, Path=/, Max-Age=900 (15m)
refresh_token: httpOnly, Secure, SameSite=Lax, Path=/api/auth, Max-Age=604800 (7d)
```

### Zustand (`auth-store.ts`)

```ts
// Stores UI session only — never tokens
{ user: AdminUser | null, status: 'loading' | 'authenticated' | 'guest' }
```

### TanStack Query + 401 handling

- API client calls `/api/proxy/...` with `credentials: 'include'`
- On 401: call `/api/auth/refresh` → retry request once
- On refresh failure: clear session → redirect `/login`

---

## API Access Rules

1. **Client components** call `/api/proxy/...` or typed wrappers in `lib/api/` — never `NESTJS_API_URL` directly
2. **Route Handlers** call `NESTJS_API_URL` server-side only
3. All NestJS admin routes require `Role.ADMIN` (enforced by backend `RolesGuard`)
4. Mutations invalidate relevant TanStack Query keys on success

---

## Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NESTJS_API_URL=http://localhost:3000
```

```bash
# Vercel (production) — NESTJS_API_URL is server-only, not NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL=https://admin.yourdomain.com
NESTJS_API_URL=https://your-railway-backend.up.railway.app
```

---

## Backend Extensions Required

The NestJS admin module covers core operations. Production UI from the design handoff needs these additions (build in `backend/` in parallel):

| Endpoint / change | Purpose |
|---|---|
| `GET /admin/analytics` | Dashboard charts and period comparisons |
| `GET /admin/users/:id` | User detail modal |
| Extended user search | Search by name, university, company — not email only |
| `GET /admin/artikel` + unpublish + image upload | Full article CMS |
| `GET /admin/disputes?status=` | Filter disputes by status |
| Dispute resolution note | Optional `resolutionNote` on resolve |
| Richer `GET /admin/content` | Per-post report counts, mark-safe |
| Live chat thread enrichment | User profile + unread counts in `listThreads` |
| `GET/PATCH /admin/me` | Settings profile tab |
| CORS (production) | `credentials: true` + explicit admin origin if needed |

Mobile Bearer auth must remain unchanged.

---

## Build Order (production)

**Wave 1 — Foundation**
1. `pnpm create next-app@latest` + TypeScript + Tailwind + `pnpm dlx shadcn@latest init` with GARAPAN theme tokens
2. Auth BFF routes + middleware + Zustand auth store
3. Dashboard shell: `(dashboard)/layout.tsx` — Sidebar + TopBar per design handoff
4. Login page

**Wave 2 — Core operations**
5. Shared `DataTable` + TanStack Query setup
6. Users, Transactions, Disputes, Moderation

**Wave 3 — Content & support**
7. Live Chat (3-column + polling)
8. Articles (list + editor)

**Wave 4 — Intelligence & settings**
9. Dashboard charts + activity feed
10. Settings sub-tabs

**Wave 5 — Polish**
11. Sidebar badge counts, toasts, error boundaries, loading skeletons
12. E2E smoke tests (Playwright), Vercel env configuration

---

## Key Rules for Implementation

1. Read this file, the full system spec, and **`design_handoff_skillmahasiswa_admin/README.md`** before starting any page; open `admin.html` when implementing layout for that screen
2. All list pages use shared `DataTable` — never build a custom table per page
3. All API calls go through `lib/api/` → `/api/proxy` — no direct NestJS calls from client components
4. Never store access or refresh tokens in Zustand, localStorage, or sessionStorage
5. All `(dashboard)` routes protected by middleware + session cookie
6. Use shadcn/ui components only — do not install other UI libraries
7. Server state in TanStack Query; Zustand for auth UI state only
8. Forms use React Hook Form + Zod
9. Keep page components thin — data fetching in hooks/query functions, not inline in JSX
10. Match **`design_handoff_skillmahasiswa_admin`** layout and tokens; wire real API data (no permanent dummy data from `src/data.jsx`)
