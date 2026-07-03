# Handoff Report: Wave 1 (Foundation) Analysis

This report outlines the observations, reasoning, conclusions, and recommended implementation blueprint for Wave 1 (Foundation) of the GARAPAN Admin Panel frontend.

---

## 1. Observation

- **Project Tech Stack**: Confirmed in `package.json` that Next.js is version `"next": "16.2.9"`, `@tailwindcss/postcss` is `"^4"`, and the React version is `"react": "19.2.4"`.
- **CSS Configuration**: Confirmed in `app/globals.css` that theme attributes are defined in a Tailwind v4 `@theme inline` block:
  ```css
  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    ...
  }
  ```
  Observing that the theme currently lacks explicit mappings for some status background and text color variants (e.g. `success-700`, `success-50`, `warn-700`, `warn-50`, `danger-700`, `danger-50`, `info-50`, `info-500`), custom shadows (`--sh-1`, `--sh-2`, `--sh-3`), and the eight Figma avatar gradients (`av-0` to `av-7`).
- **Auth Strategy (BFF)**: Confirmed in `.docs/adr/002-auth-bff.md` lines 14-19:
  > 1. Browser POST /api/auth/login with email + password.
  > 2. Next.js Route Handler calls NestJS POST /auth/login.
  > 3. BFF checks role === ADMIN; reject otherwise (403).
  > 4. BFF sets httpOnly cookies; returns admin profile JSON (no tokens in body).
  - Also, line 43 confirms cookie configurations:
    > access_token:  httpOnly, Secure, SameSite=Lax, Path=/, Max-Age=900
    > refresh_token: httpOnly, Secure, SameSite=Lax, Path=/api/auth, Max-Age=604800
- **Existing Files**: `store/auth-store.ts` already contains:
  ```typescript
  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: "loading",
    ...
  }));
  ```
- **Figma Mockup Design Specs**: In `design_handoff_skillmahasiswa_admin/README.md` lines 27-58:
  - Spec for Login Page `/login` details a 50/50 split layout, a radial gradient hero panel on the left with specific statistics, and a login form on the right containing email and password inputs with specific styling rules. Branding must be updated to **GARAPAN** instead of "SkillMahasiswa" per instructions.

---

## 2. Logic Chain

1. **Tailwind v4 Integration**: Since Next.js uses Tailwind CSS v4, any custom design tokens and components (like status pills, shadows, and avatar gradients) must be declared in `app/globals.css` using Tailwind v4 syntax (`@theme inline` or `@utility`) rather than a traditional `tailwind.config.ts`. Mapped shadow variables (`--shadow-sh-1` etc.) and pill components (`pill`, `pill-success`) directly reflect this.
2. **Security & BFF Architecture**: To enforce httpOnly cookie management and block JWT exposure on the client (per ADR 002), we need four authentication route handlers under `app/api/auth/*` and one wildcard handler under `app/api/proxy/[...path]/route.ts`. The cookies must be set programmatically using Next.js's asynchronous `cookies()` API.
3. **Session Refresh Limitation**: The `refresh_token` cookie is restricted to `Path=/api/auth`. As a result, standard middleware running on `/dashboard` cannot read the refresh token. Therefore, `middleware.ts` must rely purely on checking the presence of the `access_token` cookie. On expiry, client-side requests will hit 401, triggering `apiClient`'s automatic rotation, updating the access token cookie seamlessly. If a hard refresh happens after expiry, the middleware redirects to `/login`.
4. **Layout & Hydration**: The app layout shell (`app/(dashboard)/layout.tsx`) must integrate navigation, responsive drawer styling, search placeholder elements, and profile dropdowns conforming to the Figma specifications. To tie this with BFF, we must use a custom hook (`useAuthHydration`) on mount to call `GET /api/auth/me` and restore Zustand's `user` and `status` variables.

---

## 3. Caveats

- **API Endpoint Availability**: The `GET /admin/me` endpoint is marked as a backend extension gap in `003-api-gaps.md`. In our proposed route handler `app/api/auth/me/route.ts`, we fall back to calling `/auth/profile` (or decode the token if necessary), which will be updated to `/admin/me` when the backend epic #31 is resolved.
- **SSO Google button**: The Figma mockup contains a Google SSO button. However, ADR 002 explicitly states that admin accounts use email + password only. In our login page proposal, we show the Google SSO button as visual-only and marked disabled with a security explanation to align with the security ADR while maintaining design fidelity.

---

## 4. Conclusion

The Next.js 16.2.9 + Tailwind v4 project is primed for the Wave 1 implementation. The concrete proposals for:
1. `app/globals.css` modifications (design tokens, status pills, and gradients)
2. `lib/auth/cookies.ts` cookie manager
3. `app/api/auth/` routes (login, logout, refresh, me)
4. `app/api/proxy/[...path]/route.ts` wildcard proxy
5. `middleware.ts` route protector
6. `app/(dashboard)/layout.tsx` shell & Zustand hydration hook
7. `app/(auth)/login/page.tsx` + `lib/validators/auth.ts` schema and form
address all architectural, styling, and security requirements without any direct modifications to existing files.

---

## 5. Verification Method

Once implemented, the setup can be verified through:
1. **Compilation**: Run `pnpm build` to verify Next.js App Router route generation, TS compiles, and CSS compilation.
2. **Auth Verification**: Login to `admin@garapan.test` / `Password123!` and inspect the browser cookies:
   - Verify `access_token` is `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and expires in 15 minutes.
   - Verify `refresh_token` is `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/api/auth`, and expires in 7 days.
3. **Proxy Test**: Invoke `apiClient('/admin/stats')` and verify the `access_token` cookie is intercepted and injected into the request header as `Authorization: Bearer <token>` to the backend.
4. **Middleware Guard**: Log out and verify that accessing `/dashboard` triggers immediate redirection to `/login?callbackUrl=%2Fdashboard`. Try to access `/login` while logged in and verify automatic redirection to `/dashboard`.
