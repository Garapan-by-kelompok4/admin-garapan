# E2E Test Strategy & API Mocking Design Report

## 1. Executive Summary & Design Handoff Investigation

### 1.1 Overview of Design Handoff
An investigation of the `design_handoff_skillmahasiswa_admin` directory was conducted. The prototype consists of 9 key screens:
1. **Login (`/login`)**: Email & password authentication with layout split 50/50.
2. **Dashboard (`/dashboard`)**: Central metrics dashboard with 4 stats cards (Total User Aktif, Transaksi Bulan Ini, Platform Revenue, Laporan Pending), charts, and activity feeds.
3. **Manajemen User (`/users`)**: Tabbed table viewing students (Mahasiswa) and clients (Klien) with advanced filtering, status badges, and detail modals.
4. **Moderasi Konten (`/moderation`)**: Summary metric cards and a table of flagged services (Jasa). It includes review modals for content removal or marking as safe.
5. **Dispute & Laporan (`/disputes`)**: Ticket list of disputes, prioritised, with detail modals and resolution flows.
6. **Transaksi & Escrow (`/transactions`)**: Read-only listing of all escrow payments, timeline statuses, and detail timelines.
7. **Live Chat (`/chat`)**: 3-column support chat (session list, chat dialogue, and target user information panel).
8. **Artikel & Blog (`/articles`)**: Article CMS with lists and a WYSIWYG editor (TipTap).
9. **Profil & Settings (`/settings`)**: Tabbed panels for profile info, security/password, notification matrices, team settings, and activity logs.

### 1.2 Core Product Constraints & Scope Adjustments (ADR 001/002/003)
During implementation of E2E tests, several design visual items must be reconciled with backend constraints and product scope decisions:
- **Branding**: The prototype uses "SkillMahasiswa", but the production application is branded **GARAPAN**.
- **User status mapping**:
  - **Pending** maps to `emailVerified === false`.
  - **Aktif** maps to `emailVerified === true && bannedAt === null`.
  - **Suspended** maps to `bannedAt !== null` (there is no temporary suspension, only permanent ban).
- **Users**: No NIM and Prodi are stored in the production backend schema or registration; they are replaced by `university` and `rating` for Mahasiswa, and `company` for Klien.
- **Transactions & Escrow**: This page is **read-only**. Admin does not release or refund funds here; fund resolution is strictly handled through the **Disputes** details page.
- **Disputes**: Priority is derived on the fly based on age and amount. Laporan contains only text reasons, and no attachment evidence is shown in v1 (evidence UI is hidden).
- **Live Chat**: Only support chat is active (`/live-chat-admin`); the per-order Socket.io chat is deferred. Polling is set to 5s.
- **Settings**: Hidden tabs for v1 include team permissions and notification preference matrix.
- **Security**: Access/refresh tokens are stored strictly in httpOnly cookies managed by the Next.js BFF Route Handlers. Zustand only holds the state indicating authentication.

---

## 2. Design Tier 3: Cross-Feature Combinations (9 Test Cases)

### Test Case 1: Ban Mahasiswa -> Moderation & Chat Disabling
* **Description**: Verify that banning a Mahasiswa user on `/users` immediately marks their listings as "Dihapus" in `/moderation` and disables their active support chat on `/chat`.
* **UI Actions**:
  1. Login and navigate to `/users` page.
  2. Search for student "Bagas Aditya Pratama" (ID: `MH-2045`).
  3. Click "More/Actions" and select "Blokir/Ban". Confirm in the dialog.
  4. Navigate to `/moderation` page.
  5. Search for "Bagas Aditya Pratama" or his service "Mobile App Android Kotlin". Verify status is updated.
  6. Navigate to `/chat` page.
  7. Select Bagas's support chat. Verify chat input is disabled and shows "Sesi chat ditutup karena user telah diblokir."
