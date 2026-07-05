# 07 — Charts organization

**Topic:** Inline Recharts vs `components/charts/`  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/charts-organization` (from `staging`)  
**Status:** **fixed** (this branch)

---

## Rule reference

From `AGENTS.md` project structure:

```
components/charts/   # Recharts wrappers
```

From `admin-requirements.md` § Design handoff:

> `src/charts.jsx` → implement with Recharts in `components/charts/`  
> Dashboard: stat cards, line chart, donut chart — chart UI must not live inline in `page.tsx`.

**Expected pattern:** All Recharts usage and mini-chart SVGs live under `components/charts/`. `app/(dashboard)/dashboard/page.tsx` only composes chart components and passes API data.

---

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 6 gaps |
| Fixed (this branch) | 6 |
| Wontfix | 0 |
| Residual (backend) | 1 |

---

## Findings (pre-fix on `staging`)

Audit **01** already extracted the two main Recharts blocks from the 599-line dashboard page into `transaction-area-chart.tsx` and `category-donut-chart.tsx`. Remaining gaps were chart-adjacent code still outside `components/charts/`.

| File | Lines / issue | Status |
|------|---------------|--------|
| `app/(dashboard)/dashboard/page.tsx` (pre-01) | Full `AreaChart` + `PieChart` JSX inline (~lines 309–450) | **fixed** (audit 01) → `components/charts/*` |
| `components/dashboard/dashboard-stat-cards.tsx` | Inline `renderSparkline` SVG helper | **fixed** → `components/charts/stat-sparkline.tsx` |
| `components/dashboard/dashboard-stat-cards.tsx` | Empty `spark: []` still rendered broken polyline | **fixed** → `StatSparkline` returns `null` when `< 2` points |
| `components/charts/transaction-area-chart.tsx` | Period toggle + summary reducers colocated with Recharts | **fixed** → `chart-period-toggle.tsx`, `transaction-chart-summary.tsx` |
| `components/charts/category-donut-chart.tsx` | Local `donutColors` array | **fixed** → `chart-tokens.ts` |
| `components/charts/transaction-area-chart.tsx` | Hardcoded stroke/tooltip hex values | **fixed** → `chart-tokens.ts` |
| `components/charts/*` | `ChartPeriod` type owned by area chart file | **fixed** → `components/charts/types.ts` |

### Evidence (pre-fix)

- `git show 7be4f6e^:app/(dashboard)/dashboard/page.tsx` — `import { AreaChart, PieChart, ... } from "recharts"` at line 13; inline `renderSparkline` at line 105; `donutColors` at line 140.
- Post-01 `dashboard-stat-cards.tsx` — `function renderSparkline` still at lines 35–67 with `spark: []` on all four cards.

---

## Fix applied (`refactor/charts-organization`)

### `components/charts/` inventory (after)

| File | Role |
|------|------|
| `types.ts` | `ChartPeriod`, `CHART_PERIODS` |
| `chart-tokens.ts` | Brand/axis colors, donut palette, tooltip style, gradient id |
| `stat-sparkline.tsx` | Mini SVG sparkline for stat cards |
| `chart-period-toggle.tsx` | 7H / 30H / 90H / 1T selector |
| `transaction-chart-summary.tsx` | Aggregates for area chart header row |
| `transaction-area-chart.tsx` | Recharts area chart wrapper |
| `category-donut-chart.tsx` | Recharts donut chart wrapper |

### Dashboard orchestrator (unchanged contract)

```1:59:app/(dashboard)/dashboard/page.tsx
"use client";

import { CategoryDonutChart } from "@/components/charts/category-donut-chart";
import {
  TransactionAreaChart,
  type ChartPeriod,
} from "@/components/charts/transaction-area-chart";
// ... queries + composition only
```

No `recharts` import in `page.tsx` or `components/dashboard/*`.

---

## Residual / follow-up

| Item | Severity | Notes |
|------|----------|-------|
| Stat card sparklines always empty | low | **fixed** — backend `sparklines` on `/admin/stats`; admin maps to `*Sparkline` fields on `DashboardStats`. |
| Chart period toggle uses raw `<button>` | low | **02-shadcn-ui** — migrate to `Tabs` when that branch merges. |
| Recharts bundle size on `/dashboard` | low | **10-performance-optimizations** — optional `next/dynamic` for chart components. |

---

## Verification

```bash
pnpm exec tsc --noEmit   # passes on this branch
```

Manual: `/dashboard` — period toggles refetch analytics; area + donut charts render; stat cards show values without empty sparkline artifacts.

---

## Status key

- **open** — finding still true on target branch
- **fixed** — addressed in named branch/PR
- **wontfix** — accepted deviation with rationale

**This file:** `fixed` on `refactor/charts-organization`.
