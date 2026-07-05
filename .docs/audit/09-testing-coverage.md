# 09 — Testing coverage

**Topic:** Smoke-only Playwright; no feature tests  
**Author audited:** Andika Rafa Akbar  
**Audit date:** 2026-07-05  
**Branch fix:** `docs/audit-testing-coverage` (from `staging`)  
**Status:** **partial** — Phase 1 implemented on this branch

---

## Rule reference

From `admin-requirements.md` § Build Order — **Wave 5 — Polish**:

> 12. E2E smoke tests (Playwright), Vercel env configuration

From `AGENTS.md` stack table:

> Deploy | **Vercel** (admin) → **Railway** (API)

Smoke tests are the documented v1 bar. The project also ships `lib/validators/*` (Zod) and `lib/api/normalizers.ts` — both are pure logic suited to fast unit tests, but no runner is configured.

Internal planning (not merged): `.agents/sub_orch_e2e_tests/SCOPE.md` targets **104 mocked E2E tests** across 9 features (Tier 1–4). That work exists only under `.agents/teamwork_preview_worker_e2e_1/` and is **not** in the repo tree.

---

## Summary

| Status | Count |
|--------|-------|
| Open (before) | 52 coverage gaps |
| Fixed (this branch) | Phase 1 — CI + 12 E2E + 7 unit tests |
| Open (residual) | Mutation E2E, boundary tiers, full 104-test matrix |

**Inventory after this branch (`pnpm exec playwright test --list` + `pnpm test:unit`):**

| Layer | Files | Tests |
|-------|-------|-------|
| E2E (Playwright) | `tests/e2e/auth.spec.ts`, `features.spec.ts`, `global.setup.ts` | **12** |
| Unit (Vitest) | `tests/unit/normalizers-and-validators.test.ts` | **7** |
| CI | `.github/workflows/ci.yml` | lint + unit + build + e2e on `main` / `staging` PRs |

---

## What Andika delivered

Commit `affa55c` (2026-06-29, Andika Rafa Akbar):

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Chromium project, `testDir: ./tests`, `webServer` → `pnpm start` |
| `package.json` | `"test:e2e": "playwright test"` |
| `tests/smoke.spec.ts` | 3 auth-gate / login smoke cases |

This satisfies the **letter** of Wave 5 item 12 (“E2E smoke tests”) but not feature-level regression coverage for the 9 production screens he built.

---

## Findings

### High — no authenticated feature E2E coverage

All dashboard routes are protected in `proxy.ts` (`PROTECTED_PREFIXES` lines 16–25). Without `storageState`, global setup, or `page.route` mocks, tests cannot reach feature UI without a live NestJS backend and seed admin.

| Route | Screen owner | Queries / mutations in page | E2E tests | Status |
|-------|--------------|------------------------------|-----------|--------|
| `/login` | Andika | RHF + Zod (`login-form.tsx`) | 3 smoke (weak assertions) | **partial** |
| `/dashboard` | Andika | `dashboardApi` stats + charts | 0 | **open** |
| `/users` | Andika | list + `banMutation` / `unbanMutation` | 0 | **open** |
| `/moderation` | Andika | list + `removeMutation` | 0 | **open** |
| `/disputes` | Andika | list + `resolveMutation` | 0 | **open** |
| `/transactions` | Andika | read-only `ordersApi` | 0 | **open** |
| `/chat` | Andika | polling + send + ban in `chat-room.tsx` | 0 | **open** |
| `/articles` | Andika | 5 mutations (save/publish/unpublish/delete/restore) | 0 | **open** |
| `/settings` | Andika | 4 mutations (profile/password/skills) | 0 | **open** |

**Evidence — mutations with zero test coverage:**

```66:80:app/(dashboard)/users/page.tsx
  const banMutation = useMutation({
    // ...
  });
  const unbanMutation = useMutation({
```

