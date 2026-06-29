# GARAPAN — Admin Panel (Next.js)

Internal ops console for the GARAPAN IT Freelancer Marketplace. **Production scope** — all 9 screens from the design handoff, wired to the NestJS backend. Not an MVP.

| Repo             | Path              | Role                                                |
| ---------------- | ----------------- | --------------------------------------------------- |
| **admin** (this) | `garapan/admin`   | Next.js admin panel → Vercel                        |
| **backend**      | `garapan/backend` | NestJS API → Railway                                |
| **mobile**       | `garapan/mobile`  | Kotlin Android app (Bearer JWT; unchanged by admin) |

---

## IMPORTANT: Read before writing code

1. `.docs/requirements/admin-requirements.md` — stack, routes, API patterns, build order
2. `../docs/superpowers/specs/2026-04-27-garapan-design.md` — full system design
3. `design_handoff_skillmahasiswa_admin/README.md` — visual/UX per screen
4. `.docs/adr/001-product-scope.md` — product decisions (single admin, ban-only, deferrals)
5. `.docs/adr/002-auth-bff.md` — httpOnly cookies + BFF Route Handlers
6. `.docs/glossary.md` — Pesanan, Laporan, Jasa, escrow labels, etc.
7. `.docs/specs/2026-06-29-design-system.md` — Design System (tokens + component kit)

Keep `design_handoff_skillmahasiswa_admin/admin.html` open in a browser when building UI.

---

## Design handoff (`design_handoff_skillmahasiswa_admin/`)

Hi-fidelity HTML/JSX prototype — **reference only**, not code to copy.

| When building…           | Read / open…                                        |
| ------------------------ | --------------------------------------------------- |
| Screen layout            | `src/page_*.jsx` + README section for that screen   |
| Sidebar, top bar, modals | `src/shell.jsx` → `components/layout/`              |
| Dashboard charts         | `src/charts.jsx` → Recharts in `components/charts/` |
| Design tokens            | README **Design Tokens** → `tailwind.config.ts`     |
| Interactions             | `admin.html`                                        |

**Branding:** UI shows **GARAPAN**. Handoff mockups say “SkillMahasiswa” — use GARAPAN for product name; keep the handoff visual system.

### Routes

| Next.js route   | Handoff file            |
| --------------- | ----------------------- |
| `/login`        | `page_login.jsx`        |
| `/dashboard`    | `page_dashboard.jsx`    |
| `/users`        | `page_users.jsx`        |
| `/moderation`   | `page_moderation.jsx`   |
| `/disputes`     | `page_disputes.jsx`     |
| `/transactions` | `page_transactions.jsx` |
| `/chat`         | `page_chat.jsx`         |
| `/articles`     | `page_articles.jsx`     |
| `/settings`     | `page_settings.jsx`     |

---

## Stack

| Layer           | Choice                                                           |
| --------------- | ---------------------------------------------------------------- |
| Framework       | **Next.js 15+** (App Router) + TypeScript                        |
| UI              | **shadcn/ui** + **Tailwind CSS** (handoff design tokens)         |
| Server state    | **TanStack Query v5**                                            |
| Tables          | **TanStack Table v8** → shared `DataTable`                       |
| Client state    | **Zustand** — auth UI only (`user`, `status`) — **never tokens** |
| Forms           | **React Hook Form** + **Zod**                                    |
| Charts          | **Recharts**                                                     |
| Icons           | **Lucide React**                                                 |
| Toasts          | **Sonner**                                                       |
| Auth            | httpOnly cookies via **Next.js BFF** → NestJS                    |
| Articles editor | **TipTap** (WYSIWYG → HTML in `Artikel.content`)                 |
| Deploy          | **Vercel** (admin) → **Railway** (API)                           |

---

## Project structure

```
app/
├── (auth)/login/
├── (dashboard)/          # layout: Sidebar + TopBar
│   ├── dashboard/ users/ moderation/ disputes/
│   ├── transactions/ chat/ articles/ settings/
└── api/
    ├── auth/             # login, logout, refresh, me
    └── proxy/[...path]/  # Bearer from cookie → NestJS

components/ui/            # shadcn primitives + design-system primitives (StatusPill, UserAvatar, IconButton, Field, EmptyState)
components/layout/        # Sidebar, TopBar, Shell
components/data-table/    # shared DataTable, Pagination, cell renderers
components/shared/        # page patterns (PageHeader, StatCard, FilterBar, SegmentedControl, SearchInput, Modal)
components/charts/        # Recharts wrappers (Wave 4)

lib/api/                  # typed clients → /api/proxy only
lib/auth/                 # server-only cookie helpers
lib/validators/           # Zod schemas
store/auth-store.ts
proxy.ts                  # route protection (Next.js 16 `proxy`, formerly `middleware`)
```

