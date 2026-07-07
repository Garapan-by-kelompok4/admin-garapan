# GARAPAN Admin — Glossary

Domain terms used across the admin panel, mobile app, and NestJS backend. UI labels are **Bahasa Indonesia** where shown.

---

## Actors & roles

| Term | English | Description |
|------|---------|-------------|
| **Mahasiswa** | Student freelancer | IT university student who offers **Jasa** (services) on the platform |
| **Klien** | Client | User who posts **Project** jobs or orders **Jasa** |
| **Admin** | Administrator | Internal ops user; only role with access to the admin panel |
| **GARAPAN** | — | Product name shown in admin UI (design handoff used “SkillMahasiswa”) |

---

## Marketplace

| Term | English | Description |
|------|---------|-------------|
| **Jasa** | Service / gig | A service listing created by a Mahasiswa (title, price, category, image) |
| **Project** | Job posting | A job posted by a Klien (budget, deadline, category) |
| **Kategori** | Category | Service/project category (e.g. Web Development) |
| **Skill** | Skill tag | Reference skill linked to optional kategori; managed in admin settings |
| **Portofolio** | Portfolio | Mahasiswa portfolio items (mobile; not a primary admin screen) |

---

## Orders & payments

| Term | English | Description |
|------|---------|-------------|
| **Pesanan** | Order | Central transaction record linking Klien, Mahasiswa, and Jasa or Project |
| **Pembayaran** | Payment | Midtrans payment record for a Pesanan (`PENDING` / `SUCCESS` / `FAILED`) |
| **Escrow** | — | Funds held after successful payment until delivery accepted or dispute resolved |
| **Dompet** | Wallet | Internal balance on Mahasiswa or Klien (`walletBalance`) |
| **Midtrans** | — | Payment gateway (sandbox in v1) |

### Pesanan status (`PesananStatus`)

| Status | Admin meaning |
|--------|----------------|
| `PENDING` | Order created; payment not completed |
| `PAID` | Payment received (if used in flow) |
| `IN_PROGRESS` | Paid; work in progress |
| `DELIVERED` | Mahasiswa marked work delivered |
| `COMPLETED` | Client accepted; funds released to Mahasiswa wallet |
| `DISPUTED` | Open dispute (Laporan) on this order |
| `CANCELLED` | Cancelled / refunded after dispute |

### Admin escrow labels (UI)

| Label | Maps to |
|-------|---------|
| **Ditahan** | Paid, funds in escrow, not yet released |
| **Dicairkan** | Completed; credited to Mahasiswa |
| **Refund** | Refunded to Klien (dispute or cancellation) |

---

## Disputes & moderation

| Term | English | Description |
|------|---------|-------------|
| **Laporan** | Report / dispute | Filed via mobile with `pesananId` + text `reason`; admin resolves |
| **Pelapor** | Reporter | User who opened the Laporan |
| **Terlapor** | Reported party | Target user of the Laporan |
| **Moderasi jasa & proyek** | Listing moderation | Admin review of flagged Jasa/Project listings reported via mobile |

### Laporan status (`LaporanStatus`)

| Status | Description |
|--------|-------------|
| `PENDING` | Open; awaiting admin action |
| `RESOLVED` | Closed with RELEASE, REFUND, or PARTIAL_REFUND |
| `REJECTED` | Dismissed without fund movement |

### Dispute resolution outcomes

| Outcome | Effect |
|---------|--------|
| **RELEASE** | Credit Mahasiswa wallet; order → `COMPLETED` |
| **REFUND** | Credit Klien wallet; order → `CANCELLED` |
| **PARTIAL_REFUND** | Partial amount to Klien |
| **REJECT** | Close report; no wallet change |

---

## Content & support

| Term | English | Description |
|------|---------|-------------|
| **Artikel** | Article | Blog post authored by Admin; `publishedAt` null = draft |
| **Live chat (admin)** | Support chat | `LiveChatAdmin` — user ↔ admin support (not per-order chat) |
| **Chat pesanan** | Order chat | Real-time chat tied to a Pesanan (Socket.io; mobile only in v1) |

---

## Admin UI concepts

| Term | Description |
|------|-------------|
| **BFF** | Next.js Route Handlers that proxy NestJS and manage httpOnly session cookies |
| **DataTable** | Shared TanStack Table wrapper used on all admin list pages |
| **Design handoff** | `design_handoff_skillmahasiswa_admin/` — visual reference, not production code |

### User status (admin display)

| Label | Rule |
|-------|------|
| **Pending** | `emailVerified === false` |
| **Aktif** | Verified and not banned |
| **Suspended** | `bannedAt != null` (ban action; no separate suspend state) |

---

## Technical

| Term | Description |
|------|-------------|
| **NESTJS_API_URL** | Server-only env var — NestJS base URL for BFF Route Handlers |
| **NEXT_PUBLIC_APP_URL** | Public admin app URL (Vercel) |
| **Bearer token** | JWT in `Authorization` header — used by mobile, attached by BFF for admin |

---

## Related docs

- `.docs/adr/001-product-scope.md`
- `.docs/adr/002-auth-bff.md`
- `.docs/requirements/admin-requirements.md`
