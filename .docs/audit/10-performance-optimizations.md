# 10 — Performance optimizations

**Topic:** Lazy loading, polling, virtualization gaps  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/performance-optimizations` (from `staging`)  
**Status:** **fixed** (this branch)

---

## Rule reference

From `AGENTS.md` stack and Vercel React best practices (`.claude/skills/vercel-react-best-practices/`):

- Heavy client bundles (Recharts, TipTap) should not block initial route paint — use `next/dynamic` or conditional `import()`.
- TanStack Query polling should not run aggressively while the tab is backgrounded unless product requires it (sidebar chat badge).
- Long scrollable lists (chat thread) should defer off-screen paint (`content-visibility`) or virtualize.

Prior session assessment: heaviest risk on `/articles` (TipTap), `/chat` (polling + message list), `/dashboard` (Recharts).

---

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 8 gaps |
| Fixed (this branch) | 7 |
| Wontfix | 1 |
| Residual (follow-up) | 1 |

---

## Findings (pre-fix on `staging`)

| File | Lines / issue | Status |
|------|---------------|--------|
| `app/(dashboard)/articles/page.tsx` | Static `ArticleEditor` import pulls TipTap (~200KB+) into list view chunk | **fixed** → `next/dynamic` + skeleton |
| `app/(dashboard)/dashboard/page.tsx` | Static Recharts chart imports on first paint | **fixed** → `next/dynamic` for area + donut |
| `app/(dashboard)/chat/page.tsx` | `refetchInterval: 5000` always; session filter re-runs every render | **fixed** → visibility-aware interval + `useMemo` |
| `components/chat/chat-room.tsx` | Message poll every 5s when tab hidden; all bubbles inline in parent | **fixed** → visibility poll + memoized `ChatMessageBubble` |
| `hooks/use-ops-badge-counts.ts` | Moderation/disputes/transactions poll while tab hidden | **fixed** → pause when hidden; chat badge keeps background poll |
| `components/chat/chat-room.tsx` | No virtualization / off-screen deferral for long threads | **fixed** → `content-visibility: auto` on bubbles |
| `next.config.ts` | No `optimizePackageImports` for `lucide-react` / `recharts` | **fixed** |
| `app/(dashboard)/dashboard/page.tsx` | No `staleTime` — refetch on every revisit | **fixed** → 30–60s stale windows |
| `components/data-table/data-table.tsx` | No row virtualization | **wontfix** — server pagination `limit=10`; DOM size bounded |

### Evidence (pre-fix)

- `app/(dashboard)/articles/page.tsx:9` — `import { ArticleEditor } from "@/components/articles/article-editor"` (eager TipTap chain via `article-rich-editor.tsx`).
- `app/(dashboard)/dashboard/page.tsx:6-10` — direct chart component imports.
- `grep refetchInterval` — chat page, chat-room, `use-ops-badge-counts` all hard-coded intervals with no visibility guard (except sidebar chat `refetchIntervalInBackground`).
- `components/chat/chat-room.tsx:293-344` — `allMessages.map` inline JSX per message.

---

## Fix applied (`refactor/performance-optimizations`)

### New modules

| File | Role |
|------|------|
| `hooks/use-document-visible.ts` | `document.visibilityState` subscription |
| `lib/query/polling.ts` | Shared intervals + `visibilityAwareInterval()` |
| `components/charts/chart-skeleton.tsx` | Placeholder while Recharts chunks load |
| `components/articles/article-editor-skeleton.tsx` | Placeholder while TipTap chunk loads |
| `components/chat/chat-message-bubble.tsx` | Memoized bubble + `content-visibility: auto` |

### Dynamic imports

```tsx
// app/(dashboard)/dashboard/page.tsx
const TransactionAreaChart = dynamic(
  () => import("@/components/charts/transaction-area-chart").then((m) => m.TransactionAreaChart),
  { loading: () => <ChartSkeleton className="lg:col-span-2" /> },
);

// app/(dashboard)/articles/page.tsx
const ArticleEditor = dynamic(
  () => import("@/components/articles/article-editor").then((m) => m.ArticleEditor),
  { ssr: false, loading: () => <ArticleEditorSkeleton /> },
);
```

### Polling policy

| Query | Visible tab | Hidden tab |
|-------|-------------|------------|
| Sidebar chat sessions (`use-ops-badge-counts`) | 5s | 5s (badge UX) |
| Chat page sessions | 5s | paused |
| Active thread messages | 5s | paused |
| Moderation / disputes badges | 30s | paused |
| Transactions badge | 60s | paused |

Shared `queryKey: ["chatSessions"]` — TanStack Query deduplicates; sidebar observer keeps badge fresh when chat page pauses.

### `next.config.ts`

```ts
experimental: {
  optimizePackageImports: ["lucide-react", "recharts"],
},
```

---

## Wontfix

| Item | Rationale |
|------|-----------|
| DataTable virtualization | Server-side pagination caps rows at 10 per page; adding `@tanstack/react-virtual` is unnecessary weight. |

---

## Residual / follow-up

| Item | Severity | Notes |
|------|----------|-------|
| Full chat DOM virtualization | low | `content-visibility` helps paint; threads with 500+ loaded messages still hold DOM nodes — consider `@tanstack/react-virtual` if ops reports jank after long scroll sessions. |
| Dashboard `useOpsBadgeCounts` on dashboard page | low | Extra sidebar queries mount on dashboard; acceptable for badge accuracy; could gate with route if profiling shows cost. |

---

## Verification

```bash
pnpm exec tsc --noEmit
pnpm build
```

Manual:

- `/articles` list — no TipTap in network until "Buat artikel" / edit; editor skeleton then loads.
- `/dashboard` — stat cards paint before chart chunks; skeletons then charts.
- `/chat` — messages poll when tab focused; pause DevTools Network when tab backgrounded (except sidebar badge).
- Long chat thread — scroll remains smooth after loading older pages.

---

## Status key

- **open** — finding still true on target branch
- **fixed** — addressed in named branch/PR
- **wontfix** — accepted deviation with rationale

**This file:** `fixed` on `refactor/performance-optimizations`.
