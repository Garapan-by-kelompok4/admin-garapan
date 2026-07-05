# Original User Request

## Initial Request — 2026-06-28T19:03:07Z

Build the front-end admin panel for the GARAPAN IT Freelancer Marketplace using Next.js 15+ (App Router), Tailwind CSS, TypeScript, and shadcn/ui, integrated with the NestJS backend via a Next.js BFF proxy.

Working directory: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan
Integrity mode: development

## Requirements

### R1. Authentication, BFF Proxy, and Route Protection
- Implement Next.js BFF Route Handlers in `app/api/auth/` for login, logout, token refresh, and retrieving the current admin's details.
- Store JWT tokens exclusively in `httpOnly` cookies on the admin domain. Never expose or store tokens in client state (e.g., Zustand, localStorage).
- Implement a catch-all BFF proxy `/api/proxy/[...path]` that reads the access token from the cookie, attaches it as a `Bearer` header, and forwards the request to the NestJS API (using `NESTJS_API_URL`).
- Reject non-`ADMIN` roles at the login BFF handler.
- Guard all `(dashboard)/*` routes via `middleware.ts`, redirecting unauthenticated users to `/login`.
- Manage UI session state (user profile and login status) via a Zustand store, hydrated on load from `/api/auth/me`.

### R2. Layout Shell & Navigation
- Build the main shell (`app/(dashboard)/layout.tsx`) containing a responsive Sidebar and TopBar.
- Sidebar must show grouped navigation per the design handoff (Umum, Manajemen, Komunikasi, Sistem) with active route highlighting and badge counts for pending items (Moderation, Disputes, Chat).
- TopBar must show page breadcrumbs, a search bar (visual only), notification bell dropdown, and a profile pill.
- The product name displayed in the UI must be **GARAPAN** (not "SkillMahasiswa").

### R3. Dashboard Page (`/dashboard`)
- Show stat cards (User Aktif, Transaksi, Pendapatan, Laporan Pending) with visual line sparklines.
- Include a Line Chart for transactions (Nilai transaksi & average) and a Donut Chart for service categories.
- Render the recent activity feed (`GET /admin/activity`) and a quick-link "Perlu Perhatian" panel.

### R4. User Management Page (`/users`)
- Tabs to switch between "Mahasiswa" and "Klien" tables.
- Use a shared `DataTable` component built on TanStack Table v8.
- Wire data to `GET /admin/users` with server-side pagination, search (by name, university, company), and status filter.
- Provide a `PATCH /admin/users/:id/ban` action to ban a user (mapping to a "Suspended" status).
- Detail modal showing read-only profile information, last 5 orders, and report history.

### R5. Content Moderation Page (`/moderation`)
- List flagged services with report counts, owner details, category, and posting date.
- Review modal showing a side-by-side view: service preview/owner details on the left, and list of report reasons on the right.
- Actions to remove a service listing via `PATCH /admin/content/:id/remove` or mark it safe.

### R6. Disputes & Reports Page (`/disputes`)
- Display reported disputes in a filterable data table with priorities (Tinggi, Sedang, Rendah).
- Detail modal showing dispute details, Pelapor and Terlapor cards, and a text description of the issue.
- Resolution flow with a required resolution note textarea and actions for: Refund Penuh, Refund Parsial, Peringatan, and Tolak Laporan via `PATCH /admin/disputes/:id/resolve`.

### R7. Transactions & Escrow Page (`/transactions`)
- Display transactions in a table showing ID, Klien, Mahasiswa, Nominal (formatted in IDR), Escrow Status, and Date.
- Detail modal displaying an interactive step-by-step Escrow Timeline indicating payment status, completion status, or refunds.

### R8. Live Chat Page (`/chat`)
- Three-column layout: Session list (left, with search/filter), Active chat area (center), and User info sidebar (right).
- Enable support-chat communication (`/live-chat-admin`) using 5-second polling.

### R9. Articles CMS Page (`/articles`)
- Display a list of articles (published and drafts).
- Interactive WYSIWYG editor (TipTap) within the same page to create/edit articles, supporting titles, text formatting, and thumbnail uploads.
- Actions to publish and unpublish articles.

### R10. Profile & Settings Page (`/settings`)
- Sub-tabs for: Profile Info, Security (change password), Activity Log, and Master Data (Skills & Kategori CRUD).

### R11. Multi-Commit Guideline
- Do not commit all changes in a single massive commit. The work must be broken down logically (e.g. per wave: Wave 1 Foundation, Wave 2 Core Ops, Wave 3 Content, etc.) with clean, descriptive commit messages.

## Acceptance Criteria

### Authentication & Infrastructure
- [ ] Users without a valid session cookie are redirected to `/login` when trying to access `(dashboard)` paths.
- [ ] Users with a valid session cookie are redirected to `/dashboard` when visiting `/login`.
- [ ] Next.js BFF proxy successfully forwards all `/api/proxy/*` client requests to the NestJS API with the Bearer authorization header attached from the httpOnly cookie.
- [ ] Non-admin user logins are rejected with a 403 status.

### Component & Styling Fidelity
- [ ] Shared `DataTable` component is used on all list pages (users, moderation, disputes, transactions, articles) supporting server-side pagination, search, and filtering.
- [ ] UI layouts, colors, and fonts precisely match the design tokens in the handoff: brand blue (`#2047C9`), Inter font, and Plus Jakarta Sans headers.
- [ ] All prices are formatted in IDR using `Intl.NumberFormat('id-ID')`.
- [ ] No hardcoded tokens or JWT keys are stored in `localStorage` or `sessionStorage`.

### Functionality & Interactivity
- [ ] Login form works with validation and displays appropriate errors.
- [ ] Banning a user changes their status pill to "Suspended" in the UI upon refetching.
- [ ] Content moderation review modal loads report reasons, and removing content updates the table list.
- [ ] Dispute resolution updates the dispute status in the database/UI on success.
- [ ] Live chat polls new messages every 5 seconds when a thread is active, and sends chat messages to the backend.
- [ ] Articles list shows both Published and Draft statuses, and the TipTap editor successfully saves HTML content.

### Git History
- [ ] The Git history shows multiple clean commits corresponding to different waves/phases of implementation.
