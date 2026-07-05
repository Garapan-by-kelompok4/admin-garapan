# 08 — TypeScript patterns

**Topic:** Unsafe casts, repeated unknown helpers  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/typescript-patterns` (from `staging`)  
**Status:** **fixed** (this branch)

---

## Rule reference

From `AGENTS.md` rule 2:

> All API calls in **`lib/api/`** → `/api/proxy` — no fetch in page components.

From `admin-requirements.md` § Key Rules:

> TypeScript throughout; typed API clients in `lib/api/`

Unknown NestJS payloads should be normalised with shared type guards — not `as SomeType` assertions.

---

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 18 unsafe-cast / helper gaps |
| Fixed (this branch) | 18 |
| Wontfix | 0 |

---

## Findings (pre-fix on `staging`)

### High — unsafe API normaliser casts

| File | Issue | Status |
|------|-------|--------|
| `lib/api/settings.ts:112-115` | `raw as KategoriItem[]` — no field coercion | **fixed** → `normaliseKategori` + `recordList` |
| `lib/api/settings.ts:30` | `...record` spread leaks `Record<string, unknown>` into `AdminProfile` | **fixed** — explicit fields only |
| `lib/api/dashboard.ts:140-141` | `(r.timeSeries ?? []) as UnknownRecord[]` | **fixed** → `recordList` |
| `lib/api/dashboard.ts:166` | `asRecord(r.period) as AnalyticsResponse["period"]` | **fixed** → explicit period mapping |
| `lib/api/dashboard.ts:178` | `r.deltas as AnalyticsResponse["deltas"]` | **fixed** → `nullableNumber` per field |
| `lib/api/users.ts:62` | `String(r.role) as UserRole` | **fixed** → `enumValue` with `USER_ROLES` |
| `lib/api/users.ts:81,95,124-126` | `as UnknownRecord[]` on nested lists | **fixed** → `recordList` |
| `lib/api/orders.ts:106-107` | `as EscrowStatus` on unvalidated string | **fixed** → `enumValue` with `ESCROW_STATUSES` |
| `lib/api/orders.ts:151` | `normaliseOrder(raw) as OrderDetail` | **fixed** — `OrderDetail` optional fields make cast unnecessary |
| `lib/api/disputes.ts:117-119` | `r.data as UnknownRecord[]` (×3 branches) | **fixed** → `recordList` |
| `lib/api/content.ts:128-129` | `as UnknownRecord[]` on jasa/projects | **fixed** → `recordList` |

### Medium — duplicated unknown helpers

| File | Issue | Status |
|------|-------|--------|
| `lib/api/dashboard.ts:83-94` | Local `numberList` duplicate of array→number coercion | **fixed** → shared `numberList` in `normalizers.ts` |

### Medium — page / table unsafe casts

| File | Issue | Status |
|------|-------|--------|
| `app/(dashboard)/users/page.tsx:133` | `(error as Error).message` | **fixed** → `getErrorMessage` |
| `app/(dashboard)/transactions/page.tsx:73` | same | **fixed** |
| `app/(dashboard)/disputes/page.tsx:108` | same | **fixed** |
| `app/(dashboard)/moderation/page.tsx:96` | same | **fixed** |
| `components/disputes/disputes-columns.tsx:86,93,99` | `getValue() as DisputePriority/Status/string` | **fixed** → `row.original.*` |
| `components/transactions/transactions-columns.tsx:89,95` | `getValue() as EscrowStatus/string` | **fixed** |
| `components/moderation/moderation-columns.tsx:89,95` | `getValue() as FlaggedContent["status"]/string` | **fixed** |
| `components/users/users-columns.tsx:51,58,82,93,98` | `as ColumnDef<User>` spread workaround; date cast | **fixed** → typed column variables + `row.original` |

---

## Changes (this branch)

### Extended: `lib/api/normalizers.ts`

- `recordList` — filter unknown arrays to `UnknownRecord[]`
- `nullableNumber` — safe `number | null` for analytics deltas
- `numberList` — shared sparkline / numeric array coercion (moved from `dashboard.ts`)
- `enumValue` — validated string-enum picker with fallback

### Extended: `lib/utils.ts`

- `getErrorMessage(error, fallback?)` — replaces `(error as Error).message` in pages

### Updated API modules

- `dashboard.ts`, `users.ts`, `settings.ts`, `orders.ts`, `disputes.ts`, `content.ts` — use shared normalisers; remove `as` casts on unknown payloads

### Updated UI

- Four list pages — `getErrorMessage` for query error banners
- Four `*-columns.tsx` — typed row access instead of `getValue() as T`

---

## Residual — tracked elsewhere / acceptable

| Topic | Notes | Audit |
|-------|-------|-------|
| `apiClient` `response.json() as Promise<T>` | Generic client boundary; callers pass explicit `T` | — |
| `apiClient` `undefined as T` on 204 | Standard void-response pattern | — |
| Auth route `as LoginUpstream` / `as AdminMeResponse` | Server-only BFF; small typed interfaces | **002-auth-bff** if tightened |
| `components/ui/sonner.tsx` `theme as ToasterProps["theme"]` | shadcn wrapper; next-themes union | — |
| `article-list.tsx` `as ArticleStatusFilter` | Controlled `<select>` value; enum is UI-local | — |
| Per-entity `String(r.id ?? "")` in normalisers | Field mapping, not a shared abstraction | — |

---

## Verification

```bash
npm run build   # TypeScript + Next.js compile
```

Manual spot-check: Users, Transactions, Disputes, Moderation tables render status pills; dashboard analytics period/deltas load without console type warnings.
