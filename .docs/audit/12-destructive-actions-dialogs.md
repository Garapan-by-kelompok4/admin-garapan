# Audit 12 — Destructive Actions & Confirmation UX

**Author audited:** Andika Rafa Akbar  
**Branch:** `refactor/destructive-actions-dialogs` (from `staging`)  
**Date:** 2026-07-05  
**Rule:** AGENTS.md rule 5 — **shadcn/ui only**; destructive actions should use consistent Dialog patterns, not native `window.confirm()`.

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 5 `confirm()` call sites + 1 hand-rolled modal |
| Fixed (this branch) | 6/6 |
| Wontfix | 0 |

All destructive confirmations now use the shared `ConfirmDialog` built on shadcn `Dialog` primitives.

## Findings

| File | Issue | Status |
|------|-------|--------|
| `app/(dashboard)/users/page.tsx` | `confirm()` before ban mutation | **fixed** → `ConfirmDialog` with `banTarget` state |
| `app/(dashboard)/articles/page.tsx` | Delete confirm lived in `article-columns.tsx` via `confirm()` | **fixed** → page-level `ConfirmDialog`; column calls `onDelete` only |
| `components/articles/article-columns.tsx` | Inline `confirm()` on delete button | **fixed** → removed; parent owns confirmation |
| `app/(dashboard)/settings/page.tsx` | `confirm()` before delete skill | **fixed** → `ConfirmDialog` with `deleteSkillTarget` state |
| `components/moderation/moderation-detail-dialog.tsx` | `confirm()` before remove jasa | **fixed** → sibling `ConfirmDialog` (not nested inside detail dialog) |
| `components/chat/chat-room.tsx` | `confirm()` for ban; custom fixed overlay for end session | **fixed** → both use `ConfirmDialog` |

## Pattern applied

- **Shared component:** `components/ui/confirm-dialog.tsx`
  - Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `cancelLabel`, `variant`, `isLoading`, `onConfirm`
  - Destructive variant shows `AlertTriangle` icon and danger-styled confirm button
  - Built from existing `Dialog` primitives; footer uses the same native button classes as moderation/dispute detail dialogs (not `DialogFooter`, which breaks with `p-0` content)
- **State at action owner:** Page or feature component holds pending target (`banTarget`, `deleteArticleId`, etc.); column/cell handlers only request the action
- **No nested dialogs:** Confirm dialog renders as sibling of parent dialog (moderation detail), not as child of another `Dialog` root

## Verification

```bash
# No native confirm in app/components code
grep -rn 'confirm(' app components --include='*.tsx' | grep -v '\.docs/'
# → no matches

pnpm exec tsc --noEmit
# → pass
```

## Out of scope

- Adding confirmation to non-destructive actions (publish/unpublish, unban) — product decision; unban is intentionally one-click per ADR 001
- Extracting `ConfirmDialog` into a global provider / imperative `useConfirm()` hook — deferred unless more call sites appear
