# 05 — Product & ADR alignment

**Topic:** Copy/behavior vs ADR 001 & product scope  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `refactor/product-adr-alignment` (from `staging`)  
**Status:** **partial** — 6 fixed, 8 open/wontfix documented below

---

## Rule reference

From `.docs/adr/001-product-scope.md` — single admin, ban-only users, read-only transactions, deferred features (articles taxonomy/views, notification matrix, dispute evidence, export), Bahasa UI copy, GARAPAN branding.

From `AGENTS.md` § Product decisions — summary of ADR 001 labels (escrow pills, user status mapping, disputes resolution scope).

---

## Summary

| Status | Count |
|--------|-------|
| Compliant (no change) | 14 areas |
| Fixed (this branch) | 6 |
| Open (follow-up) | 5 |
| Wontfix (ADR deferral, UI shell OK) | 3 |

---

## Compliant (verified on `staging`)

| Area | ADR rule | Evidence |
|------|----------|----------|
| Branding | UI shows **GARAPAN** | `components/layout/sidebar.tsx:34`, `app/layout.tsx:25`, `components/auth/login-hero.tsx:9` |
| Login auth | Email + password only; no Google SSO | `components/auth/login-form.tsx` — no OAuth buttons |
| Users — ban API | Ban/unban via `PATCH …/ban` only | `lib/api/users.ts`, `app/(dashboard)/users/page.tsx` `banMutation` |
| Users — status mapping | Pending / Aktif / Suspended per `emailVerified` + `bannedAt` | `components/users/user-status-pill.tsx:4–24`, `app/(dashboard)/users/page.tsx:40–45` |
| Users — no NIM/Prodi | Columns dropped | `components/users/users-columns.tsx` — no NIM/Prodi accessors |
| Users — no bulk actions | No row-selection column in shared DataTable | `components/data-table/data-table.tsx` — server pagination only |
| Transactions — read-only | Detail dialog closes without fund actions | `components/transactions/transaction-detail-dialog.tsx:306–312` — only “Tutup” |
| Escrow pills | Ditahan / Dicairkan / Refund | `lib/api/orders.ts:50–52`, `components/transactions/transaction-status-pill.tsx` |
| Disputes — resolution | RELEASE / REFUND / PARTIAL_REFUND / REJECT on disputes only | `components/disputes/resolution-form.tsx:109–114` |
| Disputes — no evidence UI | Type exists but not rendered | `lib/api/disputes.ts:25` — no `evidence` in `dispute-detail-dialog.tsx` |
| Moderation — v1 actions | Remove jasa only; no “mark safe” | `components/moderation/moderation-detail-dialog.tsx:176–181` |
| Chat — support + polling | `live-chat-admin`, ~5s poll | `app/(dashboard)/chat/page.tsx:21`, `components/chat/chat-room.tsx:76` |
| Articles — TipTap | WYSIWYG HTML in `Artikel.content` | `components/articles/article-rich-editor.tsx` |
| Settings — v1 tabs core | profile, password, activity, skills/kategori | `components/settings/settings-sidebar.tsx` (after fix) |

---

## Findings (pre-fix on `staging`)

### High — copy/behavior contradicts ADR 001

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `components/dashboard/dashboard-stat-cards.tsx` | 100 | Revenue card labeled **“Pendapatan Platform”**; ADR requires **“Total Pendapatan Selesai”** and no commission framing | **fixed** |
| `components/users/user-detail-dialog.tsx` | 375–391 | Ban / unban actions in detail modal; ADR: detail **read-only**, ban **on table row only** | **fixed** — footer is “Tutup” only |
| `components/users/users-columns.tsx` | 45–53 | Mahasiswa tab missing **universitas** column; ADR lists `university` in table fields | **fixed** — `Universitas` column for MAHASISWA |
| `components/settings/settings-sidebar.tsx` | 26 | **Notifikasi Sistem** tab visible; ADR: hide notification preference matrix v1 | **fixed** — tab removed from nav |
| `components/auth/login-form.tsx` | 61 | Copy references **“Super Admin”**; ADR: single `ADMIN` role, no RBAC tiers | **fixed** |
| `components/settings/settings-profile-tab.tsx` | 119 | Role fallback **“Super Admin”** | **fixed** → `admin` |
| `components/settings/profile-form.tsx` | 138 | Same Super Admin fallback | **fixed** |

