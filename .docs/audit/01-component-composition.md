# 01 — Component composition & file structure

**Topic:** Monolithic `page.tsx`; missing `components/` extraction  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/component-composition`  
**Status:** **fixed** (this branch)

---

## Rule reference

From `AGENTS.md` project structure:

```
components/
├── ui/            # shadcn
├── layout/        # Sidebar, TopBar, Shell
├── data-table/    # shared DataTable
└── charts/        # Recharts wrappers
```

From `admin-requirements.md` § Project Structure — dashboard screens should compose feature components; `page.tsx` routes own layout shell wiring, not hundreds of lines of inline UI.

**Expected pattern:** `app/(dashboard)/*/page.tsx` = data fetching + local UI state + composition. Presentational sections live under `components/<feature>/` or `components/charts/`.

---

## Findings (pre-fix on `staging`)

| Route | `page.tsx` lines | Issue |
|-------|------------------|-------|
| `/articles` | 1,108 | Entire list, editor, TipTap `RichEditor`, columns inline |
| `/settings` | 830 | All 5 tab panels + sidebar inline |
| `/chat` | 798 | `ChatRoom` (~515 lines) defined inside `page.tsx` |
| `/disputes` | 771 | Columns, summary cards, resolution form, detail dialog inline |
| `/users` | 718 | Columns, filters, 350-line detail dialog inline |
| `/transactions` | 630 | Summary cards, columns, detail dialog inline |
| `/dashboard` | 599 | Stat cards, Recharts, activity feed inline (no `components/charts/`) |
| `/moderation` | 521 | Summary cards, columns, review modal inline |
| `/login` | 76 | Hero panel inline (only `LoginForm` was extracted) |

**Only pre-existing extractions:** `components/auth/login-form.tsx`, `components/layout/*`, `components/data-table/data-table.tsx`.

**Evidence (representative):**

- `app/(dashboard)/dashboard/page.tsx` — inline `formatCurrency`, `renderSparkline`, full Recharts JSX (lines 61–597 pre-refactor).
- `app/(dashboard)/chat/page.tsx` — `function ChatRoom` at line 65 inside the same file as `ChatPage`.
- `app/(dashboard)/articles/page.tsx` — `function RichEditor` at line 53 inside the page module.

---

## Fix applied (`refactor/component-composition`)

### Target structure

| Area | New folder / files |
|------|-------------------|
| Auth | `components/auth/login-hero.tsx` |
| Dashboard | `components/dashboard/*`, `components/charts/*` |
| Users | `components/users/*` |
| Moderation | `components/moderation/*` |
| Disputes | `components/disputes/*` |
| Transactions | `components/transactions/*` |
| Chat | `components/chat/*`, `lib/chat-utils.ts` |
| Articles | `components/articles/*` |
| Settings | `components/settings/*` |

### `page.tsx` line counts (after)

| Route | Before | After |
|-------|--------|-------|
| `/dashboard` | 599 | **68** |
| `/chat` | 798 | **64** |
| `/transactions` | 630 | **96** |
| `/moderation` | 521 | **120** |
| `/disputes` | 771 | **133** |
| `/users` | 718 | **155** |
| `/settings` | 830 | **253** |
| `/articles` | 1,108 | **377** |
| `/login` | 76 | **18** |

> `/articles` and `/settings` pages remain larger because they correctly retain TanStack Query hooks and mutation orchestration; UI sections are extracted.

### Example — dashboard orchestrator (post-fix)

```1:68:app/(dashboard)/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// ... imports from components/dashboard, components/charts, lib/api/dashboard
export default function DashboardPage() {
  const [period, setPeriod] = useState<ChartPeriod>("30H");
  // useQuery × 3
  return (
    <div className="space-y-6">
      <DashboardStatCards stats={stats} />
      {/* charts + activity + attention panel */}
    </div>
  );
}
```

### New component inventory (37 feature files added)

- `components/charts/` — `transaction-area-chart.tsx`, `category-donut-chart.tsx`
- `components/dashboard/` — stat cards, activity feed, attention panel
- `components/users/` — toolbar, columns factory, status pill, detail dialog
- `components/moderation/` — summary cards, toolbar, columns, detail dialog
- `components/disputes/` — summary cards, toolbar, columns, resolution form, detail dialog
- `components/transactions/` — summary cards, toolbar, columns, detail dialog
- `components/chat/` — session list, chat room
- `components/articles/` — rich editor, list, editor, columns
- `components/settings/` — sidebar + 5 tab panels

---

## Residual / follow-up

| Item | Severity | Notes |
|------|----------|-------|
| Articles page still ~377 lines | low | Acceptable: owns edit/list mode + all mutations; further split could move hooks to `hooks/use-articles-page.ts` (out of scope for 01) |
| Settings page still ~253 lines | low | Same — query/mutation orchestration intentionally kept in page |
| No `components/shared/` for repeated error states | low | Deferred to audit **06-dry-shared-utilities** |
| Column factories take many callbacks | info | Expected; keeps pages as mutation owners per TanStack Query conventions |

---

## Verification

```bash
pnpm exec tsc --noEmit   # passes on this branch
```

Manual: smoke each dashboard route — layout, modals, and mutations should behave identically (extraction-only refactor).

---

## Status key

- **open** — finding still true on target branch
- **fixed** — addressed in named branch/PR
- **wontfix** — accepted deviation with rationale

**This file:** `fixed` on `refactor/component-composition`.
