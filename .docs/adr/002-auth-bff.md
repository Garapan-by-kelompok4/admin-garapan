# ADR 002: Admin authentication via Next.js BFF + httpOnly cookies

**Status:** Accepted  
**Date:** 2026-06-26  
**Context:** Admin on Vercel, API on Railway; mobile uses Bearer JWT unchanged

## Decision

Admin authentication uses a **Next.js BFF (Route Handlers)** that proxies NestJS auth and sets **httpOnly cookies** on the admin domain. Client components **never** store or read JWT access/refresh tokens.

Mobile continues using `Authorization: Bearer` from the existing `POST /auth/login` JSON response — **no backend auth changes required for mobile**.

### Login flow

1. Browser `POST /api/auth/login` with email + password.
2. Next.js Route Handler calls NestJS `POST /auth/login`.
3. BFF checks `role === ADMIN`; reject otherwise (403).
4. BFF sets httpOnly cookies; returns admin profile JSON (no tokens in body).
5. Zustand stores `{ user, status }` only.

### NestJS endpoint

- **Reuse** `POST /auth/login` — no dedicated `/auth/admin/login`.
- **Reuse** `POST /auth/refresh` and `POST /auth/logout` from BFF (server-side).

### 2FA

- **No admin 2FA in v1.**
- Seed admin keeps `twoFactorEnabled: false`.
- If login returns `requiresTwoFactor: true`, BFF returns an error — admin OTP flow deferred.

### Session policy

| Setting | Value |
|---------|--------|
| Access token TTL | **15m** (backend default) |
| Refresh token TTL | **7d** (backend default) |
| Concurrent sessions | **Allowed** (no forced single-session) |

### Cookie attributes (production)

```
access_token:  httpOnly, Secure, SameSite=Lax, Path=/, Max-Age=900
refresh_token: httpOnly, Secure, SameSite=Lax, Path=/api/auth, Max-Age=604800
```

### Route protection

- **`middleware.ts`**: no session cookie on `(dashboard)/*` → redirect `/login`.
- Authenticated user on `/login` → redirect `/dashboard`.
- API calls from client: `/api/proxy/[...path]` with `credentials: 'include'`.
- BFF attaches `Authorization: Bearer <access_token>` to NestJS server-side.

### 401 / ban handling

- On 401 from proxy: attempt `POST /api/auth/refresh` once → retry.
- Refresh failure: clear cookies, Zustand logout, redirect `/login`.
- Banned user (`bannedAt` set): NestJS rejects JWT → show toast *“Akun ditangguhkan”* and redirect login.

### Environments

| Env | Admin URL | API URL (`NESTJS_API_URL`, server-only) |
|-----|-----------|----------------------------------------|
| Local | `http://localhost:3000` (Next) | `http://localhost:3000` (NestJS) |
| Production | e.g. `https://admin.garapan.id` | e.g. `https://api.garapan.id` |

`NEXT_PUBLIC_APP_URL` for client-visible app origin. Client must **not** call `NESTJS_API_URL` directly.

### BFF routes (Next.js)

| Route | Purpose |
|-------|---------|
| `POST /api/auth/login` | Proxy login + set cookies |
| `POST /api/auth/logout` | Clear cookies + revoke refresh |
| `POST /api/auth/refresh` | Rotate tokens + update cookies |
| `GET /api/auth/me` | Hydrate admin UI |
| `/api/proxy/[...path]` | Authenticated NestJS proxy |

## Consequences

- XSS cannot exfiltrate tokens from `localStorage` (tokens not stored client-side).
- Cross-origin cookie issues avoided — cookies live on admin domain only.
- Slight latency from proxy hop; acceptable for internal admin tool.
- Production CORS on NestJS may need `credentials: true` for dev direct calls (GitHub #45).

## Related

- `admin-requirements.md` — Auth & Route Protection
- ADR 001 (product scope)
- Backend: `src/auth/auth.controller.ts`, `src/auth/strategies/jwt.strategy.ts`
