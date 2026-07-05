# 04 — API wiring & mock/stub data

**Topic:** Placeholder/stub UI vs real API data  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/api-wiring-mock-data` (from `staging`)  
**Status:** **fixed** (this branch)

---

## Rule reference

From `AGENTS.md` rule 6:

> Match design handoff layout/tokens; wire **real API data** (not `src/data.jsx` dummy data).

From `admin-requirements.md` § Design handoff:

> `src/data.jsx` — Reference only for column labels and ID formats; **replace with API data**

All API calls must go through `lib/api/*` → `/api/proxy` (rule 2).

---

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 28 wiring/mock gaps |
| Fixed (this branch) | 18 |
| Wontfix (ADR 001 deferral) | 6 |
| Residual (other audits / backend v2) | 4 |

All 9 dashboard routes already used TanStack Query via `lib/api/*`. No `fetch()` in page components. Remaining work was **stub normalizers**, **fake sidebar/contact data**, and **shell UX** not tied to API responses.

---

## Findings (pre-fix on `staging`)

### High — stub or fake data in production UI

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `lib/api/content.ts` | 56–70 | `normaliseFlaggedItem` stubbed `reportCount: 0`, `status: "Ditinjau"`, `createdAt: now()` | **fixed** — map backend `status`; omit `reportCount`; client filter/paginate |
| `components/chat/chat-room.tsx` | 466–487 | Fabricated email/phone/join date | **fixed** — `usersApi.getById(activeSessionId)` |
| `components/chat/chat-room.tsx` | 445–453 | Ban button toast-only, no API | **fixed** — `usersApi.ban()` + invalidation |
| `components/layout/top-bar.tsx` | 36–44 | Global search uncontrolled, no submit | **fixed** — submit → `/users?search=`; ⌘K focus |
| `components/layout/top-bar.tsx` | 65 | Notification dot always visible | **fixed** — show only when unread chat > 0 |
| `components/dashboard/dashboard-attention-panel.tsx` | 4–47 | Static nav links, no counts | **fixed** — live counts via `useOpsBadgeCounts` |
| `lib/api/dashboard.ts` | 158–164 | All stat deltas hardcoded `0` | **fixed** — parallel `/admin/analytics?includeDeltas=true` |
| `components/settings/settings-notifications-tab.tsx` | 42–121 | Fake checkboxes + toast save | **fixed** — deferred empty state (ADR 001) |

### Medium — incomplete normalizers / fallbacks

| File | Issue | Status |
|------|-------|--------|
| `lib/api/disputes.ts` `getById` | Empty `evidenceUrls` / `communicationHistory` arrays | **fixed** — removed fake arrays; map `resolutionNote` |
| `lib/api/users.ts` | `phone: ""` hardcoded | **fixed** — `phoneNumber` from API |
| `lib/api/dashboard.ts` `normaliseActivity` | `actorName: "Admin"` always | **fixed** — derive from `user` / `userId` / action map |
| `app/(dashboard)/articles/page.tsx` | `fallbackCategories` merged with API | **fixed** — API categories only |
| `app/(dashboard)/settings/page.tsx` | Ignores `?tab=audit` from activity feed link | **fixed** — `useSearchParams` |
| `components/settings/settings-audit-tab.tsx` | Export button toast-only | **fixed** — client CSV from loaded logs |
| `components/moderation/moderation-columns.tsx` | Shows `0 Laporan` for missing data | **fixed** — em dash when count absent |

### Low / wontfix (ADR 001 or v2)

| File | Issue | Status |
|------|-------|--------|
| `components/chat/chat-room.tsx` | Admin notes in `localStorage` only | **wontfix** — ADR 001 defers notes persistence |
| `components/chat/chat-room.tsx` | "Tutup Sesi" UI-only | **wontfix** — ADR 001 defers close-session API |
| `components/dashboard/dashboard-attention-panel.tsx` | Ops monitoring card static copy | **wontfix** — v2 monitoring |
| `components/settings/settings-security-tab.tsx` | 2FA toggle disabled | **wontfix** — no admin 2FA v1 |
| `components/auth/login-hero.tsx` | Marketing stats hardcoded | **wontfix** — decorative hero, not dashboard data |
| `components/layout/coming-soon.tsx` | Unused placeholder component | **wontfix** — not rendered on any route |

### Residual — tracked in other audits / backend gaps

| Topic | Notes | Audit |
|-------|-------|-------|
| Page-local summary stats (moderation/disputes/transactions/articles) | Counts from current page slice, not global totals | **11-pagination-client-filtering** |
| `contentApi` — no per-post report counts | Backend `GET /admin/content` lacks counts | Backend v2 + ADR 001 |
| Global search — users only | No cross-entity search endpoint | Future `lib/api/search.ts` |
| Sparklines empty in stat cards | No mini-series endpoint | **07-charts-organization** or hide UI |

---

## Fix applied (`refactor/api-wiring-mock-data`)

### New shared hook

| File | Purpose |
|------|---------|
| `hooks/use-ops-badge-counts.ts` | Single source for moderation/disputes/chat/transactions totals — used by sidebar, top bar, dashboard attention panel |

### `lib/api/*` changes

- **`content.ts`** — Real status mapping (`ACTIVE`/`OPEN` → Ditinjau, etc.); client-side search/filter/pagination; no fabricated report counts.
- **`dashboard.ts`** — `getStats()` fetches analytics deltas in parallel; improved activity messages and actor labels.
- **`disputes.ts`** — `getById` no longer injects empty evidence/history arrays.
- **`users.ts`** — Maps `phoneNumber`.

### UI wiring

- **Chat** — Contact panel and ban action use `usersApi`.
- **Top bar** — Search submits to users list; bell dot tied to unread chat count.
- **Dashboard** — Attention panel shows live badge counts; stat cards hide "vs bln lalu" when delta is `null`.
- **Settings** — `?tab=audit` deep link; real CSV export; notifications tab shows v2 deferral (no fake save).
- **Articles** — Removed `fallbackCategories` hardcoded list.
- **Users** — Reads `?search=` from URL (top-bar entry point).

---

## Verification

```bash
pnpm exec tsc --noEmit   # passes on this branch
```

Manual smoke:

1. Dashboard — attention links show counts matching sidebar badges.
2. Top bar — ⌘K focuses search; Enter navigates to `/users?search=…`.
3. Chat — user info panel shows real email/phone/join date; Blokir calls API.
4. Settings — `/settings?tab=audit` opens audit tab; Ekspor Log downloads CSV.
5. Moderation — table no longer shows fake `0` laporan or today's date on every row.

---

## Status key

- **open** — finding still true on target branch
- **fixed** — addressed in named branch/PR
- **wontfix** — accepted per ADR 001 or explicit v2 deferral

**This file:** `fixed` on `refactor/api-wiring-mock-data`.
