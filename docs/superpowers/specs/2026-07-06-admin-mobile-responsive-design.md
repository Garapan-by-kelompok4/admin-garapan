# GARAPAN Admin Mobile Responsive Design

**Date:** 2026-07-06  
**Status:** Approved for implementation  
**Scope:** Existing Next.js admin panel in `garapan/admin`

## Objective

Make the GARAPAN admin panel usable on phone-sized screens without changing the desktop design, API behavior, auth model, or product scope. The mobile experience should preserve the existing information architecture while replacing desktop-only layout assumptions with responsive shells and page-specific mobile modes.

## Design Direction

Use the desktop shell as the source of truth, but adapt it on small screens:

- The fixed 248px sidebar becomes a hamburger drawer.
- The sticky top bar becomes compact and keeps the current page title, notification menu, and admin profile menu.
- Main content changes from fixed desktop spacing to responsive padding and stacked sections.
- Desktop tables remain tables on larger screens, but become mobile record cards where horizontal scrolling would make operational tasks difficult.
- Pages that cannot simply stack, especially chat, settings, and article editing, get targeted mobile behavior.

Do not add bottom navigation for v1. There are nine admin destinations, and a bottom nav would hide too much of the information architecture or force arbitrary prioritization.

## Responsive Breakpoints

Use Tailwind's existing responsive utilities:

- `< md`: mobile layout.
- `md` and above: tablet/desktop hybrid where side-by-side layouts can return when space allows.
- `lg` and above: existing desktop layouts should remain visually unchanged unless a component already has safe responsive behavior.

The implementation should avoid viewport-scaled font sizes. Use existing typography tokens and tighten spacing on mobile with explicit responsive classes.

## Shell

### Desktop

Keep the current desktop layout:

- `Sidebar` remains sticky, 248px wide, and visible.
- `TopBar` remains sticky with global search, notifications, and profile controls.
- Main content keeps the handoff-inspired desktop density.

### Mobile

Add a client shell wrapper for the dashboard area:

- Hide the persistent sidebar below `md`.
- Add a `Menu` icon button in `TopBar` below `md`.
- Open the existing navigation inside a left `Sheet`.
- Close the sheet when a nav item is selected.
- Keep notification and profile menus available from the top bar.
- Hide the global search field below `md`; page-level search remains the mobile search entry point for v1.
- Change `main` padding from `px-8 pb-12 pt-7` to mobile-safe spacing such as `px-4 pb-8 pt-4 md:px-8 md:pb-12 md:pt-7`.

The mobile drawer should reuse the same navigation data from `NAV_GROUPS` and badge counts from `useOpsBadgeCounts`, so counts and active states remain consistent.

## Shared DataTable

Desktop keeps the current TanStack table layout.

On mobile, list pages should avoid forcing users to pan a wide table. Add a mobile rendering mode to the shared `DataTable` instead of creating one-off mobile lists per page:

- Add an optional `mobileCard` render prop to `DataTable`.
- Below `md`, render one bordered card per row when `mobileCard` is provided.
- Preserve the same loading, empty, error, and pagination behavior.
- Keep desktop columns as the canonical source for desktop.
- Existing list pages pass page-specific card renderers for Users, Moderation, Disputes, Transactions, and Articles list view.

Mobile cards should show the row's primary identity, status, date or amount, and the same critical actions as desktop. They should not hide destructive or review actions behind ambiguous icon-only gestures.

## Dashboard

The dashboard already uses responsive grids. Tighten mobile layout only where needed:

- Stat cards stack in one column on narrow phones and two columns when space allows.
- Charts keep a stable minimum height and avoid horizontal overflow.
- The activity feed and attention panel remain stacked.
- Chart labels and legends should wrap or stack rather than overflow.

## Users, Moderation, Disputes, Transactions

These pages follow the shared mobile card table pattern:

- Toolbars wrap vertically on mobile.
- Search input takes full width.
- Filters can either wrap below search or move into a filter `Sheet` if the toolbar becomes cramped.
- Pagination becomes a compact mobile row with previous/next buttons and current range; numbered page buttons can be hidden below `sm`.

The desktop table remains unchanged for `md` and wider screens.

## Live Chat

Chat needs a true mobile mode because the current desktop card is a multi-column workspace.

Mobile behavior:

- Default view shows the session list.
- Selecting a session switches to the message view.
- The message view has a back button to return to sessions.
- The user info panel opens in a right or bottom `Sheet`.
- The message composer stays visible at the bottom of the chat view.
- Quick replies should wrap or move behind a menu so they do not compress the input.

Desktop behavior stays as the existing side-by-side chat workspace.

## Articles

The articles screen has a list/editor toggle and a rich editor. Mobile behavior:

- List view uses mobile article cards through the shared `DataTable` mobile mode.
- Creating or editing an article moves into a full-screen editor flow on mobile.
- Editor actions such as save draft, publish, and cancel should be sticky at the bottom or top so they remain reachable after scrolling.
- TipTap toolbar controls must wrap into multiple rows or collapse into grouped controls so the editor does not overflow horizontally.

Desktop editor behavior stays unchanged.

## Settings

Settings already changes from row to column at `md`, but the sidebar-style tab list should become mobile tabs or a compact selector:

- Below `md`, render settings sections as a horizontal scroll tab row or select-style trigger.
- Keep the active tab in the `?tab=` query parameter.
- Preserve the existing form components and mutations.
- Master data lists use stacked rows/cards on mobile if current rows overflow.

## Login

The admin login should remain visually aligned with the handoff but become safe on mobile:

- Stack the hero and form vertically or hide the decorative hero content below `md`.
- Keep the form first enough to avoid excessive scrolling on phones.
- Preserve email/password only; do not add SSO or 2FA.

## Testing And Verification

Implementation should be verified at these viewport sizes:

- `390x844` mobile portrait.
- `430x932` large mobile portrait.
- `768x1024` tablet.
- `1440x900` desktop regression check.

Required checks:

- Dashboard shell does not overflow horizontally.
- Mobile navigation drawer opens, highlights the active page, and closes on navigation.
- Every list page remains usable without horizontal page scrolling.
- Chat can move from session list to conversation and back on mobile.
- Article editor controls and settings tabs do not overflow.
- Existing unit and e2e tests still pass, or failures are documented with concrete causes.

## Non-Goals

- No bottom navigation in v1.
- No new backend endpoints.
- No auth changes.
- No desktop redesign.
- No new UI library.
- No changes to mobile app behavior.