* **API Intercept Mocks**:
  - `PATCH /api/proxy/admin/users/MH-2045/ban` returns `{ success: true, bannedAt: "2026-06-29T02:18:22Z" }`.
  - Subsequent `GET /api/proxy/admin/content` returns listing `JS-1918` with status `"Dihapus"`.
  - Subsequent `GET /api/proxy/live-chat-admin/MH-2045` returns chat history, but any `POST` to send messages returns `403 Forbidden`.
* **Expected Assertions**:
  - Verify toast *"User berhasil diblokir"* appears.
  - Assert that `td.status-cell` for `JS-1918` on `/moderation` contains status badge "Dihapus" (red).
  - Assert that `textarea` on `/chat` has the `disabled` attribute and the warning banner is visible.

### Test Case 2: Resolve Dispute with REFUND -> Transaction Status & Escrow Metrics
* **Description**: Verify resolving a dispute with a `REFUND` outcome updates the transaction status to "Refund" and updates the platform transactions metric.
* **UI Actions**:
  1. Navigate to `/disputes` page.
  2. Click "Detail" on dispute `LP-0415` (Andika Surya vs Rizky A. Putra).
  3. Type in resolution textarea: "Mahasiswa gagal memenuhi kriteria brief dan tidak mengirimkan revisi dalam 3 hari."
  4. Select resolution action: "Refund Penuh ke Klien".
  5. Click "Tutup Laporan/Selesai".
  6. Navigate to `/transactions` page.
  7. Locate transaction `TRX-84201`. Check status.
* **API Intercept Mocks**:
  - `PATCH /api/proxy/admin/disputes/LP-0415/resolve` with `{ outcome: 'REFUND', resolutionNote: '...' }` returns `{ success: true }`.
  - Subsequent `GET /api/proxy/admin/orders` returns `TRX-84201` with status `"Refund"`.
  - Subsequent `GET /api/proxy/admin/stats` reflects increased Platform Refund sum.
* **Expected Assertions**:
  - Assert dispute detail modal closes and toast shows *"Dispute berhasil diselesaikan"*.
  - Assert status pill on transaction `TRX-84201` on `/transactions` displays "Refund" (danger red).
  - Assert the "Refund" metric card value on `/transactions` dashboard header increments by the transaction amount.

### Test Case 3: Resolve Dispute with RELEASE -> Platform Revenue Increase
* **Description**: Verify resolving a dispute with `RELEASE` updates the transaction to "Dicairkan" and increases the platform's completed transactions and revenue metrics.
* **UI Actions**:
  1. Navigate to `/disputes` page.
  2. Click "Detail" on dispute `LP-0415`.
  3. Enter resolution note: "Hasil pekerjaan terverifikasi sesuai brief. Dana dilepas ke Mahasiswa."
  4. Select resolution action: "Cairkan Dana ke Mahasiswa".
  5. Click "Tutup Laporan/Selesai".
  6. Navigate to `/dashboard` page and observe "Total Pendapatan Selesai" card.
* **API Intercept Mocks**:
  - `PATCH /api/proxy/admin/disputes/LP-0415/resolve` with `{ outcome: 'RELEASE', resolutionNote: '...' }` returns `{ success: true }`.
  - Subsequent `GET /api/proxy/admin/stats` returns platform revenue updated with commission from the resolved order.
* **Expected Assertions**:
  - Assert dispute status changes to "Selesai" (success green).
  - Navigate to `/transactions` and verify `TRX-84201` status pill shows "Dicairkan".
  - Assert dashboard revenue card displays the updated value (e.g. `Rp 328,7 jt`).

### Test Case 4: Publish Article -> Dashboard Activity Log & Settings Log updates
* **Description**: Verify writing and publishing a new article updates the platform activity feed and is logged in the system settings log.
* **UI Actions**:
  1. Navigate to `/articles` page.
  2. Click "Buat Artikel Baru".
  3. Fill Title: "Panduan Menjaga Keamanan Escrow di GARAPAN".
  4. Select Category: "Panduan".
  5. Type content in editor and click "Publikasikan".
  6. Navigate to `/settings` -> "Log Aktivitas" sub-tab.
  7. Navigate to `/dashboard`.
