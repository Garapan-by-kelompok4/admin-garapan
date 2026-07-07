# BRIEFING — 2026-06-29T02:22:17+07:00

## Mission
Implement Wave 1 (Foundation) components of the GARAPAN Admin Panel frontend: scaffold/theme, BFF routes, route protection middleware, Zustand hydration, layout shell, and the login page.

## 🔒 My Identity
- Archetype: Wave 1 Worker (implementer, qa, specialist)
- Roles: implementer, qa, specialist
- Working directory: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_worker_wave1
- Original parent: 3e2b2e62-b65b-493b-9261-1bcf7ea2fc42
- Milestone: Wave 1 Foundation

## 🔒 Key Constraints
- Avoid hardcoding test results or creating facade implementations.
- Maintain real state and produce real behavior.
- Ensure all API calls are made to BFF `/api/proxy` (using `lib/api`) or BFF auth handlers, never directly to NestJS backend on client.
- Follow Tailwind directives correctly.
- Use shadcn/ui and custom components.
- Do not store JWT in Zustand, localStorage, or sessionStorage.

## Current Parent
- Conversation ID: 3e2b2e62-b65b-493b-9261-1bcf7ea2fc42
- Updated: not yet

## Task Summary
- **What to build**: 
  - Scaffold & theme modifications in `app/globals.css`.
  - Server-side cookie manager `lib/auth/cookies.ts`.
  - BFF Auth routes (`/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`).
  - Wildcard proxy BFF route `/api/proxy/[...path]`.
  - Route protection middleware in root `middleware.ts`.
  - Zustand hydration hook `hooks/use-auth-hydration.ts`.
  - Dashboard layout shell `app/(dashboard)/layout.tsx`.
  - Login page `app/(auth)/login/page.tsx` + Zod validator `lib/validators/auth.ts`.
- **Success criteria**:
  - The project builds cleanly with `pnpm build`.
  - Auth flow (login, token refresh, token cookies management, middleware protection) works correctly.
  - Page designs match layout guidelines.
- **Interface contracts**: `.docs/requirements/admin-requirements.md`, `.docs/adr/002-auth-bff.md`, `AGENTS.md`
- **Code layout**: Specified in `AGENTS.md` project structure.

## Key Decisions Made
- Use NestJS API URL environment variable for server-side fetches.
- Use client-side Zustand store only for non-sensitive UI states (`user`, `status`), no tokens.

## Artifact Index
- `c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_worker_wave1\progress.md` — Progress tracker
- `c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_worker_wave1\handoff.md` — Final handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Untested
- **Lint status**: Untested
- **Tests added/modified**: None

## Loaded Skills
- **Source**: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\skills\vercel-react-best-practices\SKILL.md
- **Local copy**: [TBD]
- **Core methodology**: React and Next.js performance optimization guidelines.
