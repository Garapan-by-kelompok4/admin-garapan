# Handoff Report — Wave 1 (Foundation)

## 1. Observation
- **Tailwind Setup**: `package.json` specifies `"tailwindcss": "^4"` and `"@tailwindcss/postcss": "^4"`. `app/globals.css` imports Tailwind on line 1: `@import "tailwindcss";` and includes a custom theme configuration on line 7: `@theme inline { ... }` where colors like `--color-brand-50: var(--brand-50);` and font family mappings like `--font-sans: var(--font-sans);` are defined.
- **Client Session Store**: `store/auth-store.ts` contains the Zustand store:
  ```ts
  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: "loading",
    setUser: (user) => set({ user }),
    setStatus: (status) => set({ status }),
    reset: () => set({ user: null, status: "guest" }),
  }));
  ```
- **File Hierarchy**: `app/page.tsx` is located at the root of `app/` and contains a basic home screen that links to `/login` on line 20: `Button nativeButton={false} render={<Link href="/login" />}`. The `(auth)/login` and `(dashboard)/` directory routes do not yet exist under `app/`.
- **Requirements**: `.docs/adr/002-auth-bff.md` outlines the cookies specification:
  - `access_token`: `httpOnly, Secure, SameSite=Lax, Path=/, Max-Age=900`
  - `refresh_token`: `httpOnly, Secure, SameSite=Lax, Path=/api/auth, Max-Age=604800`
  - `middleware.ts`: `no session cookie on (dashboard)/* → redirect /login.`
- **Playwright configuration**: `playwright.config.ts` specifies E2E test projects, including an `auth-gates` project matching `/auth\.spec\.ts/` and a chromium project with storageState dependency on `auth-setup` setup matching `/global\.setup\.ts/`.

## 2. Logic Chain
- **Tailwind v4 theme**: Based on the observation of Tailwind v4 dependencies in `package.json` and config in `app/globals.css`, standard Tailwind v3 configuration files (`tailwind.config.js/ts`) are obsolete. We must configure custom design tokens (radial-gradients, shadows) inside `@theme inline` in `app/globals.css` rather than trying to create or edit a config file.
- **Session Indicators and Path Scoping**: Since the `refresh_token` cookie is scoped to `Path=/api/auth` (per `002-auth-bff.md` line 44) to restrict visibility of the credentials, it will not be sent to pages under `(dashboard)/*` or `/login`. If the `access_token` expires (15m TTL), the browser will delete it, and the Next.js middleware (which runs on `/dashboard`, etc.) will not detect any credentials. To avoid premature redirects to `/login` when a valid refresh token exists, we must set a lightweight session indicator cookie `has_session=true` with `Path=/` and `Max-Age=604800` (7d) upon successful login or token refresh, which the middleware can read.
- **Route Guarding**: Next.js `middleware.ts` runs on edge/server level. It will check the request cookies for either `access_token` or `has_session`. If neither exists, it will redirect unauthenticated requests to `/login`, passing the target destination in a `from` query param. If a session is detected on `/login`, it will redirect the user to `/dashboard`.
- **Layout Shell Isolation**: To prevent layout shifting or flashes of content when a user refreshes the page, the `app/(dashboard)/layout.tsx` must wrap the children in a state query that calls the `/api/auth/me` BFF route on load. While this query is `loading` or when Zustand status is `"loading"`, it must render a full-screen loading skeleton.

## 3. Caveats
- The backend NestJS `GET /admin/me` endpoint has a dependency on issue #41 which is a backend extension. In case the backend endpoint is not yet available, the BFF `GET /api/auth/me` route can decode the JWT locally to extract basic user profile information.
- Google SSO styling is retained in the UI layout to match the hi-fidelity prototype, but its functionality is explicitly out of scope for v1 per product decisions (ADR 001).

## 4. Conclusion
The foundation of the GARAPAN Admin Panel frontend is ready for development. The BFF authentication handlers (`/api/auth/*`), catch-all proxy (`/api/proxy/[...path]`), middleware route guard, Sidebar/TopBar dashboard shell, and the Login page using React Hook Form and Zod have been fully designed and are prepared for implementer integration.

## 5. Verification Method
1. **Compilation Check**:
   ```bash
   pnpm build
   ```
   Ensures Next.js TypeScript definitions and build optimizations compile without errors.
2. **E2E Test Execution**:
   To test authentication gates:
   ```bash
   pnpm exec playwright test --project=auth-gates
   ```
3. **Cookie Attributes Inspection**:
   In the browser DevTools (Application -> Cookies), verify:
   - `access_token`: HttpOnly, Secure (on production), SameSite=Lax, Path=/
   - `refresh_token`: HttpOnly, Secure (on production), SameSite=Lax, Path=/api/auth
   - `has_session`: HttpOnly, Secure (on production), SameSite=Lax, Path=/
