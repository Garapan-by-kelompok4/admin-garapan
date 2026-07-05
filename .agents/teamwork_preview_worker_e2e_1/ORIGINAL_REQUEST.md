## 2026-06-29T02:20:44Z
You are the E2E Testing Worker.
Working Directory: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_worker_e2e_1

Your mission is to write and configure the Playwright E2E testing infrastructure and the E2E tests for the GARAPAN Admin Panel frontend project.

Please review the analysis and design files:
- Explorer 1 Analysis: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_e2e_1\analysis.md
- Explorer 2 Analysis: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_e2e_2\analysis.md
- Explorer 3 Analysis: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_e2e_3\analysis.md
- Proposed Mock API: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_e2e_3\proposed_mock-api.ts

Tasks to execute:
1. Configure Playwright E2E testing. Create `playwright.config.ts` at the project root with the chromium project, global setup, and storage path settings.
2. In `package.json`, add a script `"test:e2e": "playwright test"`.
3. Create the test directory `tests/e2e` and helper folders if needed.
4. Implement the test helpers:
   - `tests/e2e/global.setup.ts` to perform authenticated login with mock and cache storageState to `playwright/.auth/admin-session.json`.
   - `tests/e2e/helpers/mock-api.ts`: Adapt `proposed_mock-api.ts` to implement full network routing mocks for all BFF and proxy API calls.
5. Implement the following test suites in `tests/e2e/`:
   - `tests/e2e/auth.spec.ts`: Login/Logout (Feature 1) + Login Boundaries (Boundary 1) (10 tests total).
   - `tests/e2e/features1.spec.ts`: Feature 2-5 (Dashboard, Users, Moderation, Disputes) coverage (20 tests total).
   - `tests/e2e/features2.spec.ts`: Feature 6-9 (Transactions, Chat, Articles, Settings) coverage (20 tests total).
   - `tests/e2e/boundaries.spec.ts`: Feature 2-9 Boundary & Corner cases (40 tests total).
   - `tests/e2e/cross-feature.spec.ts`: Tier 3 Cross-feature combinations (9 tests total).
   - `tests/e2e/scenarios.spec.ts`: Tier 4 Real-world application scenarios (5 tests total).
   Ensure that every single test is fully written with assertions, actions, and uses the `MockApi` class to intercept and mock the appropriate BFF/proxy responses.
6. Verify that all test code compiles. Run the command `pnpm exec playwright test --list` to list all 104 test cases, confirming there are no compilation errors.
7. Create `TEST_INFRA.md` at the project root detailing the setup, feature inventory, layout, and commands.
8. Create `TEST_READY.md` at the project root upon successful listing and test checks, detailing the coverage count, commands, and feature checklist.
9. Write a handoff report at c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_worker_e2e_1\handoff.md summarizing files created and build/list verification output.

MANDATORY INTEGRITY WARNING — include this verbatim in the Worker's dispatch prompt:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.