---

## Design System

The reusable component layer is the **GARAPAN Admin Design System**. Full spec: `.docs/specs/2026-06-29-design-system.md`. Visual source of truth: the design handoff **Component Inventory** + `src/shell.jsx`.

Layering — don't skip a layer or hardcode values:

```
Tokens (app/globals.css)  →  Primitives (components/ui)  →  Composites (components/data-table, components/shared)  →  Pages
```

**Tokens** live only in `app/globals.css`:

- Colors: `brand-*`, `ink-*`, `surface-*`, feedback `success/warn/danger/info-*` — used as Tailwind utilities (`bg-brand-500`, `text-success-700`).
- Gradients: tokens + `@utility` classes (`bg-hero-gradient`, `bg-brand-mark`, `bg-avatar-0..7`). Never write raw hex / `linear-gradient` in a component — add a token + `@utility` and reference it by name.

**Primitives** (`components/ui/`): `Button` (CVA — variants primary/secondary/success/danger/ghost/outline, sizes 38/32/26px), `StatusPill`, `UserAvatar`, `IconButton`, `Field`, `EmptyState`, plus the shadcn set.

**Composites:** `DataTable` + `Pagination` + cell renderers (`components/data-table/`); `PageHeader`, `StatCard`, `FilterBar`, `SegmentedControl`, `SearchInput`, `Modal` (`components/shared/`).

Conventions:

- Build on **shadcn/ui only**; extend via **CVA**, merge classes with `cn()`.
- Components are **presentational** — no data fetching inside (the page owns the query).
- Use **`StatusPill`** for every status label, **`DataTable`** for every list, **`Modal`** for every detail dialog, **`UserAvatar`** for every avatar.
- Reach for an existing kit component before writing bespoke markup; if a shared pattern appears twice, promote it into the kit.
- Out of v1: charts (`components/charts/`, Wave 4) and the article editor (Wave 3).

---

## Auth (summary)

Full spec: **ADR 002**.

- Client calls `/api/proxy/...` with `credentials: 'include'` — never `NESTJS_API_URL` directly.
- BFF proxies `POST /auth/login`, checks `role === ADMIN`, sets httpOnly cookies.
- Login: **email + password only** (no Google SSO). **No admin 2FA v1.**
- `proxy.ts` guards `(dashboard)/*`; missing cookie → `/login`.
- Mobile keeps Bearer JWT — do not change backend auth for mobile.

---

## Backend API (summary)

All admin endpoints are implemented on the NestJS backend: stats, users (list/detail/search/ban), orders, disputes (detail/filters/extended resolve), content, activity, skills/kategori, artikel (list/create/publish/unpublish/upload), analytics, admin me, and live-chat-admin (with unread/read tracking).

Seed admin: `admin@garapan.test` / `Password123!` (`backend/prisma/seed.ts`).

---

## Product decisions (summary)

Full spec: **ADR 001**.

- Single internal admin account; no invite / team RBAC v1.
- Users: ban only (no suspend); no NIM/Prodi; no bulk actions v1.
- Transactions page: **read-only**; resolve funds on Disputes only.
- Disputes: order-linked, text reason only (no evidence UI until mobile supports it).
- Moderation: existing content API v1; defer mark-safe / per-post counts.
- Live chat: support chat only (`live-chat-admin`); polling v1.
- UI copy: **Bahasa Indonesia**; IDR via `Intl.NumberFormat('id-ID')`.

---

## Rules

1. All list pages use shared **`DataTable`** — never one-off tables.
2. All API calls in **`lib/api/`** → `/api/proxy` — no fetch in page components.
3. Never store JWT in Zustand, `localStorage`, or `sessionStorage`.
4. Server state in **TanStack Query**; `invalidateQueries` after mutations.
5. **shadcn/ui only** — no other UI libraries. Use the **Design System** kit (see above); extend via CVA, don't hand-roll one-offs.
6. **Tokens, not raw values** — colors/gradients come from `app/globals.css` utilities; no raw hex in components.
7. Match design handoff layout/tokens; wire **real API data** (not `src/data.jsx` dummy data).
8. Read ADRs before changing auth, scope, or API assumptions.

---

## Environment variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NESTJS_API_URL=http://localhost:3000          # server-only — Route Handlers only
```

Production: set `NESTJS_API_URL` in Vercel (not `NEXT_PUBLIC_`). Client never calls NestJS directly.

---

## Build order

See `admin-requirements.md` — Waves 1–5: foundation → core ops → content/chat → dashboard/settings → polish.

Frontend can start Wave 1 (scaffold, auth BFF, shell, login) immediately; all backend endpoints are available.
