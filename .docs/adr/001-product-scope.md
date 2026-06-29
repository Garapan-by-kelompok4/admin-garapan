# ADR 001: Admin product scope

**Status:** Accepted  
**Date:** 2026-06-26  
**Context:** Grilling session — admin dashboard production scope

## Decision

The GARAPAN admin panel is a **desktop-first internal ops console** for a **single admin account** with one shared **ADMIN** role. It implements all 9 screens from `design_handoff_skillmahasiswa_admin/`, wired to the NestJS backend.

### Branding & audience

- Product name in UI: **GARAPAN** (not SkillMahasiswa from the design prototype).
- Visual system (colors, layout, typography) follows the design handoff.
- UI copy: **Bahasa Indonesia**.
- Users: internal ops team only — no multi-role RBAC (Super Admin / Moderator / Finance) in v1.

### Admin accounts

- **One admin account** for v1 — no invite-admin or team management flows.
- Seed admin: `admin@garapan.test` (`backend/prisma/seed.ts`).
- Admin creation: manual seed / DB only.

### Login

- **Email + password only** — no Google SSO on admin login.
- Non-`ADMIN` roles rejected at BFF before session cookies are set.

### Users (`/users`)

- **Ban only** via `PATCH /admin/users/:id/ban` — no softer “suspend” state.
- Status mapping in UI:
  - **Pending** → `emailVerified === false`
  - **Aktif** → verified and not banned
  - **Suspended** → `bannedAt != null`
- **Drop NIM & Prodi** columns — not in Prisma or mobile registration.
- Show: `fullName`, `university`, `rating`, email, join date.
- User detail modal v1: **read-only** profile + last 5 orders + laporan count; ban action stays on table row.
- **No bulk actions** v1 — hide or disable row checkboxes.

### Transactions (`/transactions`)

- **Read-only** escrow monitor — no release/refund from this page.
- Fund resolution only via **Disputes** (`PATCH /admin/disputes/:id/resolve`).
- Escrow pill mapping:
  - **Ditahan** → paid, not settled (`IN_PROGRESS` / `DELIVERED` / `DISPUTED` + payment SUCCESS)
  - **Dicairkan** → `COMPLETED` + wallet CREDIT
  - **Refund** → dispute REFUND or `CANCELLED` + REFUND ledger
- Dashboard revenue label: **“Total Pendapatan Selesai”** — no 8% platform commission (not in backend).
- Midtrans is **sandbox** v1 — show `Pembayaran.status`; no special admin Midtrans workflow.

### Disputes (`/disputes`)

- All disputes are **order-linked** (`pesananId` required) — matches mobile `POST /laporan`.
- Mobile submits **text reason only** — no evidence upload; **hide evidence UI** in admin until mobile + API support files.
- Backend supports richer resolution outcomes (RELEASE, REFUND, PARTIAL_REFUND, REJECT) with `resolutionNote`.
- Priority in UI: **derived** (age + order amount), not a DB field v1.

### Moderation (`/moderation`)

- v1 uses existing `GET /admin/content` (listings from users with pending laporan).
- Actions: **remove** (soft-delete jasa/project) + link to dispute.
- Defer per-post report counts and “mark safe” until backend v2.

### Live chat (`/chat`)

- **Support chat only** (`/live-chat-admin`) — not per-order Socket.io chat.
- Polling **~5s** on active thread v1.
- Defer “Tutup Sesi” and admin notes persistence.

### Articles (`/articles`)

- **WYSIWYG** editor (TipTap) storing HTML in `Artikel.content`.
- Backed by admin artikel endpoints (list, create, publish, unpublish, image upload).
- Defer categories, tags, and view counts v1.

### Settings (`/settings`)

- v1 tabs: **profile**, **password**, **activity log**, **skills/kategori** master data.
- Hide: team & permissions, notification preference matrix.

### Deferred (explicit out of scope v1)

- Admin invite / multi-admin RBAC
- Google SSO
- Notification prefs matrix
- Article categories, tags, view analytics
- Dispute evidence attachments
- Export CSV/PDF, ⌘K global search
- Platform commission analytics
- Real Midtrans refund API (internal wallet settlement only)

## Consequences

- Admin UI can ship without team/RBAC complexity.
- Some design handoff screens are simplified where mobile lacks data.

## Related

- `admin-requirements.md`
- `design_handoff_skillmahasiswa_admin/README.md`
- ADR 002 (auth)
