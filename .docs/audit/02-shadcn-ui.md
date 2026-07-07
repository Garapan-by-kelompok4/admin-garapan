# Audit 02 — shadcn/ui Usage

**Author audited:** Andika Rafa Akbar  
**Branch:** `refactor/shadcn-ui-usage` (from `staging`)  
**Date:** 2026-07-05  
**Rule:** AGENTS.md rule 5 — **shadcn/ui only**; no raw HTML form controls in app code.

## Summary

| Status | Count |
|--------|-------|
| Open (before) | ~120 raw `<button>`, `<input>`, `<select>`, `<textarea>` across 13 files |
| Fixed (this branch) | 13/13 files |
| Wontfix | 0 |

All interactive controls in `app/` and `components/` (excluding `components/ui/*` wrappers) now use shadcn/ui primitives.

## Findings

### Shared components

| File | Issue | Status |
|------|-------|--------|
| `components/data-table/data-table.tsx` | Pagination used raw `<button>` | **fixed** → `Button variant="outline" size="icon"` |
| `components/layout/top-bar.tsx` | Search bar `<input>`, icon `<button>`, profile trigger `<button>` | **fixed** → `Input`, `Button`, `DropdownMenuTrigger render={<Button />}` |
| `components/layout/sidebar.tsx` | Logout `<button>` | **fixed** → `Button variant="outline" size="icon-sm"` |
| `components/auth/login-form.tsx` | Password visibility toggle `<button>` | **fixed** → `Button variant="ghost" size="icon-sm"` |

### Dashboard pages

| File | Issue | Status |
|------|-------|--------|
| `app/(dashboard)/error.tsx` | Retry / home actions used raw `<button>` and styled `<Link>` | **fixed** → `Button`, `Button render={<Link />}` |
| `app/(dashboard)/users/page.tsx` | Tab nav, filter bar, table action icons, modal actions | **fixed** → `Tabs`, `Input`, `Select`, `Button` |
| `app/(dashboard)/transactions/page.tsx` | Filter bar, row action button | **fixed** → `Input`, `Select`, `Button` |
| `app/(dashboard)/moderation/page.tsx` | Segmented status filter, search, row actions | **fixed** → `Tabs`, `Input`, `Button` |
| `app/(dashboard)/disputes/page.tsx` | Filter bar, resolve form `<select>`/`<textarea>`, modal actions | **fixed** → `Input`, `Select`, `Textarea`, `Button` |
| `app/(dashboard)/dashboard/page.tsx` | Chart period toggle buttons | **fixed** → `Tabs` |
| `app/(dashboard)/chat/page.tsx` | Session list, message composer, quick replies, modals | **fixed** → `Input`, `Textarea`, `Button` |
| `app/(dashboard)/articles/page.tsx` | TipTap toolbar, filters, editor form fields | **fixed** → `Button`, `Input`, `Select`, `Textarea` |
| `app/(dashboard)/settings/page.tsx` | Profile, security, skills, notifications forms | **fixed** → `Input`, `Select`, `Textarea`, `Button` |

## Patterns applied

- **Icon actions:** `Button variant="outline" size="icon"` with existing `className` for brand/danger tints.
- **Search fields:** `Input` inside relative wrapper; clear affordance via `Button variant="ghost" size="icon-xs"`.
- **Native `<select>`:** `Select` + `SelectTrigger` + `SelectValue` + `SelectContent` + `SelectItem`; `onValueChange` null-guarded.
- **Tab / segmented controls:** `Tabs` + `TabsList` + `TabsTrigger` (users role tabs, moderation status, dashboard period).
- **Dropdown triggers:** `DropdownMenuTrigger render={<Button … />}` (top bar profile menu).

## Verification

```bash
# No raw controls outside ui wrappers
grep -rn '<button\|<input\|<select\|<textarea' app components --include='*.tsx' | grep -v components/ui/textarea.tsx
# → no matches

pnpm exec tsc --noEmit
# → pass
```

## Out of scope (other audits)

- Extracting repeated filter bars into shared components → **01-component-composition**
- React Hook Form + Zod on settings/dashboard forms → **03-forms-stack-rhf-zod**
- `confirm()` for destructive actions → **12-destructive-actions-dialogs**
