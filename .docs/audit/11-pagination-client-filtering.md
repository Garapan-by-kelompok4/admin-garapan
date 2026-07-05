# 11 — Pagination & client-side filtering

**Topic:** Client-side filters breaking server pagination  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/pagination-client-filtering` (from `staging`)  
**Status:** **fixed** (this branch)

---

## Rule reference

From `admin-requirements.md` § DataTable:

> **Server-side** pagination, search, and filters (NestJS returns `{ data, total, page, limit }`)  
> TanStack Query `keepPreviousData` to avoid flicker between pages

From `AGENTS.md` rule 1:

> All list pages use shared **`DataTable`** — never one-off tables.

---

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 9 pagination / filter gaps |
| Fixed (this branch) | 7 |
| Wontfix (backend / ADR) | 2 |

---

## Findings (pre-fix on `staging`)

### High — client filter after server page fetch (broken totals)

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `app/(dashboard)/users/page.tsx` | 39–54 | After `usersApi.list({ page, limit })`, filters `res.data` in memory and sets `total: filtered.length` — only counts matches on the **current page**, not the full dataset | **fixed** — `usersApi.listWithStatusFilter()`; server-side `banned` + `emailVerified` (backend PR #115) |

### High — summary cards derived from current table page

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `components/disputes/disputes-summary-cards.tsx` | 37–38 | “Selesai” count from `items.filter` on current page slice | **fixed** — `useDisputesSummaryStats()` totals via `limit: 1` list calls |
| `app/(dashboard)/disputes/page.tsx` | 43–46 | Open / processing counts from current page slice | **fixed** |
| `components/moderation/moderation-summary-cards.tsx` | 29–39 | Aman / Dihapus counts from current page slice | **fixed** — `useModerationSummaryStats()` |
| `app/(dashboard)/moderation/page.tsx` | 39–41 | Pending count from current page slice | **fixed** |
| `components/transactions/transactions-summary-cards.tsx` | 17–56 | GTV and escrow volumes summed from current page only | **fixed** — `useTransactionsSummaryStats()` aggregates all order pages |

### Medium — missing `keepPreviousData` on list queries

| File | Issue | Status |
|------|-------|--------|
| `app/(dashboard)/users/page.tsx` | Page change flickers empty table | **fixed** — `placeholderData: paginatedListPlaceholder` |
| `app/(dashboard)/disputes/page.tsx` | Same | **fixed** |
| `app/(dashboard)/moderation/page.tsx` | Same | **fixed** |
| `app/(dashboard)/transactions/page.tsx` | Same | **fixed** |
| `app/(dashboard)/articles/page.tsx` | Same | **fixed** |

### Low / compliant / wontfix

| File | Issue | Status |
|------|-------|--------|
| `lib/api/content.ts` | Fetches full `GET /admin/content` payload, then client filter + slice | **wontfix** — backend returns unpaginated `{ jasa, projects }`; client pagination is correct for this endpoint |
| `lib/api/articles.ts` | Server-side `page` / `search` / `status` / `category` / `tag` | **compliant** — no change |
| `lib/api/disputes.ts` | `search` param accepted in types but never sent | **wontfix** — `AdminDisputesQueryDto` has no search; toolbar kept, documented in **04-api-wiring** residual |
| `app/(dashboard)/articles/page.tsx` | `pageStats` from current page | **compliant** — UI labels stats as “Halaman ini:” (`article-list.tsx:92–94`) |
| Disputes “Diproses” filter | Maps to same backend `PENDING` as “Terbuka” | **wontfix** — no `IN_PROGRESS` laporan status in NestJS v1; summary `processingCount` stays `0` |

---

## Fix applied (`refactor/pagination-client-filtering`)

### New shared utilities

| File | Purpose |
|------|---------|
| `lib/query/pagination.ts` | `paginatedListPlaceholder`, `fetchAllPaginated`, `paginateSlice` |
| `lib/api/users.ts` | `banned` + `emailVerified` query params; `listWithStatusFilter()` for ADR 001 status mapping |
| `hooks/use-disputes-summary-stats.ts` | Global dispute totals (open / resolved / all) |
| `hooks/use-moderation-summary-stats.ts` | Global moderation totals by status |
| `hooks/use-transactions-summary-stats.ts` | Global escrow volume sums |

### Page / component changes

- **Users** — removed in-query client filter; uses `listWithStatusFilter`.
- **Disputes / Moderation / Transactions** — summary cards consume dedicated stats hooks; table queries use `placeholderData`.
- **Articles** — `placeholderData` on list query (already server-paginated).

---

## Verification

```bash
pnpm exec tsc --noEmit
```

Manual smoke:

1. **Users** — filter Suspended: pagination total matches table; pages beyond 1 show data when expected.
2. **Users** — filter Aktif / Pending: single `GET /admin/users` per page; totals stable across pages.
3. **Disputes / Moderation** — summary card numbers unchanged when changing table page.
4. **Transactions** — GTV / escrow cards unchanged when changing table page or filter.
5. **All list pages** — changing page does not flash empty skeleton when prior page data exists.

---

## Residual / follow-up

| Topic | Notes |
|-------|-------|
| Disputes search toolbar | No backend search on `GET /admin/disputes` — see **04-api-wiring-mock-data** |
| Transactions summary cost | Aggregates all order pages on load; acceptable for v1 admin scale; consider backend aggregates v2 |
| `GET /admin/content` pagination | Full payload per request; performance tracked in **10-performance-optimizations** |

---

## Status key

- **open** — finding still true on target branch
- **fixed** — addressed in named branch/PR
- **wontfix** — accepted per ADR 001, backend gap, or explicit v2 deferral

**This file:** `fixed` on `refactor/pagination-client-filtering`.