* **API Intercept Mocks**:
  - `POST /api/proxy/artikel` returns `{ id: "ART-022", status: "Draft" }`.
  - `PATCH /api/proxy/artikel/ART-022/publish` returns `{ id: "ART-022", status: "Published" }`.
  - `GET /api/proxy/admin/activity` returns a new log entry: `{ type: "system", text: "Adinda Rahmawati mempublikasikan artikel: Panduan Menjaga Keamanan Escrow di GARAPAN", time: "baru saja" }`.
* **Expected Assertions**:
  - Assert that article status is "Published" in the articles table.
  - Assert settings activity log contains the item "Adinda Rahmawati mempublikasikan artikel: Panduan Menjaga Keamanan Escrow di GARAPAN".
  - Assert dashboard "Aktivitas Terbaru" list has the top item displaying the system event.

### Test Case 5: Remove Flagged Jasa -> Moderation Status & Dashboard Activity
* **Description**: Verify that clicking "Hapus Jasa" on a flagged listing updates its status in `/moderation` and appends a log entry to the activity feed.
* **UI Actions**:
  1. Navigate to `/moderation` page.
  2. Click "Review" on flagged Jasa "Jasa Pembuatan Website Company Profile Full Package" (ID: `JS-1921`).
  3. Click "Hapus Jasa" in the review modal footer.
  4. Navigate to `/dashboard` to verify activity feed.
* **API Intercept Mocks**:
  - `PATCH /api/proxy/admin/content/JS-1921/remove` returns `{ success: true, status: "Dihapus" }`.
  - `GET /api/proxy/admin/activity` returns a new log entry: `{ type: "report", text: "Konten dihapus oleh moderator: Jasa Pembuatan Website Company Profile Full Package", time: "baru saja" }`.
* **Expected Assertions**:
  - Verify toast *"Konten berhasil dihapus"* is shown.
  - Assert listing status on `/moderation` updates to "Dihapus" (red).
  - Verify dashboard activity feed shows the deletion event.

### Test Case 6: Ban Klien -> Escrow Transactions Preservation & Disabled Chat
* **Description**: Verify that banning a Klien user blocks their support chat and flags their active escrow transactions with a warning without auto-releasing funds.
* **UI Actions**:
  1. Navigate to `/users` -> "Klien" tab.
  2. Search and click "Blokir" on Klien "Andika Surya" (ID: `CL-0918`).
  3. Click confirm.
  4. Navigate to `/transactions`. Verify transaction `TRX-84201` related to Klien.
  5. Navigate to `/chat`. Select Andika Surya.
* **API Intercept Mocks**:
  - `PATCH /api/proxy/admin/users/CL-0918/ban` returns success.
  - `GET /api/proxy/admin/orders` returns Klien orders with warning indicators.
* **Expected Assertions**:
  - Assert Klien status shows "Suspended" in users list.
  - Assert that chat input is disabled on the chat screen with banned banner.
  - Assert escrow transaction `TRX-84201` displays a warning icon next to the client's name indicating a suspended user.

### Test Case 7: Create Kategori -> Article Editor & Moderation Filters Integration
* **Description**: Verify that adding a new category in settings immediately populates options in the article creator and moderation filter options.
* **UI Actions**:
  1. Navigate to `/settings` -> "Skills & Kategori" sub-tab.
  2. Click "Tambah Kategori Baru". Type "Cybersecurity" and click save.
  3. Navigate to `/articles`. Click "Buat Artikel Baru". Click "Kategori" select dropdown.
  4. Navigate to `/moderation` and click "Kategori" filter dropdown.
* **API Intercept Mocks**:
  - `POST /api/proxy/admin/kategori` returns success.
  - `GET /api/proxy/admin/kategori` includes the new category `{ id: "cat-cyber", name: "Cybersecurity" }`.
* **Expected Assertions**:
  - Verify toast *"Kategori berhasil ditambahkan"*.
  - Assert that the category select dropdown on `/articles` contains the option "Cybersecurity".
  - Assert that the filter dropdown on `/moderation` contains the option "Cybersecurity".

