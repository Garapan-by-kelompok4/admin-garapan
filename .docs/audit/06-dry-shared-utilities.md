# 06 — DRY & shared utilities

**Topic:** Duplicated formatters & API normalizers  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/dry-shared-utilities` (from `staging`)  
**Status:** **fixed** (this branch)

---

## Rule reference

From `AGENTS.md` rule 7:

> Read ADRs before changing auth, scope, or API assumptions.

From `admin-requirements.md` § Key Rules:

> **Copy:** Bahasa Indonesia; IDR via `Intl.NumberFormat('id-ID')`; Indonesian dates

Shared formatters belong in `lib/utils.ts`; API payload coercion belongs in one place under `lib/api/`.

---

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 14 duplication gaps |
| Fixed (this branch) | 14 |
| Wontfix | 0 |

---

## Findings (pre-fix on `staging`)

### High — duplicated API normalizers (7 files)

| File | Duplicated helpers | Status |
|------|-------------------|--------|
| `lib/api/chat.ts` | `asRecord`, `listFromResponse`, `textFromValue`, `numberFromValue`, `booleanFromValue`, `dateValue` | **fixed** → `lib/api/normalizers.ts` |
| `lib/api/dashboard.ts` | `asRecord`, `listFromResponse` | **fixed** |
| `lib/api/orders.ts` | `asRecord` | **fixed** |
| `lib/api/disputes.ts` | `asRecord` | **fixed** |
| `lib/api/users.ts` | `asRecord` | **fixed** |
| `lib/api/content.ts` | `asRecord` | **fixed** |
| `lib/api/settings.ts` | `asRecord`, `valueToText` (alias of `textFromValue`) | **fixed** |
| `lib/api/articles.ts` | `stringOr`, `optionalString`, `nullableString`, `normaliseTags` | **fixed** |

### Medium — duplicated display formatters

| File | Issue | Status |
|------|-------|--------|
| `app/(dashboard)/settings/page.tsx` | Inline `formatDate` with time, passed as prop | **fixed** → `formatDateTime` from `lib/utils.ts`; tabs import directly |
| `components/settings/settings-master-tab.tsx` | `formatDate` prop drilling | **fixed** |
| `components/settings/settings-audit-tab.tsx` | `formatDate` prop drilling | **fixed** |
| `components/articles/article-columns.tsx` | Local `formatArticleDate` duplicate of `formatDate` | **fixed** |
| `lib/chat-utils.ts` | `formatDateLabel` duplicated `formatDate` logic | **fixed** → delegates to `formatDate` |

### Low — scattered `Intl.NumberFormat('id-ID')`

| File | Issue | Status |
|------|-------|--------|
| `components/articles/article-list.tsx` | Inline number format (×2) | **fixed** → `formatNumber` |
| `components/articles/article-columns.tsx` | Inline views count format | **fixed** |
| `components/dashboard/dashboard-stat-cards.tsx` | Inline stat counts (×2) | **fixed** |
| `components/charts/transaction-area-chart.tsx` | Inline order count sum | **fixed** |

---

## Changes (this branch)

### New: `lib/api/normalizers.ts`

Centralises unknown-payload helpers used across `lib/api/*`:

- `asRecord`, `listFromResponse`
- `textFromValue` (unifies chat `textFromValue` + settings `valueToText` nested-key sets)
- `numberFromValue`, `booleanFromValue`, `dateValue`
- `stringOr`, `optionalString`, `nullableString`, `normaliseTags`

### Extended: `lib/utils.ts`

- `formatNumber(value)` — Indonesian grouping without currency symbol
- `formatDateTime(dateStr)` — date + time for audit/master tabs
- Module-level `Intl.NumberFormat` instances (avoid per-call allocation)

---

## Residual — tracked in other audits

| Topic | Notes | Audit |
|-------|-------|-------|
| `formatTime` in `lib/chat-utils.ts` | Chat-specific time-only label; acceptable domain split | — |
| `formatDelta` in `dashboard-stat-cards.tsx` | UI-only percentage badge; not a locale formatter | **10-performance** if memoisation needed |
| Repeated `String(r.id ?? "")` in normalisers | Per-entity field mapping; not generic | **08-typescript-patterns** |

---

## Verification

```bash
npm run build   # TypeScript + Next.js compile
```

Manual spot-check: Settings → Master & Audit tabs show Indonesian dates; Articles/Dashboard stat cards show grouped numbers.
