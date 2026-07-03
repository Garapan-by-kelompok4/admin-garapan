# Handoff Report: E2E Test Strategy & Mock API Design

## 1. Observation
- Investigated `design_handoff_skillmahasiswa_admin/README.md` and observed detailed definitions of the 9 routes, styling design tokens, and components (e.g., page 1 Login, page 2 Dashboard, page 3 Users).
- Observed in `design_handoff_skillmahasiswa_admin/src/data.jsx` the mock models and data formats for `MAHASISWA`, `KLIEN`, `LAPORAN`, `KONTEN_FLAG`, `TRANSAKSI`, `ARTIKEL`, `CHAT_SESSIONS`, `CHAT_MESSAGES`, and `NOTIF`.
- Observed in `.docs/adr/001-product-scope.md` that:
  - "Product name in UI: **GARAPAN** (not SkillMahasiswa from the design prototype)." (lines 13-14)
  - "Users: ban only via `PATCH /admin/users/:id/ban` — no softer 'suspend' state." (line 31)
  - "Drop NIM & Prodi columns — not in Prisma or mobile registration." (line 36)
  - "Transactions: Read-only escrow monitor — no release/refund from this page. Fund resolution only via Disputes." (lines 43-44)
- Observed in `.docs/adr/002-auth-bff.md` that the Next.js BFF acts as a proxy for the NestJS API setting httpOnly session cookies (`access_token` and `refresh_token`), protecting `(dashboard)` routes via `middleware.ts`.
- Observed in `.docs/adr/003-api-gaps.md` the priority and endpoints for the API gap issues (#32 to #45) mapped to admin pages.

## 2. Logic Chain
- **Step 1 (Scope Mapping)**: Based on the constraints in `001-product-scope.md` (read-only transactions, ban-only users, drop NIM/Prodi), the E2E tests must verify this reduced set of fields and actions, rather than the more extensive visual items in the design handoff (Observation 3).
- **Step 2 (Cross-Feature Interaction Identification)**: Since the backend propagates state transitions (e.g., banning a user triggers listing removal), our E2E design needs to specify 9 test cases tracking these transitions between users, moderation, and chat views.
- **Step 3 (Real-World Workflows)**: By modeling workflows such as the Daily Ops Routine or Chat Escalation, we mimic an administrator's multi-page actions, ensuring page navigation and states persist across route transitions guarded by Next.js BFF middleware (Observation 4).
- **Step 4 (Mocking Helper Design)**: Playwright intercept paths must mirror the BFF/proxy routes identified in `002-auth-bff.md` and the NestJS admin endpoints in `003-api-gaps.md` (Observation 5). Thus, `tests/helpers/mock-api.ts` was drafted to cover all REST endpoints with compliant payloads.

## 3. Caveats
- Banned users' list updates, listing deletions, and escrow transitions are assumed to be handled immediately by the backend upon calling the respective mutation endpoints.
- Websocket support for live-chat is deferred in v1; E2E tests assume a polling strategy of 5s.

## 4. Conclusion
We have completed a full E2E testing design tier mapping and drafted the `tests/helpers/mock-api.ts` file in the agent folder. We established:
- 9 Cross-Feature Combination test cases (Design Tier 3).
- 5 Real-World Application workflows (Design Tier 4).
- A unified mock API helper containing the default data payloads matching Figma exports adapted for the GARAPAN schema.

## 5. Verification Method
- **Mock file inspection**: Inspect the drafted test helper code at `c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_e2e_3\proposed_mock-api.ts`.
- **E2E Strategy inspection**: Inspect findings and assertions detail at `c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_e2e_3\analysis.md`.
- **Build verification**:
  ```powershell
  pnpm build
  ```