### Medium — deferred features still exposed in UI

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `components/articles/article-columns.tsx` | 54–86, 134–140 | **Kategori**, **Tags**, **Views** columns | **open** — ADR defers categories, tags, view counts v1 |
| `components/articles/article-list.tsx` | 97–131, 186–210 | Views summary card + kategori/tag filter dropdowns | **open** |
| `components/articles/article-editor.tsx` | 178–285 | Category text field + tag editor UI | **open** |
| `app/(dashboard)/articles/page.tsx` | 30–31, 91–93, 300–407 | Tag/category state, `articlesApi.tags()`, tag form handlers | **open** |
| `components/moderation/moderation-columns.tsx` | 61–86 | Per-item **report count** column when API omits count | **open** — ADR defers per-post counts; shows em dash when absent (see audit 04) |
| `components/settings/settings-audit-tab.tsx` | 48–56 | Client CSV export of loaded audit rows | **open** — ADR defers export CSV/PDF globally; narrow client export may be acceptable (see audit 04 wontfix debate) |

### Low — copy / locale nuance

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `components/users/user-status-pill.tsx` | 8, 16 | Labels **Suspended** / **Pending** in English; ADR mapping uses same English tokens | **wontfix** — ADR 001 explicitly maps `Suspended` → `bannedAt` |
| `components/articles/article-columns.tsx` | 104 | Status **Draft** / **Published** mixed EN/ID | **open** — prefer “Draf” / “Terbit” for Bahasa consistency |
| `components/auth/login-form.tsx` | 57–61 | “Masuk ke akun Admin” | **wontfix** — acceptable |

### Wontfix — ADR explicit deferrals (shell OK)

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `components/chat/chat-room.tsx` | 261, 403–406 | **Tutup Sesi** UI without backend | **wontfix** — ADR 001 defers close-session API |
| `components/settings/settings-security-tab.tsx` | 31–46 | 2FA toggle (disabled) | **wontfix** — no admin 2FA v1 |
| `components/settings/settings-notifications-tab.tsx` | 1–33 | Deferred empty state component (unused after tab removal) | **wontfix** — kept for v2; not linked in nav |

---

## Fix applied (`refactor/product-adr-alignment`)

1. **Dashboard revenue label** — `dashboard-stat-cards.tsx` card 3 → “Total Pendapatan Selesai”.
2. **User detail read-only** — removed `onBan` / `onUnban` from `UserDetailDialog`; ban/unban remain on table row actions in `users-columns.tsx`.
3. **Mahasiswa universitas column** — `users-columns.tsx` shows `university` for MAHASISWA tab; KLIEN keeps `company`.
4. **Settings nav** — removed “Notifikasi Sistem” from `settings-sidebar.tsx` and `settings/page.tsx` tab routing.
5. **Single-admin copy** — login helper text and profile role fallback no longer say “Super Admin”.

---

## Residual open items (recommended next PR)

| Priority | Item | Suggested change |
|----------|------|------------------|
| P1 | Articles taxonomy & views | Hide views column/stats, tag filter/editor, category filter; keep minimal single category if API requires on create |
| P2 | Article status Bahasa | Map Published → Terbit, Draft → Draf in columns and filters |
| P3 | Audit CSV export | Remove export button or gate behind feature flag until ADR export scope expands |

---

## Verification

```bash
# From admin/
npm run lint
npm run build
```

Manual checks:

- `/dashboard` — third stat card reads **Total Pendapatan Selesai**.
- `/users` — Mahasiswa tab shows **Universitas**; detail modal has no Blokir/Pulihkan; row actions still ban/unban.
- `/settings` — sidebar has 4 tabs (no Notifikasi); profile role shows `admin` when loaded.
- `/login` — no SSO; subtitle does not mention Super Admin.

---

## Related audits

| Topic | File |
|-------|------|
| Mock data / notifications deferral | `04-api-wiring-mock-data.md` |
| Destructive actions (`confirm()` vs Dialog) | `12-destructive-actions-dialogs.md` |
| Client filters vs server pagination | `11-pagination-client-filtering.md` |
