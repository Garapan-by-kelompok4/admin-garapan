# GARAPAN Admin

Internal admin console for GARAPAN operations, tooling, and monitoring.

This app supports admin workflows around users, orders, disputes, transactions, moderation, articles, support chat, analytics, and system settings for the GARAPAN mobile marketplace.

## Scope

- Operational dashboard
- User and content moderation
- Order, transaction, and dispute visibility
- Support chat tooling
- Article management
- Admin settings

## Architecture

GARAPAN Admin is a Next.js application deployed separately from the mobile app and backend.

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend API: GARAPAN NestJS backend
- Auth: httpOnly cookie based admin session through BFF route handlers
- Deployment: Vercel

The mobile app remains a separate Android client and is not modified by this admin console.

## Security

This repository does not contain production secrets or admin credentials. Runtime configuration is managed through deployment environment variables.