### Test Case 8: Update Admin Profile -> Instant TopBar & Sidebar Sync
* **Description**: Verify that editing the admin's name in settings updates the navigation panel details immediately and records the update in the activity log.
* **UI Actions**:
  1. Navigate to `/settings` -> "Informasi Profil".
  2. Change "Nama Lengkap" to "Adinda R. Yusuf".
  3. Click "Simpan Perubahan".
  4. Check the Sidebar footer profile name.
  5. Check the TopBar profile pill.
* **API Intercept Mocks**:
  - `PATCH /api/proxy/admin/me` with `{ fullName: 'Adinda R. Yusuf' }` returns `{ id: 'ADM-001', fullName: 'Adinda R. Yusuf', ... }`.
  - `GET /api/proxy/admin/me` returns the updated name.
* **Expected Assertions**:
  - Verify toast *"Profil berhasil diperbarui"*.
  - Assert Sidebar footer admin name text equals "Adinda R. Yusuf".
  - Assert TopBar profile pill displays "Adinda R. Yusuf".
  - Assert `/settings` Activity Log shows "Anda memperbarui informasi profil".

### Test Case 9: Live Chat Notification -> Sidebar & TopBar Badges Update
* **Description**: Verify that a new chat message received in the background increments the support chat count badge in the sidebar and trigger a topbar notification.
* **UI Actions**:
  1. Navigate to `/dashboard` (or any other page).
  2. Background event: New incoming chat message is received from a user.
  3. Check the badge count next to "Live Chat" in the Sidebar.
  4. Check the red dot on the Bell icon in the TopBar.
  5. Click the Bell icon and verify the notification item.
* **API Intercept Mocks**:
  - Polling `GET /api/proxy/live-chat-admin` returns a session with incremented `unread: 3`.
  - Polling notifications returns new chat message entry.
* **Expected Assertions**:
  - Assert the Sidebar Live Chat badge text is visible and reads "3" (or incremented count).
  - Assert TopBar notification red dot is visible.
  - Assert TopBar notification dropdown contains "Andika Surya mengirimkan pesan baru".

---

## 3. Design Tier 4: Real-World Application Scenarios (5 Workflows)

### Workflow 1: Complete Admin Daily Ops Routine
* **Scenario Description**: Admin logs in, reviews stats, resolves pending reports/disputes, audits content flags, and updates general skills database.
* **E2E Steps**:
  1. **Login**: Go to `/login`, enter `admin@garapan.test` and `Password123!`, click Login.
  2. **Audit Stats**: Verify redirected to `/dashboard`. Check total active users (`16.284`) and pending reports (`27`).
  3. **Verify Users**: Navigate to `/users`. Check "Pending" tab, select "Bagas Aditya Pratama", click details, audit email status, and close.
  4. **Moderate Listing**: Navigate to `/moderation`. Review flagged listing `JS-1921` (3 reports). Click "Tandai Aman" after audit.
  5. **Resolve Dispute**: Navigate to `/disputes`. Click "Detail" on dispute `LP-0415`. Add resolution note: "Telah disepakati refund.", choose "Refund Penuh", and click close dispute.
  6. **Update Skills**: Navigate to `/settings` -> "Skills & Kategori". Add a new skill "Next.js".
  7. **Verify Log**: Click "Log Aktivitas". Verify all operations (Mark Jasa Safe, Resolve Dispute, Add Skill) are correctly recorded.
* **API Intercept Mocks**:
  - Full suite of `MockApi.setupDefaultMocks()` is utilized.
  - Specific mutations like `PATCH /admin/users/...`, `PATCH /admin/disputes/.../resolve`, `POST /admin/skills` are stubbed to return 200 OK.
* **Expected Assertions**:
  - Assert URL is `/dashboard` after login.
  - Assert dispute status pill changes to "Selesai" on table.
  - Assert "Next.js" is listed under skills list.
  - Assert activity log contains 3 new entries matching the steps.

