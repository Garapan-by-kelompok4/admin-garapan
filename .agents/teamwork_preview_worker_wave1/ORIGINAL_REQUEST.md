## 2026-06-29T02:22:17+07:00
You are the Wave 1 Worker.
Your Working Directory is: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_worker_wave1

Your task is to implement the Wave 1 (Foundation) components of the GARAPAN Admin Panel frontend project, based on the Explorer analysis found in:
c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_wave1_1\analysis.md

Here is the implementation scope:
1. Scaffold & Theme:
   - Edit `app/globals.css` to add the custom shadows (`--shadow-sh-1` etc.), custom status colors (`success-50`, `success-700`, `warn-50`, `warn-700`, `danger-50`, `danger-700`, `info-50`, `info-500`), avatar gradients (`av-0` to `av-7`), and the status pills (`pill`, `pill-dot`, `pill-success` etc.) under Tailwind v4 directives.
2. Cookie Manager:
   - Create `lib/auth/cookies.ts` as a server-side cookie manager using async `cookies()` from Next.js.
3. BFF Auth Handlers:
   - Create `app/api/auth/login/route.ts` (proxies backend `/auth/login`, enforces role === ADMIN, checks requiresTwoFactor, sets httpOnly cookies).
   - Create `app/api/auth/logout/route.ts` (clears cookies, calls backend `/auth/logout`).
   - Create `app/api/auth/refresh/route.ts` (refreshes tokens, resets cookies).
   - Create `app/api/auth/me/route.ts` (proxies backend `/auth/profile`, checks role === ADMIN, returns user data).
4. Wildcard BFF Proxy:
   - Create `app/api/proxy/[...path]/route.ts` (reads access_token cookie, forwards client calls to `NESTJS_API_URL` with Authorization Bearer header, handling query params and body).
5. Route Protection:
   - Create `middleware.ts` in the project root to redirect unauthenticated requests on `(dashboard)/*` and `/` to `/login`, and redirect authenticated requests on `/login` to `/dashboard`.
6. Zustand Hydration:
   - Create `hooks/use-auth-hydration.ts` to fetch `/api/auth/me` on mount and set Zustand store state.
7. Layout Shell:
   - Create `app/(dashboard)/layout.tsx` (sticky 248px Sidebar, 62px backdrop-blur TopBar, breadcrumbs, search bar, dropdown notifications, user profile pill, and mobile menu support).
8. Login Page:
   - Create Zod validator `lib/validators/auth.ts`.
   - Create `app/(auth)/login/page.tsx` (using React Hook Form + Zod validation, visual-only disabled Google SSO, 50/50 hero-form split matching layout/styling per design handoff).
