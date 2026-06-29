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

components/ui/            # shadcn (do not edit manually)
components/layout/        # Sidebar, TopBar, Shell
components/data-table/    # shared DataTable
components/charts/

lib/api/                  # typed clients → /api/proxy only
lib/auth/                 # server-only cookie helpers
lib/validators/           # Zod schemas
store/auth-store.ts
proxy.ts                  # route protection (Next.js 16 `proxy`, formerly `middleware`)
```

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

Seed admin: `admin@garapan.test` (local dev seed). The password is **not** documented here — it is read from `SEED_ADMIN_PASSWORD` in the backend (see `backend/prisma/seed.ts`); ask the team for local credentials. **Rotate the deployed admin password before any public release** — a previously committed default is still recoverable from git history, so rotation (not just deletion) is the real fix.

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
5. **shadcn/ui only** — no other UI libraries.
6. Match design handoff layout/tokens; wire **real API data** (not `src/data.jsx` dummy data).
7. Read ADRs before changing auth, scope, or API assumptions.

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