### Workflow 2: Dispute Mediation with Chat History Audit
* **Scenario Description**: Resolving a complex dispute where the admin must read both parties' claims and audit chat logs to determine fault before refunding.
* **E2E Steps**:
  1. Navigate to `/disputes`.
  2. Filter table by status: "Terbuka" and priority: "Tinggi".
  3. Click "Detail" on dispute `LP-0415` (Andika Surya vs Rizky A. Putra).
  4. Read the dispute reason: "Hasil pengerjaan website tidak responsif...".
  5. Notice the button "Buka Sesi Chat Support" in the pelapor/terlapor card. Click it for Andika Surya.
  6. Admin is redirected to `/chat` with Andika Surya's session automatically selected.
  7. Read chat log to verify Klien's claim ("Klien menyatakan sudah 3 hari tidak dihubungi").
  8. Navigate back to `/disputes` -> select `LP-0415` details.
  9. In "Tindak Lanjut", type: "Mahasiswa terbukti melanggar SLA dan tidak merespons chat klien. Refund diproses penuh ke klien."
  10. Select "Refund Penuh" and submit.
  11. Navigate to `/transactions` and check status of `TRX-84201`.
* **API Intercept Mocks**:
  - `GET /api/proxy/admin/disputes/LP-0415` returns dispute details linked to `pesananId: TRX-84201`.
  - `GET /api/proxy/live-chat-admin/CL-0918` returns messages proving communication breakdown.
  - `PATCH /api/proxy/admin/disputes/LP-0415/resolve` accepts outcome: `"REFUND"`.
* **Expected Assertions**:
  - Assert page redirects from disputes to `/chat` and selects "Andika Surya".
  - Assert disputes modal retains state or successfully opens with historical inputs upon return.
  - Assert `TRX-84201` status in `/transactions` table shows "Refund" (red).

### Workflow 3: Flagged Listing to User Suspension Flow
* **Scenario Description**: Auditor reviews flagged content, decides it is a scam listing, deletes the listing, and bans the user to protect the marketplace.
* **E2E Steps**:
  1. Navigate to `/moderation`.
  2. Open flagged listing `JS-1918` ("Mobile App Android Kotlin untuk UMKM — Murah Meriah" with 5 reports).
  3. Read reports: "Plagiarisme kode", "Penipuan - meminta kontak luar".
  4. Click the user profile link "Bagas Aditya Pratama" inside the review modal.
  5. Redirects to `/users` with Bagas Aditya Pratama's detail modal open.
  6. Click "Blokir User" on the user detail modal. Confirm the ban.
  7. Navigate back to `/moderation`.
  8. Click "Review" on `JS-1918` and select "Hapus Jasa" (if not already auto-deleted).
* **API Intercept Mocks**:
  - `PATCH /api/proxy/admin/users/MH-2045/ban` returns success.
  - Subsequent requests to users and content reflect the banned status.
* **Expected Assertions**:
  - Assert the modal redirects to `/users` with Bagas's profile loaded.
  - Assert Bagas's status pill changes to "Suspended" (danger red).
  - Assert listing `JS-1918` status shows "Dihapus" in the moderation list.

### Workflow 4: New Article Release & Dashboard Promotion
* **Scenario Description**: Admin writes a new guidelines article, uploads a cover photo, publishes it, and verifies it shows up on the articles page and activity log.
* **E2E Steps**:
  1. Navigate to `/articles`.
  2. Click "Buat Artikel Baru".
  3. Input Title: "Panduan Fitur Escrow untuk Klien Baru".
  4. Drag/select a cover mock image file in the upload zone.
  5. Write content in TipTap editor: "<p>Langkah-langkah pembayaran escrow...</p>".
  6. Set Category: "Panduan", SEO description: "Membantu klien baru mengerti sistem escrow".
  7. Click "Publikasikan".
  8. Verify the article list is shown and lists the new article with status "Published".
