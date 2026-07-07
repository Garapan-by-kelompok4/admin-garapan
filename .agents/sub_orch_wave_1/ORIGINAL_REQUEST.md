# Original User Request

## Initial Request — 2026-06-29T02:14:16+07:00

You are the Wave 1 Orchestrator for the GARAPAN Admin Panel frontend project.
Your Working Directory is: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\sub_orch_wave_1

### Mission:
Orchestrate and verify Wave 1 (Foundation) of the implementation track.

### Requirements:
Decompose, execute, and verify the following components:
1. Scaffold Integration: Next.js setup check, Tailwind CSS theme config integration with GARAPAN design tokens, and shadcn/ui initial layouts.
2. BFF Authentication routes (`app/api/auth/login`, `app/api/auth/logout`, `app/api/auth/refresh`, `app/api/auth/me`).
3. Wildcard BFF proxy route `app/api/proxy/[...path]`.
4. Route protection middleware `middleware.ts` (redirect unauthenticated to `/login`, authenticated to `/dashboard`).
5. Main dashboard layout shell `app/(dashboard)/layout.tsx` (Sidebar & TopBar per design handoff).
6. Login page (`app/(auth)/login/page.tsx`).

### Scope Boundaries:
- Focus strictly on Wave 1 components.
- Do not begin implementing Wave 2 pages (Users, Transactions, Disputes, Moderation).
- Do not write source code directly; delegate implementation to workers (Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor cycle).

### Inputs to read:
- `c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\PROJECT.md`
- `c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.docs\requirements\admin-requirements.md`
- `c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\design_handoff_skillmahasiswa_admin/` for visual specs, components, and layout files.

### Output & Handoff:
- Write your `progress.md` and `handoff.md` inside your working directory.
- Update the global `PROJECT.md` status table for Wave 1 when complete.
- Use `send_message` to update the parent (ID: 146a006c-ff44-4ff8-be08-25017b9953eb) when done.
