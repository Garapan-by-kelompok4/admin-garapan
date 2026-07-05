# Scope: Wave 1 (Foundation)

## Architecture
- **Next.js 15+ BFF (Backend-For-Frontend)**:
  - All client requests to the backend API are proxied via `app/api/proxy/[...path]/route.ts`.
  - Secure httpOnly cookie session management via `app/api/auth/*` routes.
- **Client Session Store**:
  - Zustand stores UI-facing user metadata only (`user`, `status`). No raw JWT tokens.
- **Route Protection**:
  - `middleware.ts` checks auth cookies and guards the `(dashboard)/*` routes.
- **Theme & UI**:
  - Tailwind CSS integrates custom GARAPAN design tokens (colors, typography, radii, shadows, avatar gradients).
  - shadcn/ui components for primitives.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| 1 | M1.1: Scaffold & Theme | Next.js setup check, Tailwind custom tokens integration, layout verification. | None | `PLANNED` | |
| 2 | M1.2: BFF Auth Routes | Implement login, logout, refresh, and me Route Handlers with httpOnly cookies. | M1.1 | `PLANNED` | |
| 3 | M1.3: BFF Wildcard Proxy | Implement `/api/proxy/[...path]` proxying requests with Authorization Bearer header. | M1.2 | `PLANNED` | |
| 4 | M1.4: Route Protection | Implement `middleware.ts` to redirect authenticated/unauthenticated users. | M1.3 | `PLANNED` | |
| 5 | M1.5: Dashboard Shell | Implement Sidebar + TopBar dashboard layout shell (`app/(dashboard)/layout.tsx`). | M1.1 | `PLANNED` | |
| 6 | M1.6: Login Screen | Implement email/password Login screen (`app/(auth)/login/page.tsx`) per design handoff. | M1.2, M1.4 | `PLANNED` | |

## Interface Contracts
### BFF Auth API
- `POST /api/auth/login` -> Request: `{ email, password }`. Sets `access_token` (15m, httpOnly, Lax) and `refresh_token` (7d, httpOnly, Lax, path `/api/auth`) cookies. Returns `{ user: AdminUser }`.
- `POST /api/auth/logout` -> Clears cookies and revokes session.
- `POST /api/auth/refresh` -> Rotates access/refresh tokens.
- `GET /api/auth/me` -> Retrieves authenticated user metadata.

### BFF Proxy
- `ALL /api/proxy/[...path]` -> Reads `access_token` from cookie, adds `Authorization: Bearer <token>`, and forwards to `NESTJS_API_URL`.