* **API Intercept Mocks**:
  - `POST /api/proxy/admin/artikel/upload` returns `{ url: "https://api.garapan.id/uploads/test.jpg" }`.
  - `POST /api/proxy/artikel` and `PATCH /api/proxy/artikel/ART-999/publish` both return success payloads.
* **Expected Assertions**:
  - Verify that during editing, the "Publikasikan" button remains disabled until Title and Content are typed.
  - Assert the table contains "Panduan Fitur Escrow untuk Klien Baru" with views "0" and status "Published".

### Workflow 5: Chat Escalation to Dispute Creation
* **Scenario Description**: Admin assists a client in support chat complaining about a unresponsive freelancer, navigates to transaction logs to review, and instructs client to file a dispute.
* **E2E Steps**:
  1. Navigate to `/chat`.
  2. Select active session for "Hendra Gunawan" (Klien) with unread messages.
  3. Read messages: "Halo min, mhs saya tidak bisa dihubungi sejak submit pesanan kemarin...".
  4. Look at the User Info panel on the right. In "Transaksi Terkait", click on the transaction ID `TRX-84183`.
  5. Redirects to `/transactions` with `TRX-84183` detail modal open.
  6. Verify escrow timeline status: "Pengerjaan dimulai" but "Submit hasil" is incomplete.
  7. Close transaction modal, return to `/chat`, select Hendra Gunawan.
  8. Type response: "Halo Hendra. Kami sudah memeriksa transaksi Anda TRX-84183. Silakan ajukan Laporan/Dispute resmi melalui menu pesanan di aplikasi mobile agar kami dapat menangguhkan pencairan dana."
  9. Click "Kirim".
* **API Intercept Mocks**:
  - `GET /api/proxy/live-chat-admin/CL-0924` returns Hendra's messages.
  - `GET /api/proxy/admin/orders/TRX-84183` returns the timeline details.
  - `POST /api/proxy/live-chat-admin/CL-0924` receives the admin reply.
* **Expected Assertions**:
  - Assert transition to `/transactions` with `TRX-84183` modal visible.
  - Assert timeline steps show correct completion statuses.
  - Assert the sent reply appears at the bottom of the chat list with "me" bubble styling.

---

## 4. API Mocking Structure: `tests/helpers/mock-api.ts`

The mocked API layer for testing is designed as a reusable Playwright helper class. It intercepts Next.js BFF authentication routes and the proxied NestJS routes under `/api/proxy/*`.

This file has been created at:
`c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\teamwork_preview_explorer_e2e_3\proposed_mock-api.ts`

### 4.1 Mocking Logic and Strategy
1. **Dynamic Page Routes**: Playwright's `page.route` intercepts specific regex patterns (e.g. `**/api/proxy/admin/users*`).
2. **REST Method Mapping**: Distinguishes between `GET` lists, `GET` detail IDs, `POST` creation, and `PATCH` updates.
3. **State Updates**: Provides custom trigger methods to toggle success or failure modes on mutations (e.g., `mockResolveDisputeSuccess`, `mockBanUserSuccess`) so that tests can assert changes across pages.
4. **Cookie Handling**: Mocking BFF routes (like `/api/auth/login`) sets headers like `Set-Cookie` to match Next.js BFF production middleware session validations.

---

## 5. Verification Command and Methods

To verify E2E test capabilities and structure:
- **Build Verification**: Compile Next.js build to check types and files.
  ```powershell
  pnpm build
  ```
- **Test execution**: Once Playwright is set up, run the tests using:
  ```powershell
  pnpm playwright test
  ```
- **Mock integration check**: In future implementer waves, import `MockApi` in `tests/e2e/specs/*.spec.ts`:
  ```typescript
  import { test, expect } from '@playwright/test';
  import { MockApi } from '../helpers/mock-api';

  test('Ban user hides listings', async ({ page }) => {
    const mock = new MockApi(page);
    await mock.setupDefaultMocks();
    await mock.mockBanUserSuccess('MH-2045');

    // Perform UI actions and assertions...
  });
  ```
