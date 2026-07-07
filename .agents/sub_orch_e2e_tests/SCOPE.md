# Scope: E2E Testing Track

## Architecture
- Playwright E2E test suite running against the Next.js frontend app.
- Tests will simulate user actions, click through pages, inspect elements, verify data table interactions, modals, chat input, article editing form submission, and route guards.
- Mocking: We will mock the backend API proxy endpoints `/api/proxy/*` and BFF auth endpoints `/api/auth/*` using Playwright's `page.route` to intercept all network requests. This ensures tests are stable, self-contained, and run without a live NestJS server.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Playwright Setup & Tier 1 Tests | Playwright config, test helpers, and Tier 1: Feature Coverage (45 tests across 9 features) | None | PLANNED |
| 2 | Tier 2 Boundary Tests | Tier 2: Boundary & Corner Cases (45 tests across 9 features) | M1 | PLANNED |
| 3 | Tier 3 Cross-Feature Tests | Tier 3: Cross-Feature Combinations (9 tests) | M2 | PLANNED |
| 4 | Tier 4 Scenario Tests | Tier 4: Real-World Application Scenarios (5 tests) | M3 | PLANNED |

## Interface Contracts
- Playwright test runner invocation: `pnpm exec playwright test`
- Mock API structure for BFF proxy and Auth:
  - Auth: `POST /api/auth/login` returns status 200 `{ user: { email: 'admin@garapan.test', role: 'ADMIN', nama: 'Super Admin' } }` or 401/403.
  - Users: `GET /api/proxy/admin/users` returns paginated users list.
  - Moderation: `GET /api/proxy/admin/content` returns flagged content list.
  - Disputes: `GET /api/proxy/admin/disputes` returns disputes list.
  - Transactions: `GET /api/proxy/admin/orders` returns orders list.
  - Live chat: `GET /api/proxy/live-chat-admin` returns active chat threads.
  - Articles: `GET /api/proxy/admin/artikel` returns articles.
