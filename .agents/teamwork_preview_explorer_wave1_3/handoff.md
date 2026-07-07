# Handoff Report — Wave 1 Explorer 3

## 1. Observation
- Checked project structure and found that `app/globals.css` defines the Tailwind v4 custom theme setup:
  ```css
  @theme inline {
    --color-background: var(--background);
    ...
  }
  ```
- Reviewed `design_handoff_skillmahasiswa_admin/README.md` and observed that the design tokens outline three specific shadow values:
  - `--sh-1: 0 1px 2px rgba(15,23,41,.04), 0 1px 3px rgba(15,23,41,.04)`
  - `--sh-2: 0 4px 12px rgba(15,23,41,.06), 0 2px 4px rgba(15,23,41,.04)`
  - `--sh-3: 0 20px 40px -12px rgba(15,23,41,.18), 0 8px 16px rgba(15,23,41,.06)`
- Observed that in `app/globals.css`, these shadows are missing from the `@theme inline` block.
- Reviewed `design_handoff_skillmahasiswa_admin/src/page_login.jsx` and found that it includes Google SSO:
  ```javascript
  <button type="button" className="btn btn-secondary" style={{ width: "100%", height: 44, justifyContent: "center" }}>
    ... Masuk dengan SSO Google Workspace ...
  </button>
  ```
- Checked ADR 002 (`.docs/adr/002-auth-bff.md` lines 43-44) which states:
  - `access_token` has `Path=/`
  - `refresh_token` has `Path=/api/auth`
- Checked `middleware.ts` requirement from `admin-requirements.md` and noted it must protect all `(dashboard)/*` routes.

## 2. Logic Chain
- Since the shadows `--sh-1`, `--sh-2`, and `--sh-3` are defined in the design tokens but omitted from the Tailwind `@theme inline` block in `globals.css`, classes like `shadow-sh1`, `shadow-sh2`, and `shadow-sh3` will not be compiled. To fix this, they should be added to the `@theme inline` block.
- Product decisions in ADR 001 state that only Email + Password credentials are allowed for admin login and Google SSO is deferred. Therefore, Google SSO must be removed from the proposed `LoginPage` component.
- In Next.js middleware, if a cookie is set with `Path=/api/auth`, the browser will not send that cookie to requests made to `/dashboard`. This means `middleware.ts` cannot read the `refresh_token` cookie. If the 15-minute `access_token` cookie expires, the middleware will assume the user has no session and redirect them to `/login` during page load, even if the 7-day refresh token session is active.
- To resolve this cookie path limitation, the `refresh_token` cookie path should be set to `/` instead of `/api/auth` (or an indicator cookie with `Path=/` should be used) so that `middleware.ts` can correctly identify an active session and let the client-side API client handle the token refresh without kicking the user out of the dashboard.

## 3. Caveats
- Direct execution of the NestJS login and logout endpoints was not tested because the backend is located in a separate repository not included in this workspace. 
- Assumed the NestJS `/auth/refresh` endpoint accepts the refresh token as a Bearer token in the `Authorization` header and/or in the request body as `{ "refreshToken": "..." }`. The proposed code handles both.

## 4. Conclusion
- Wave 1 can be safely implemented using the detailed plan in `analysis.md`.
- Key adjustments to the original specifications include adding shadow tokens to Tailwind config, omitting Google SSO from the Login page, and setting the `refresh_token` path to `/` to ensure robust route protection in `middleware.ts`.

## 5. Verification Method
- **Verification Commands:** Run `pnpm dev` to start the Next.js compilation, and then run `pnpm build` to verify there are no TypeScript or Next.js build errors.
- **Files to Inspect:**
  - `analysis.md` (for the proposed code blocks)
  - `globals.css` (to check the `@theme` block additions)
  - `middleware.ts` (to verify matcher paths)
- **Invalidation Conditions:** The verification is invalid if:
  - The middleware redirects users to `/login` while a valid `refresh_token` cookie is present on the client.
  - Form validation fails to prevent submission of invalid emails or passwords shorter than 6 characters.
