# Design Spec: GARAPAN Admin Design System (v1)

**Date:** 2026-06-29
**Status:** Approved (brainstorm) — pending implementation plan
**Scope:** Cross-cutting reusable component layer for the admin panel, built on the
existing design tokens. Prerequisite for Wave 2 (Users, Transactions, Disputes,
Moderation) and reused by all later waves.

---

## 1. Problem & goal

Design **tokens** are centralized in `app/globals.css` (colors, gradients, radii),
but the **component layer** is not: the shell and login were hand-rolled with
ad-hoc Tailwind, and there are no shared domain components (StatusPill, DataTable,
StatCard, …). Every Wave 2 list page would otherwise re-implement the same table,
pills, filters, and modals.

**Goal:** a coherent, documented component kit — the handoff's *Component
Inventory* realized on top of shadcn/ui + the tokens — so pages compose from shared
components instead of restyling. Source of truth for visuals: the design handoff
(`design_handoff_skillmahasiswa_admin/README.md` + `src/shell.jsx`).

## 2. Principles & constraints

- **shadcn/ui only** (rule #5). Extend via CVA; add custom components only where
  shadcn has no equivalent.
- **Tokens, not raw values.** Components reference token-backed utilities
  (`bg-brand-500`, `text-success-700`, `bg-avatar-3`), never raw hex/gradients.
- **Presentational only.** No data fetching inside components. `DataTable` is
  generic over its data; pages own the query.
- **Variants via CVA**, classes merged with `cn()`.
- **Copy in Bahasa Indonesia** for user-facing defaults; IDR via
  `Intl.NumberFormat('id-ID')` where money is shown.

## 3. Layering

```
Tokens (app/globals.css)
  → Primitives (components/ui/)
    → Composites (components/data-table/, components/shared/)
      → Pages (app/(dashboard)/*)
```

## 4. Token exposure fix (prerequisite)

The feedback scale exists in `:root` but only the `*-500` steps are wired as
Tailwind utilities via `@theme inline`. StatusPill and StatCard need the rest.
**Additive only — no value changes.** Expose:

- `success-50`, `success-700`
- `warn-50`, `warn-700`
- `danger-50`, `danger-700`
- `info-50`, `info-500`

(`brand-*`, `ink-*`, `surface-*` are already exposed.)

## 5. Primitives — `components/ui/`

### 5.1 `button.tsx` — extend existing CVA (do not replace)
Keep the base-ui `ButtonPrimitive`. Add handoff-accurate **sizes** and **variants**.

- Sizes (heights): `default` 38px · `sm` 32px · `xs` 26px · `icon` 32px · plus the
  existing icon sizes retained for compatibility.
- Variants: `default` (primary, `bg-brand-500`), `secondary` (white + border-strong),
  `success` (solid `bg-success-500`), `danger` (solid `bg-danger-500`), `ghost`,
  `outline`. All token-backed.
- Existing call sites must keep working (login submit uses `default`).

### 5.2 `status-pill.tsx` — new
`<StatusPill status="Aktif" />`. Maps domain statuses → tone via a lookup:

| Tone | Statuses |
|---|---|
| success | Aktif, Selesai, Aman, Dicairkan, Published |
| warn | Pending, Terbuka, Ditinjau, Ditahan, Sedang |
| danger | Suspended, Dihapus, Refund, Tinggi |
| info | Diproses |
| neutral | Ditolak, Disembunyikan, Draft, Rendah, (fallback) |

Inline-flex pill, 11.5px/600, leading dot (`::before`-style span), `noDot?: boolean`.
Tones use the feedback tokens from §4 (`text-success-700 bg-success-50`, etc.).

### 5.3 `user-avatar.tsx` — new
Gradient avatar from `lib/avatar` (`avatarClass` + `initials`). Props:
`{ name: string; size?: "sm" | "default" | "md" | "lg" }` → 24 / 32 / 36 / 72px.
Replaces the two duplicated avatar blocks in sidebar/top-bar.

### 5.4 `icon-button.tsx` — new
Bordered square icon button (handoff "Icon btn": 32×32, radius 7, white bg, border).
Props: `{ size?: "sm" | "default" | "lg"; variant?: "default" | "ghost" | "danger" }`
→ 26 / 32 / 36px. Used by table actions, pagination, top bar.

### 5.5 `field.tsx` — new
Form field wrapper: `<Field label error htmlFor>` rendering Label + control slot
(optional leading icon) + error text. RHF-friendly. Login form adopts it.

### 5.6 `empty-state.tsx` — new
Centered icon badge + title + hint. `<EmptyState icon title hint />`.
`ComingSoon` becomes a thin wrapper over it.

> Existing primitives kept as-is: `input`, `label`, `tabs`, `dialog`, `badge`,
> `checkbox`, `select`, `textarea`, `tooltip`, `dropdown-menu`, `table`, etc.

## 6. Composites

### 6.1 `components/data-table/`
- **`data-table.tsx`** — generic TanStack Table v8 wrapper.
  Props: `columns, data, total, page, pageSize, onPageChange, isLoading,
  emptyState?`. Server-side pagination model. Renders shadcn `Table` with handoff
  th/td styling (uppercase 11.5px headers, 14/18px cells, row hover `surface-2`),
  a loading **skeleton**, and `EmptyState` when empty. `keepPreviousData` is the
  page's concern (query), not the table's.
- **`pagination.tsx`** — "Menampilkan X–Y dari Z" + ≤5 numbered page buttons +
  prev/next, using `IconButton`.
- **`cells.tsx`** — reusable cell renderers: `AvatarNameCell` (avatar + name +
  email), `MonoIdCell`, `StatusCell`, `ActionsCell`.

### 6.2 `components/shared/` (new dir)
- **`page-header.tsx`** — title + optional subtitle + `actions` slot.
- **`stat-card.tsx`** — icon badge (color-tinted) + label + value + optional delta
  badge (up/down, green/red) + optional `sparkline` slot. Used by dashboard and
  every list page's stat row.
- **`filter-bar.tsx`** — flex container for search + selects + right-aligned result
  count.
- **`segmented-control.tsx`** — button group (e.g. moderation
  Semua/Ditinjau/Aman/…). Controlled `value`/`onChange`.
- **`search-input.tsx`** — input with leading search icon.
- **`modal.tsx`** — dialog wrapper over shadcn `dialog`: header (title + close X),
  body, `footer` slot, `size?: "default" | "lg"`. Mirrors handoff `Modal`.

## 7. Retrofit (part of this bundle)

- `components/layout/sidebar.tsx`, `top-bar.tsx` → use `UserAvatar` + `IconButton`.
- `components/auth/login-form.tsx` → `Field` wrappers; eye toggle → `IconButton`
  (ghost). Submit already uses `Button`.
- `components/layout/coming-soon.tsx` → re-expressed via `EmptyState`.

## 8. Scope boundaries (YAGNI)

**Out of v1:** charts (`components/charts/`, Wave 4); TipTap / article-editor
components (Wave 3); chat-specific UI (Wave 3). v1 is only the cross-cutting kit
above.

## 9. Verification

- `tsc --noEmit`, `eslint`, and `next build` all green.
- Confirm new token utilities + `@utility` rules are emitted in the production CSS.
- Visual smoke of `/login` and the shell after retrofit (screenshot).
- **DataTable** has no consuming page in this bundle, so validate it with a
  temporary dev mount (render with sample columns/data + the loading and empty
  states, screenshot, then revert). It gets its real workout when the Users page
  consumes it in Wave 2.

## 10. Branch / sequencing note

Implemented on `feat/design-system`, stacked on `feat/dashboard-shell-login`
(PR #3) because the retrofit needs those files. Rebase onto `main` once #3 merges,
so the design-system PR shows only design-system changes.