```58:58:app/(dashboard)/disputes/page.tsx
  const resolveMutation = useMutation({
```

```159:252:app/(dashboard)/articles/page.tsx
  const saveMutation = useMutation({
  // ... publishMutation, unpublishMutation, deleteMutation, restoreMutation
```

```75:111:app/(dashboard)/settings/page.tsx
  const updateProfileMutation = useMutation({
  // ... changePasswordMutation, addSkillMutation, deleteSkillMutation
```

---

### High — smoke tests assert too little

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `tests/smoke.spec.ts` | 12–22 | Empty submit only asserts URL stays `/login` — does not check Zod messages (`Password wajib diisi`, `Email tidak valid`) rendered at `login-form.tsx:86–88`, `125–127` | **open** |
| `tests/smoke.spec.ts` | 24–37 | Wrong credentials only asserts URL stays `/login` — no toast (`sonner`) or `AuthError` copy assertion | **open** |
| `tests/smoke.spec.ts` | — | No happy-path login → `/dashboard` redirect | **open** |
| `tests/smoke.spec.ts` | — | No logout (`/api/auth/logout`) or session-cookie gate on all 8 dashboard prefixes | **open** |
| `tests/smoke.spec.ts` | — | No `?redirect=` preservation test (see `proxy.ts` + `login-form.tsx:18–23`) | **open** |

---

### High — Playwright config not CI-ready for feature tests

| File | Lines | Issue | Status |
|------|-------|-------|--------|
| `playwright.config.ts` | 21–26 | `webServer.command: "pnpm start"` requires `pnpm build` first; no `dev` option for local iteration | **open** |
| `playwright.config.ts` | 15–20 | Single `chromium` project — no `globalSetup`, no `storageState`, no `setup` dependency chain | **open** |
| `playwright.config.ts` | — | No `page.route` / mock layer — tests hit real BFF + NestJS (flaky in CI without backend) | **open** |
| `package.json` | 10–15 | Only `test:e2e` script — no `test:unit`, no `test` aggregate, no `playwright install` postinstall | **open** |

---

### Medium — no unit tests for shared pure logic

| Module | Functions / schemas | Consumers | Tests | Status |
|--------|---------------------|-----------|-------|--------|
| `lib/api/normalizers.ts` | `asRecord`, `recordList`, `enumValue`, `numberList`, … (15 exports) | All `lib/api/*` normalisers | 0 | **open** |
| `lib/validators/auth.ts` | `loginSchema` | `login-form.tsx` | 0 | **open** |
| `lib/validators/disputes.ts` | `createResolveDisputeSchema` (partial refund rules) | disputes resolve form | 0 | **open** |
| `lib/validators/articles.ts` | `articleFormSchema`, `articleTagInputSchema` | articles editor | 0 | **open** |
| `lib/validators/settings.ts` | `profileSchema`, `changePasswordSchema`, `addSkillSchema` | settings tabs | 0 | **open** |
| `lib/utils.ts` | `formatCurrency`, `formatDate`, `getErrorMessage` | tables, pages | 0 | **open** |
| `lib/chat-utils.ts` | `formatTime`, `formatDateLabel` | chat UI | 0 | **open** |

**Why it matters:** Audit **08** fixed unsafe casts in normalisers; without unit tests, regressions in `enumValue` / `recordList` will only surface manually or in production.

---

### Medium — UI lacks stable test selectors

Grep across `app/` and `components/` (excluding `.agents/`):

| Selector type | Count (approx.) | Notes | Status |
|---------------|-----------------|-------|--------|
| `data-testid` | **0** | No stable hooks for DataTable rows, modals, tabs | **open** |
| `aria-label` | **2** | `login-form.tsx:112`, `user-detail-dialog.tsx:141` | **open** |

E2E tests must rely on fragile CSS/text locators (e.g. `smoke.spec.ts:16` `button[type='submit']`) or heading copy in Bahasa Indonesia.

---

### Medium — no CI gate

