# ADR 003: Backend API gaps for admin production

**Status:** Accepted  
**Date:** 2026-06-26  
**Context:** Admin panel needs endpoints beyond what NestJS exposes today

## Decision

Track all missing or incomplete backend work in the **backend GitHub repo** as one epic with **one issue per API**. Do not duplicate full specs here — use the issues as the source of truth for implementation.

### Epic (parent)

**[#31 — feat(admin): production admin api epic](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/31)**

### Child issues

| Issue | Endpoint / change | Admin screen |
|-------|-------------------|--------------|
| [#32](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/32) | `GET /admin/disputes/:id` | Disputes detail modal |
| [#33](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/33) | `GET /admin/disputes?status=` | Disputes filters |
| [#34](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/34) | `PATCH /admin/disputes/:id/resolve` extend | Disputes resolution |
| [#35](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/35) | `GET /admin/users/:id` | Users detail modal |
| [#36](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/36) | `GET /admin/users` search extend | Users search |
| [#37](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/37) | `GET /admin/artikel` | Articles list (drafts) |
| [#38](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/38) | `PATCH /admin/artikel/:id/unpublish` | Articles CMS |
| [#39](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/39) | `POST /admin/artikel/upload` | Article cover image |
| [#40](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/40) | `GET /admin/analytics` | Dashboard charts |
| [#41](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/41) | `GET /admin/me` | Settings profile |
| [#42](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/42) | `PATCH /admin/me` | Settings profile |
| [#43](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/43) | Live chat `readAt` + mark-read | Chat unread badges |
| [#44](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/44) | Enrich `GET /live-chat-admin` | Chat session list |
| [#45](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/45) | CORS admin origin | Infrastructure |

### Priority for admin frontend

| Priority | Issues | Can build admin UI before merge? |
|----------|--------|----------------------------------|
| **P0** | #32–#39 | Stub modals; wire when merged |
| **P1** | #40–#42 | Dashboard cards yes; charts wait on #40 |
| **P2** | #43–#45 | Basic chat works without #43–#44 |

### Already available (no new issue)

- `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id/ban`
- `GET /admin/orders`, `GET /admin/orders/:id`
- `GET /admin/disputes` (PENDING only), `PATCH .../resolve` (`RELEASE` \| `REFUND`)
- `GET /admin/content`, `PATCH /admin/content/:id/remove`
- `GET /admin/activity`
- `/admin/skills`, `/admin/kategori` CRUD
- `POST/PATCH /artikel`, `PATCH /artikel/:id/publish`
- `GET/POST /live-chat-admin/:userId`, `GET /live-chat-admin`

### Dispute resolution extension (#34) — summary

Per ADR 001 and grilling decisions:

- Add `resolutionNote` (required on resolve).
- Outcomes: `RELEASE`, `REFUND`, `PARTIAL_REFUND` (+ `refundAmount`), `REJECT`.
- `REJECT`: close laporan without wallet movement.
- No evidence fields until mobile supports upload.

## Consequences

- Backend and admin frontend can work in parallel; link PRs to issue numbers.
- Admin requirements doc references this ADR instead of maintaining a duplicate API checklist.
- Closed monolithic issue [#30](https://github.com/Garapan-by-kelompok4/backend-garapan/issues/30) superseded by #31 + children.

## Related

- ADR 001 (product scope)
- `admin-requirements.md` — Backend Extensions Required
