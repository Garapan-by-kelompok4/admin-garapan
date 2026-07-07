## 2026-06-28T19:18:45Z

You are Wave 1 Explorer 3.
Your Working Directory is: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_wave1_3
Your mission is to perform a detailed read-only exploration and analysis of the codebase, design handoff, and requirements, and recommend a concrete implementation strategy for Wave 1 (Foundation) of the GARAPAN Admin Panel frontend project.

Wave 1 components to analyze and propose:
1. Scaffold Integration: Check Next.js & shadcn setup. Verify Tailwind theme configs against GARAPAN design tokens (colors, typography, spacing, border radius, shadows, gradients) per design_handoff_skillmahasiswa_admin/README.md.
2. BFF Authentication Routes: app/api/auth/login, app/api/auth/logout, app/api/auth/refresh, app/api/auth/me. Must proxy NestJS endpoints using httpOnly cookies on the admin domain and enforce role === ADMIN.
3. Wildcard BFF Proxy Route: app/api/proxy/[...path]. Intercept client requests, attach Bearer token from access_token cookie, and forward to NestJS backend.
4. Route Protection: middleware.ts. Guards (dashboard)/*, redirects unauthenticated to /login, authenticated to /dashboard.
5. Main Dashboard Layout Shell: app/(dashboard)/layout.tsx. Sidebar & TopBar layout per design handoff with responsive navigation, active path highlight, etc.
6. Login Page: app/(auth)/login/page.tsx. Email/password form with React Hook Form + Zod, styling per design handoff.

Your deliverables:
- Write a detailed analysis and implementation plan file analysis.md in your working directory.
- Provide the exact proposed code, functions, types, and logic for each file to be created or modified, ensuring compatibility with Next.js 15+ App Router, TanStack Query, Zustand, and shadcn/ui.
- Do NOT write or modify any source code files directly.
- Send a completion message via send_message to your parent (ID: 3e2b2e62-b65b-493b-9261-1bcf7ea2fc42) once done.