| Item | Status |
|------|--------|
| `.github/workflows/*` | **missing** — `pnpm test:e2e` never runs on PR |
| Vercel preview | build only; no automated smoke on deploy |

---

### Low — planned E2E track not landed

| Location | Content | In repo? |
|----------|---------|----------|
| `.agents/sub_orch_e2e_tests/SCOPE.md` | 104 tests, mock BFF contract | Plan only |
| `.agents/teamwork_preview_worker_e2e_1/handoff.md` | `tests/e2e/auth.spec.ts`, `features1/2`, `boundaries`, etc. | **Not committed** |
| `tests/e2e/` | — | **Directory does not exist** |

Do not treat `.agents/` handoff artifacts as shipped coverage.

---

## Coverage matrix (target vs actual)

Per `SCOPE.md` Tier 1 intent (5 tests × 9 features = 45); actual = **3 total**.

| Feature | Tier 1 cases (planned) | Implemented | Gap |
|---------|------------------------|-------------|-----|
| 1 Login / auth | 5+ | 3 (smoke) | 2+ |
| 2 Dashboard | 5 | 0 | 5 |
| 3 Users | 5 | 0 | 5 |
| 4 Moderation | 5 | 0 | 5 |
| 5 Disputes | 5 | 0 | 5 |
| 6 Transactions | 5 | 0 | 5 |
| 7 Chat | 5 | 0 | 5 |
| 8 Articles | 5 | 0 | 5 |
| 9 Settings | 5 | 0 | 5 |
| **Total** | **45+** | **3** | **42+** |

Boundary (Tier 2), cross-feature (Tier 3), and scenario (Tier 4) tiers: **0 / 94** planned in `SCOPE.md`.

---

## Recommended fix order

### Phase 1 — Make smoke tests meaningful (small PR)

1. Strengthen `tests/smoke.spec.ts` assertions (validation copy, optional mock login).
2. Add `tests/e2e/global.setup.ts` + `playwright/.auth/admin-session.json` with mocked `POST /api/auth/login`.
3. Switch `webServer` to `pnpm dev` for local/CI or document `build && start` in CI job.
4. Add `.github/workflows/e2e.yml` running smoke + auth setup.

### Phase 2 — Mocked feature smoke (one PR per wave)

Follow `.agents/sub_orch_e2e_tests/SCOPE.md`:

1. `tests/e2e/helpers/mock-api.ts` — intercept `/api/proxy/*` and `/api/auth/*`.
2. Tier 1: one happy-path test per route (table renders, key action fires mocked mutation).
3. Prioritise **users ban**, **disputes resolve**, **articles publish** (irreversible / funds).

### Phase 3 — Unit tests for guards

1. Add Vitest + `lib/api/normalizers.test.ts`, `lib/validators/*.test.ts`.
2. Run in CI alongside Playwright smoke.

### Phase 4 — Testability pass (optional, pairs with E2E)

Add `data-testid` to `DataTable`, dialog footers, and settings tab triggers — not required for v1 if role/text locators are documented in test helpers.

---

## Verification (this branch)

```bash
pnpm test:unit          # 7 Vitest cases
pnpm build && CI=true pnpm test:e2e   # 12 Playwright cases (production server)
```

Manual spot-check: all 8 dashboard routes render with mocked API; login validation and failed-login toast asserted.

---

## Residual / wontfix (for now)

| Topic | Notes | Audit |
|-------|-------|-------|
| Backend API contract tests | NestJS repo scope | out of scope |
| Visual regression | Not in requirements v1 | — |
| 104-test full matrix | Defer to phased PRs per `SCOPE.md` | this file |

---

## Related audits

| Audit | Link |
|-------|------|
| Forms (RHF + Zod) | **03** — validators exist but untested |
| API wiring | **04** — mock-api E2E would reuse proxy shapes |
| Destructive actions | **12** — ban/resolve/delete need dialog E2E |
