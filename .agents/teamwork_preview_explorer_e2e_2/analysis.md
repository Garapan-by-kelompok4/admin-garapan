# E2E Test Strategy & Design Analysis

This document details the E2E test strategy, mappings, and detailed test specifications for the **GARAPAN Admin Panel** (Next.js 15+). These tests are designed to run in a Playwright environment where all BFF authentication endpoints (`/api/auth/*`) and NestJS API proxy endpoints (`/api/proxy/*`) are mocked using Playwright's `page.route` to ensure fast, independent, and deterministic test runs.

---

## 1. Design Handoff Mappings (Routes, Selectors & Expected Elements)

Based on the investigation of the design handoff files in `design_handoff_skillmahasiswa_admin/`, the following table maps each page route to its visual elements, target selectors, user actions, and expected assertions:

### Global App Layout & Navigation
- **Routes Guard / Sidebar**: All page routes except `/login` are wrapped inside the `Shell` layout component (`src/shell.jsx`), which contains the `Sidebar` and `TopBar`.
- **Active Navigation Link**: `.sidebar .sb-item.active` (applies `background: var(--brand-50)` and `color: var(--brand-600)`).
- **Navigation Action**: Clicking any `.sidebar .sb-item` triggers navigation (or client-side state routing in the prototype).
- **Badges**: Moderation, Disputes, and Live Chat sidebar links contain `.sb-badge` to show pending item counts.
- **TopBar Search**: `.topbar .tb-search input` with placeholder `"Cari user, transaksi, laporan…"` (activates on `⌘K`).
- **Profile Dropdown**: Clicking `.tb-profile` opens a floating dropdown showing `"Profil Saya"`, `"Pengaturan"`, and `"Keluar"` (triggers `/login`).
- **Notification Dropdown**: Clicking `.tb-icon-btn` with `Icon.Bell` displays a notification list dropdown with recent activity indicators.
- **Shared DataTable Component**: `.table` structure with `th` (uppercase, `background: var(--surface-2)`) and `td` (hover bg `#F7F8FB`), with a bottom `.pagination` wrapper.

---

### Route-by-Route Element Mappings

| Next.js Route | Screen Name | Key Selectors & Input Fields | Key Actions | Expected Elements / Assertions |
|---|---|---|---|---|
| `/login` | Login Screen | - `input[type="email"]`<br>- `input[type="password"]`<br>- `input[type="checkbox"]` (Ingat saya)<br>- `button[type="submit"]` (Masuk)<br>- Button:has-text("Google Workspace") | - Fill email/password<br>- Toggle show/hide password<br>- Submit form<br>- Click Google SSO | - Radial gradient hero panel<br>- Error labels under inputs<br>- Redirect to `/dashboard` on success |
| `/dashboard` | Dashboard Overview | - Card containers (`.card.card-pad`)<br>- Sparkline SVGs (`.card svg`)<br>- Line chart (`.card:has-text("Transaksi 30 Hari Terakhir")`)<br>- Donut chart SVG<br>- Button:has-text("7H") / "30H" / "90H"<br>- Quick links in "Perlu Perhatian" | - Click chart period toggles<br>- Click quick-link rows | - Stat values: `"16.284"`, `"Rp 328,4 jt"`, `"27"`<br>- Up/down arrows in green/red delta pills<br>- System Health status: `"Semua layanan beroperasi normal"` |
| `/users` | User Management | - Tab buttons: `"Mahasiswa"`, `"Klien"`<br>- `.tb-search input`<br>- `.select` for Status & Prodi filters<br>- Checkboxes inside table rows<br>- `.icon-btn` with Eye icon<br>- Modal buttons: `"Suspend Akun"`, `"Tutup"` | - Toggle between tabs<br>- Filter by status/prodi<br>- Search username/email<br>- Click user name to open modal | - Table columns change based on active tab<br>- Empty state: `.empty` containing `"Tidak ada hasil"`<br>- Modal displays transactional & report history lists |
| `/moderation` | Content Moderation | - Segmented buttons: `"Semua"`, `"Ditinjau"`, `"Aman"`, etc.<br>- Table actions: `"Review"` button<br>- Modal buttons: `"Hapus Jasa"`, `"Tandai Aman"`, `"Sembunyikan"` | - Click filter tabs<br>- Open Review modal<br>- Take moderation action | - Highlighted report counts (`bg: var(--danger-50)` if >= 5)<br>- Two-column modal: left content details, right reporter details & reasons |
| `/disputes` | Dispute Resolution | - Filter dropdown: `"Semua jenis masalah"`<br>- Table actions: `"Detail"` button<br>- Textarea for resolution text<br>- Resolution buttons: `"Refund penuh"`, `"Peringatan tertulis"`<br>- Modal buttons: `"Tutup Laporan"`, `"Tolak Laporan"` | - Filter by problem category<br>- Click "Detail" to open modal<br>- Fill resolution textarea<br>- Apply quick-fill resolutions | - Dispute priority pills: `"Tinggi"`, `"Sedang"`, `"Rendah"`<br>- Communication timeline list with vertical connector line<br>- "Tutup Laporan" button disabled until resolution is typed |
| `/transactions` | Transactions & Escrow | - Filter tabs: `"Semua"`, `"Ditahan"`, `"Dicairkan"`, `"Refund"`<br>- Nominal filter dropdown<br>- Eye icon buttons inside table rows<br>- Modal buttons: `"Cairkan Dana"`, `"Proses Refund"` | - Click filter tabs<br>- Click Eye button to open detail modal<br>- Click refund/release funds | - Escrow stats: `"Rp 428,5 jt"`, `"Rp 184,2 jt"`<br>- Escrow timeline steps: Green checkmarks for done, gray for pending<br>- Payment evidence preview tiles |
| `/chat` | Live Chat Support | - Chat panels: `.card` with 3 columns<br>- Search input & filter buttons (Klien/Mahasiswa)<br>- Textarea `placeholder="Ketik balasan..."`<br>- Button:has-text("Kirim")<br>- Suggestions: `"💡 Saran balasan"`, `"📋 Kebijakan refund"` | - Select chat session<br>- Click filter tabs<br>- Type and send message<br>- Add admin notes | - Online green dot indicator on avatar<br>- Left-aligned white bubbles for user; right-aligned blue bubbles for admin<br>- Unread message badges<br>- Sidebar displaying contact info and related orders |
| `/articles` | Articles CMS | - Button:has-text("Buat Artikel Baru")<br>- Editor title input (`placeholder="Judul artikel..."`)<br>- WYSIWYG Editor area & toolbar options<br>- Sidebar selects (Kategori, Tags, SEO Description)<br>- Header buttons: `"Publikasikan"`, `"Simpan Draft"`, `"Batal"` | - Click "Buat Artikel Baru"<br>- Upload thumbnail file<br>- Format article content<br>- Add SEO description<br>- Click "Publikasikan" | - Page toggles internally from table list to editor view<br>- "Publikasikan" button disabled if title or content is empty<br>- SEO tips box rendering dynamically |
| `/settings` | Settings & Profile | - Sidebar settings options (vertical tabs)<br>- Forms for Profile (Bio, Phone, Name)<br>- Password security inputs (Current, New, Confirm)<br>- Notifications matrix table checkboxes<br>- Button:has-text("Undang Admin") | - Switch setting categories<br>- Update profile details<br>- Change password<br>- Save notification settings<br>- Click team actions | - Email field disabled in Profile<br>- 2FA active shield card indicator<br>- Tim & Izin Akses list table<br>- Activity logs feed with action details and timestamps |

---

## 2. Tier 1: Feature Coverage E2E Tests (Features 6-9)

Below are detailed test specifications for the remaining 4 features, with 5 tests per feature.

### Feature 6: Transactions & Escrow (`/transactions`)

#### Test 6.1: Escrow Dashboard and Transaction List Verification
- **Test Description**: Verify that the `/transactions` page renders financial summary cards and the main transaction logs table with correct columns.
- **UI Actions**:
  1. Login and navigate to `/transactions`.
  2. Locate the four summary cards.
  3. Verify the columns on the transactions table.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders`: Mock returns a list of transactions (e.g. `TRX-84201` for client "Andika Surya", student "Farhan M.", nominal `1500000`, status `Ditahan`, date `19 Apr 2026`).
- **Expected Assertions**:
  - Assert that cards display "Total Nilai Escrow", "Ditahan", "Dicairkan Bulan Ini", and "Refund".
  - Assert table headers contain: `"ID Transaksi"`, `"Klien"`, `"Mahasiswa"`, `"Jasa"`, `"Nominal"`, `"Status Escrow"`, `"Tanggal"`, and `"Aksi"`.
  - Assert table row contains ID `"TRX-84201"` with nominal `"Rp 1.500.000"` formatted in Indonesian format.

#### Test 6.2: Status Tab Filtering
- **Test Description**: Verify that clicking the status filter buttons updates the table results dynamically.
- **UI Actions**:
  1. Click on the `"Ditahan"` filter button.
  2. Verify that the table only displays items with status "Ditahan".
  3. Click on the `"Refund"` filter button.
  4. Verify that the table only displays items with status "Refund".
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders?status=Ditahan`: Returns list of only "Ditahan" orders.
  - `GET /api/proxy/admin/orders?status=Refund`: Returns list of only "Refund" orders.
- **Expected Assertions**:
  - Assert that all rows in the table show the status pill matching the active filter.

#### Test 6.3: Transaction Search Functionality
- **Test Description**: Verify searching by Transaction ID, Client Name, or Student Name filters the list.
- **UI Actions**:
  1. Type `"TRX-84201"` in the search input field.
  2. Wait for search to trigger (either client-side or api-side).
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders?q=TRX-84201`: Returns a single record matching the query.
- **Expected Assertions**:
  - Assert that the table displays exactly 1 row with ID `"TRX-84201"`.

#### Test 6.4: Detail Modal with Escrow Timeline
- **Test Description**: Verify that clicking the Eye button opens a detailed modal showing the escrow timeline.
- **UI Actions**:
  1. Click the "Eye" button in the row of transaction `TRX-84201`.
  2. Inspect the modal contents.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders/TRX-84201`: Returns full details including nominal, client/student details, service descriptions, and timeline logs.
- **Expected Assertions**:
  - Assert modal title is `"Detail Transaksi — TRX-84201"`.
  - Assert client and freelancer names are visible.
  - Assert the escrow timeline contains steps: `"Pembayaran diterima"`, `"Dana masuk escrow"`, `"Pengerjaan dimulai"`, `"Submit hasil akhir"`, and `"Dana dicairkan ke mahasiswa"`.
  - Assert completed steps have green fill / check icons, and pending steps are styled gray.

#### Test 6.5: Release and Refund Escrow Funds
- **Test Description**: Verify that the admin can release funds or trigger a refund from the detail modal.
- **UI Actions**:
  1. Open the detail modal for a `"Ditahan"` transaction.
  2. Click the `"Cairkan Dana"` button.
  3. Confirm the action (if confirmation prompt exists).
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/orders/TRX-84201/release`: Intercept and mock successful response (`200 OK`, `{ success: true }`).
- **Expected Assertions**:
  - Assert that the detail modal closes (or shows updated status).
  - Assert that a success toast notification appears: `"Dana berhasil dicairkan ke mahasiswa"`.
  - Assert that the transaction status updates to `"Dicairkan"`.

---

### Feature 7: Live Chat Support (`/chat`)

#### Test 7.1: 3-Column Shell & Session List
- **Test Description**: Verify that the Live Chat interface renders in a 3-column layout and list of sessions is displayed.
- **UI Actions**:
  1. Click `"Live Chat"` in the sidebar.
  2. Verify layout panels exist.
- **API Intercept Mocks**:
  - `GET /api/proxy/live-chat-admin`: Returns active session list (`S-01`: "Andika Surya" (Klien, unread: 2, online: true), `S-02`: "Farhan Mahendra" (Mahasiswa, unread: 0, online: false)).
- **Expected Assertions**:
  - Assert presence of Left Panel (Session List), Center Panel (Message Box), and Right Panel (User details).
  - Assert that the left panel shows session `"Andika Surya"` with role pill `"Klien"`, and unread badge `"2"`.
  - Assert that the online green dot indicator is visible on Andika's avatar.

#### Test 7.2: Message History UI
- **Test Description**: Verify that selecting a session loads message history with correct bubble alignment.
- **UI Actions**:
  1. Click on the session row for `"Andika Surya"` in the session list.
- **API Intercept Mocks**:
  - `GET /api/proxy/live-chat-admin/sessions/S-01/messages`: Returns message logs between admin and user.
- **Expected Assertions**:
  - Assert message container shows date separator `"Hari ini, 20 April 2026"`.
  - Assert me-bubbles (from: me) are right-aligned with brand-500 blue background and white text.
  - Assert them-bubbles (from: user) are left-aligned with white background, borders, and black text.

#### Test 7.3: Sending Message Reply
- **Test Description**: Verify the admin can successfully type and send a support message.
- **UI Actions**:
  1. Click chat textarea, type `"Halo Andika, laporan Anda sedang kami proses."`
  2. Click the `"Kirim"` button.
- **API Intercept Mocks**:
  - `POST /api/proxy/live-chat-admin/sessions/S-01/messages`: Mock returns successful response (`201 Created` with the new message object).
- **Expected Assertions**:
  - Assert that the textarea is cleared after sending.
  - Assert that a new me-bubble with text `"Halo Andika, laporan Anda sedang kami proses."` appears at the bottom of the chat list with status `"Terkirim ✓"`.

#### Test 7.4: Client Info Sidebar
- **Test Description**: Verify that the right-hand sidebar displays detailed contact and transactional logs of the active user.
- **UI Actions**:
  1. Select session for `"Andika Surya"`.
  2. Inspect the right sidebar panel.
- **Expected Assertions**:
  - Assert contact information displays email `"andika@kopipintar.id"`, phone, and join date.
  - Assert "Transaksi Terkait" contains card with order `"ORD-2406"` showing status `"Ditahan"`.
  - Assert "Catatan Admin" textarea is prefilled with notes: `"User sudah 2x komplain terkait pelayanan mahasiswa. Dipantau."`.

#### Test 7.5: Tutup Sesi (Close Session)
- **Test Description**: Verify the admin can close the support session to mark the issue resolved.
- **UI Actions**:
  1. Click the `"Tutup Sesi"` button in the chat header.
- **API Intercept Mocks**:
  - `DELETE /api/proxy/live-chat-admin/sessions/S-01`: Mock returns `200 OK` `{ success: true }`.
- **Expected Assertions**:
  - Assert chat session list refreshes.
  - Assert success toast `"Sesi dukungan berhasil ditutup"` is shown.

---

### Feature 8: Articles CMS (`/articles`)

#### Test 8.1: Article List and Summary Stats
- **Test Description**: Verify the Article list renders summary stats cards and table items correctly.
- **UI Actions**:
  1. Navigate to `/articles`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/artikel`: Returns list of articles and statistics.
- **Expected Assertions**:
  - Assert stats cards display `"Total Artikel: 47"`, `"Total Pembaca (30 hari): 28.4K"`, and `"Artikel Terpopuler"`.
  - Assert table columns: `"Artikel"`, `"Kategori"`, `"Status"`, `"Tgl. Publikasi"`, `"Views"`, and `"Aksi"`.
  - Assert article row contains title `"Cara Menentukan Harga Jasa Freelance saat Masih Kuliah"`.

#### Test 8.2: Internal Navigation to Article Editor
- **Test Description**: Verify that clicking "Buat Artikel Baru" changes the view to the Editor layout without page reloading.
- **UI Actions**:
  1. Click `"Buat Artikel Baru"` button.
- **Expected Assertions**:
  - Assert that the article list card is hidden.
  - Assert that the `"Editor Artikel"` panel is visible, showing title input placeholder `"Judul artikel..."`, thumbnail upload container, toolbar, and settings sidebar.
  - Assert route URL remains `/articles` (internal state transition).

#### Test 8.3: Article Validation and Draft Save
- **Test Description**: Verify input validation checks and saving an article as a Draft.
- **UI Actions**:
  1. Click `"Buat Artikel Baru"`.
  2. Type Title: `"Tutorial React Next.js"`.
  3. Leave content empty, click `"Simpan Draft"`.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/artikel/draft`: Mock successful save.
- **Expected Assertions**:
  - Assert that a toast or header pill shows `"disimpan otomatis"` or `"Draft berhasil disimpan"`.
  - Assert the draft indicator pill shows `"Draft"` in the editor header.

#### Test 8.4: Publish Article Action
- **Test Description**: Verify creating and publishing a complete article to the platform.
- **UI Actions**:
  1. Enter Title: `"Panduan Tailwind CSS untuk Pemula"`.
  2. Type Content: `"Tailwind CSS adalah utilitas pertama CSS framework..."`.
  3. Select Category: `"Panduan"`.
  4. Fill Tag: `"design"`.
  5. Fill SEO description.
  6. Click `"Publikasikan"`.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/artikel`: Mock success (`201 Created`).
- **Expected Assertions**:
  - Assert that the view switches back to the articles list.
  - Assert success toast `"Artikel berhasil dipublikasikan!"` is shown.
  - Assert the new article is visible in the table.

#### Test 8.5: Article Editing & Unpublishing
- **Test Description**: Verify editing an existing article and changing its status from Published to Draft.
- **UI Actions**:
  1. Click `"Edit"` (pen icon) on a published article in the table.
  2. Click the draft toggle or `"Simpan Draft"` button in the editor.
- **API Intercept Mocks**:
  - `PUT /api/proxy/admin/artikel/ART-001`: Mock success.
- **Expected Assertions**:
  - Assert that status changes back to `"Draft"`.
  - Assert success notification is displayed.

---

### Feature 9: Settings & Profile (`/settings`)

#### Test 9.1: Sub-tab Navigation and Profile Edit
- **Test Description**: Verify that settings navigation links load their respective sub-tab forms.
- **UI Actions**:
  1. Navigate to `/settings`.
  2. Inspect the Profile form.
  3. Modify `"Nama Lengkap"` to `"Adinda Rahmawati Edit"`.
  4. Click `"Simpan Perubahan"`.
- **API Intercept Mocks**:
  - `PUT /api/proxy/admin/profile`: Returns updated admin user profile (`200 OK`).
- **Expected Assertions**:
  - Assert left menu has: `"Informasi Profil"`, `"Keamanan & Password"`, `"Preferensi Notifikasi"`, `"Tim & Izin Akses"`, and `"Log Aktivitas"`.
  - Assert email input field is `disabled` (with background `var(--surface-2)`).
  - Assert success toast `"Profil berhasil diperbarui"` is shown.

#### Test 9.2: Password and 2FA Settings
- **Test Description**: Verify updating admin password and status display of Two-Factor Authentication.
- **UI Actions**:
  1. Click `"Keamanan & Password"` sub-tab.
  2. Enter Current Password, New Password, Confirm New Password.
  3. Click `"Perbarui Password"`.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/profile/password`: Returns success.
- **Expected Assertions**:
  - Assert 2FA card contains text `"Aplikasi Authenticator aktif"` and status pill `"Aktif"`.
  - Assert success toast `"Password berhasil diperbarui"` is displayed.

#### Test 9.3: Notifications Matrix Toggle
- **Test Description**: Verify modifying email, push, and SMS notifications preferences matrix.
- **UI Actions**:
  1. Click `"Preferensi Notifikasi"` sub-tab.
  2. Uncheck `"SMS"` for `"Laporan prioritas tinggi"`.
  3. Check `"Email"` for `"Escrow tertahan > 7 hari"`.
  4. Click `"Simpan"`.
- **API Intercept Mocks**:
  - `PUT /api/proxy/admin/settings/notifications`: Mock success.
- **Expected Assertions**:
  - Assert notification categories display with uppercase headers: `"LAPORAN & DISPUTE"`, `"TRANSAKSI"`, `"KOMUNIKASI"`.
  - Assert that success toast is displayed.

#### Test 9.4: Team Members Management
- **Test Description**: Verify displaying team list and opening the invite admin modal.
- **UI Actions**:
  1. Click `"Tim & Izin Akses"` sub-tab.
  2. Click the `"Undang Admin"` button.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/team`: Returns list of admin accounts.
- **Expected Assertions**:
  - Assert table columns: `"Nama"`, `"Role"`, `"Status"`, `"Terakhir Aktif"`.
  - Assert Team rows show correct roles (e.g. `"Super Admin"`, `"Moderator"`, `"Finance"`, `"Content"`).
  - Assert the Invite Admin modal overlay opens successfully.

#### Test 9.5: System Activity Log View
- **Test Description**: Verify logs of admin activity display chronologically.
- **UI Actions**:
  1. Click `"Log Aktivitas"` sub-tab.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/logs`: Returns activity logs list.
- **Expected Assertions**:
  - Assert list contains log: `"Adinda R. Menyetujui pencairan dana escrow TRX-84199"`.
  - Assert timestamps and avatars are displayed correctly.
  - Assert the presence of the `"Ekspor"` button in the header.

---

## 3. Tier 2: Boundary & Corner Cases (45 Cases across all 9 Features)

This section details 5 specific boundary/corner cases for each of the 9 features (total 45 tests), mapping the edge scenarios like empty tables, network failures, input limit overflows, extreme values, validation errors, and invalid credentials.

### Feature 1: Login & Authentication (`/login`)

#### Test 1.1: Empty Form Submission
- **Description**: Verify validation errors when submit is clicked with empty fields.
- **UI Actions**: Navigate to `/login`, clear fields, click `"Masuk ke Dashboard"`.
- **API Intercept Mocks**: None (prevented client-side).
- **Assertions**: Assert Zod validation messages `"Email wajib diisi"` and `"Password wajib diisi"` are visible. No API request is dispatched.

#### Test 1.2: Invalid Email Syntax
- **Description**: Verify warning message for malformed emails.
- **UI Actions**: Type `"admin-garapan"` (no @ or domain) in Email input, click submit.
- **API Intercept Mocks**: None (prevented client-side).
- **Assertions**: Assert validation text `"Format email tidak valid"` is shown.

#### Test 1.3: Password Length Lower Bound
- **Description**: Verify warning for too short password strings.
- **UI Actions**: Type valid email, type `"12345"` (5 chars) in Password input, click submit.
- **API Intercept Mocks**: None.
- **Assertions**: Assert validation warning `"Password minimal 8 karakter"` appears.

#### Test 1.4: Invalid Credentials (401 Unauthorized)
- **Description**: Verify UI response when credentials do not match any database records.
- **UI Actions**: Enter valid format email/password, submit.
- **API Intercept Mocks**:
  - `POST /api/auth/login`: Mock returns `401 Unauthorized` with `{ message: "Email atau password salah" }`.
- **Assertions**: Assert form inputs remain populated; a red alert toast displays `"Email atau password salah"`.

#### Test 1.5: Non-Admin Access Prevention (403 Forbidden)
- **Description**: Verify that non-admin accounts are rejected by the BFF auth endpoint.
- **UI Actions**: Enter student/client credentials, click submit.
- **API Intercept Mocks**:
  - `POST /api/auth/login`: Mock returns `403 Forbidden` with `{ message: "Akses ditolak. Akun Anda tidak memiliki hak akses administrator." }`.
- **Assertions**: Assert redirection is blocked; red toast displays the role violation error.

---

### Feature 2: Dashboard Overview (`/dashboard`)

#### Test 2.1: Absolute Zero Statistics Card Scaling
- **Description**: Verify that the dashboard stats cards render correctly when stats values are zero.
- **UI Actions**: Navigate to `/dashboard`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/stats`: Mock returns stats values as `0` for users, transactions, and revenue, and `0%` delta.
- **Assertions**: Assert stats render as `"0"`, `"Rp 0"`, and delta badges display `0%` neutral style without UI text overlap.

#### Test 2.2: Line Chart with Empty/Single Data Point
- **Description**: Verify the charts load cleanly without JS exceptions if there is insufficient historical data.
- **UI Actions**: Open `/dashboard`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders/chart`: Mock returns empty list `[]` or single coordinate.
- **Assertions**: Assert chart container displays empty state placeholder or falls back gracefully without crashing the page layout.

#### Test 2.3: Zero Active Tasks / Alerts Fallback
- **Description**: Verify "Perlu Perhatian" card when there are zero pending tasks.
- **UI Actions**: Navigate to `/dashboard`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/pending-counts`: Mock returns `0` for all alerts (moderation, disputes, chat, transactions).
- **Assertions**: Assert badges display `"0"` or hide, showing a clean task-completed checkmark icon.

#### Test 2.4: Extreme Metric Value Formatting
- **Description**: Verify dashboard doesn't overflow when transaction nominal is extremely large.
- **UI Actions**: Navigate to `/dashboard`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/stats`: Mock returns platform revenue as `999999999999` (IDR).
- **Assertions**: Assert stats card displays value formatted correctly using Indonesian number suffixes (e.g., `"Rp 999,9 M"` or similar compact display) without breaking card dimensions.

#### Test 2.5: API Timeout Graceful Fallback
- **Description**: Verify page remains interactive during a BFF gateway timeout.
- **UI Actions**: Click dashboard reload or navigate to page.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/stats`: Delay response by 6000ms or return `504 Gateway Timeout`.
- **Assertions**: Assert statistics cards render skeleton loading states and show a retry button without crashing the layout shell.

---

### Feature 3: User Management (`/users`)

#### Test 3.1: Empty Search / Filter Table State
- **Description**: Verify empty state display when filtering leaves no records.
- **UI Actions**: Select tab `"Mahasiswa"`, type `"InvalidQueryNonExistent"` in search bar.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/users?q=InvalidQueryNonExistent`: Returns `{ data: [], total: 0 }`.
- **Assertions**: Assert table content is replaced by `.empty` block showing search icon, `"Tidak ada hasil"`, and hint text.

#### Test 3.2: Pagination Boundary (Single Page / Empty)
- **Description**: Verify pagination controls are disabled when data count is less than the page limit.
- **UI Actions**: Set filter to `"Suspended"`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/users?status=Suspended`: Returns list with exactly 3 items, total `3`.
- **Assertions**: Assert pagination text is `"Menampilkan 1–3 dari 3 data"`, page buttons contain only `"1"`, and prev/next chevron buttons are disabled (`disabled` attribute is true).

#### Test 3.3: Missing Optional Profile Details
- **Description**: Verify user details modal handles missing optional values (e.g., client without company name).
- **UI Actions**: Open details modal for a Client who registered individually.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/users/CL-999`: Returns user profile where `perusahaan` is `null` or empty.
- **Assertions**: Assert the "Perusahaan" value in the info row shows `"—"` or `"Personal"` instead of breaking the layout.

#### Test 3.4: Extreme Numerical Order Logs
- **Description**: Verify detail modal list when a user has a massive transaction history.
- **UI Actions**: Open details modal for a client with 5,000 orders.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/users/CL-888`: Returns user details indicating `jobs: 5000` and first page of transaction history.
- **Assertions**: Assert that order count is formatted as `"5.000 pesanan"` and transaction history panel loads with pagination controls or scroll area.

#### Test 3.5: Suspend Action API Error Handling
- **Description**: Verify error notification when suspend action fails on the server side.
- **UI Actions**: Click user name, click `"Suspend Akun"` in modal.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/users/MH-001/suspend`: Returns `500 Internal Server Error` with `{ message: "Database connection failed" }`.
- **Assertions**: Assert modal remains open; a warning toast says `"Gagal melakukan suspend. Silakan coba lagi nanti."` and user status pill remains `"Aktif"`.

---

### Feature 4: Content Moderation (`/moderation`)

#### Test 4.1: Flagged Listing with Zero Reports
- **Description**: Verify moderation list handles listings flagged manually by admin that have zero reports.
- **UI Actions**: Navigate to `/moderation`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/content`: Returns listing with `laporan: 0` and status `"Ditinjau"`.
- **Assertions**: Assert laporan pill renders as `"0 laporan"` with neutral colors (gray/yellow) rather than high-priority danger red.

#### Test 4.2: Extremely Large Report Reason Stack
- **Description**: Verify review modal handles listings with high reports count (e.g., 100+ reports).
- **UI Actions**: Click `"Review"` on a listing.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/content/JS-100`: Returns listing details with 120 report logs.
- **Assertions**: Assert report reasons container displays a scrollbar and report reasons render correctly without overflowing the modal viewport.

#### Test 4.3: Segmented Filters Empty States
- **Description**: Verify segmented filter categories render empty pages correctly.
- **UI Actions**: Click on the `"Dihapus"` segmented filter tab.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/content?status=Dihapus`: Returns empty list `[]`.
- **Assertions**: Assert table is replaced by a centered empty warning without throwing undefined variable exceptions.

#### Test 4.4: Super Long Text Description wrapping
- **Description**: Verify details modal layout handles listing descriptions that contain very long unbroken strings of characters.
- **UI Actions**: Open review modal for a listing with an unbroken 1000-character description.
- **Assertions**: Assert listing description block wraps text properly (using `word-break: break-all` or `word-wrap: break-word`) and does not stretch the modal layout horizontally.

#### Test 4.5: Action Collision / Stale Data Error
- **Description**: Verify handling when admin clicks action on a listing that was already approved/deleted by another admin.
- **UI Actions**: Click `"Tandai Aman"` on a listing.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/content/JS-001/safe`: Returns `404 Not Found` or `409 Conflict` with `{ message: "Jasa ini sudah tidak tersedia atau telah ditinjau" }`.
- **Assertions**: Assert modal closes; warning toast displays `"Konten ini sudah diselesaikan oleh admin lain."` and list table refreshes.

---

### Feature 5: Dispute Resolution (`/disputes`)

#### Test 5.1: Missing Resolution Text Validation
- **Description**: Verify that the resolution submission is blocked if no resolution description is entered.
- **UI Actions**: Click `"Detail"` on open dispute, leave Resolution textbox empty.
- **Assertions**: Assert that the `"Tutup Laporan (Selesai)"` button is disabled (`disabled` attribute is present).

#### Test 5.2: Resolution Input Character Limit Overflow
- **Description**: Verify that typing excessive characters in resolution input is caught by validation.
- **UI Actions**: Enter a 3,000-character string in the resolution textbox.
- **Assertions**: Assert character count warning is shown or Zod validation stops submission, prompting `"Maksimal 1000 karakter"`.

#### Test 5.3: Dispute Log with Zero Comm History
- **Description**: Verify details modal handles disputes created with zero communication events.
- **UI Actions**: Click `"Detail"` on a newly opened dispute.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/disputes/LP-101`: Returns details where `riwayat_komunikasi` is `[]`.
- **Assertions**: Assert timeline displays `"Belum ada riwayat komunikasi"` without breaking the timeline component.

#### Test 5.4: Missing or Broken Evidence Attachment
- **Description**: Verify details modal layout does not crash when uploaded dispute evidence links are broken (404).
- **UI Actions**: Click `"Detail"` on a dispute.
- **API Intercept Mocks**:
  - Mock image preview requests within the modal to return `404 Not Found`.
- **Assertions**: Assert that image placeholders display standard broken-image icon/styling without throwing javascript console errors.

#### Test 5.5: "Tolak Laporan" API Network Failure
- **Description**: Verify error display when click to reject dispute fails.
- **UI Actions**: Click `"Detail"`, click `"Tolak Laporan"`.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/disputes/LP-001/reject`: Returns `503 Service Unavailable`.
- **Assertions**: Assert warning toast `"Gagal menolak laporan. Server sedang sibuk."` appears; modal stays open.

---

### Feature 6: Transactions & Escrow (`/transactions`)

#### Test 6.1: Empty Transaction List State
- **Description**: Verify empty state display when there are no financial transactions recorded.
- **UI Actions**: Navigate to `/transactions`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders`: Mock returns empty list `[]`.
- **Assertions**: Assert table is replaced by empty state card displaying `"Tidak ada data transaksi"`.

#### Test 6.2: Extreme High Nominal Value Formatting
- **Description**: Verify table and modal handle extremely large transaction nominals without formatting wrap errors.
- **UI Actions**: Open details of transaction with value Rp 999.999.999.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders`: Returns transaction with `nominal: 999999999`.
- **Assertions**: Assert nominal value displays as `"Rp 999.999.999"` (Indonesian locale format) and text is not truncated or wrapped to a new line in the cell.

#### Test 6.3: Zero/Negative Nominal Value Handlers
- **Description**: Verify that the table handles free services or zero-value transactions safely.
- **UI Actions**: Navigate to `/transactions`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders`: Returns transaction with `nominal: 0` or `-500`.
- **Assertions**: Assert row displays value formatted as `"Rp 0"` (negatives are clamped or flagged as error).

#### Test 6.4: Escrow Timeline with All Steps Pending
- **Description**: Verify timeline styling when a transaction is newly created and all milestone steps are pending.
- **UI Actions**: Open details modal for a newly created transaction.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/orders/TRX-000`: Returns transaction with `status: "Ditahan"` and all timeline steps set to `done: false`.
- **Assertions**: Assert that all timeline circles are styled white with border-strong outlines, and connector lines are gray (no green indicators).

#### Test 6.5: Release Funds API Conflict Error
- **Description**: Verify UX when admin tries to release funds for an order that is already completed or disputed.
- **UI Actions**: Open details modal, click `"Cairkan Dana"`.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/orders/TRX-84201/release`: Returns `400 Bad Request` with `{ message: "Dana sudah dicairkan atau sedang dalam sengketa." }`.
- **Assertions**: Assert modal displays warning alert block displaying the backend message in Bahasa Indonesia.

---

### Feature 7: Live Chat Support (`/chat`)

#### Test 7.1: Empty Support Queue
- **Description**: Verify Live Chat interface displays fallback when there are no active sessions.
- **UI Actions**: Navigate to `/chat`.
- **API Intercept Mocks**:
  - `GET /api/proxy/live-chat-admin`: Mock returns empty list `[]`.
- **Assertions**: Assert left panel shows `"Tidak ada percakapan aktif"`. Center page displays `"Pilih percakapan untuk memulai bantuan"` banner.

#### Test 7.2: Message Area Character Boundary Overflow
- **Description**: Verify chat textarea handles very long inputs.
- **UI Actions**: Enter 1,500 characters in the textarea, click `"Kirim"`.
- **Assertions**: Assert that either text length is capped at 1,000 characters or input shows countdown warning and blocks sending if limit exceeded.

#### Test 7.3: Message Sending Network Disconnection
- **Description**: Verify bubble indicator when a chat message fails to send due to server disconnect.
- **UI Actions**: Type message, click `"Kirim"`.
- **API Intercept Mocks**:
  - `POST /api/proxy/live-chat-admin/sessions/S-01/messages`: Mock fails/drops connection or returns `502 Bad Gateway`.
- **Assertions**: Assert sent message bubble appears but is flagged with red warning icon (`"Gagal mengirim"`) and toast displays `"Koneksi terputus. Silakan kirim ulang."`

#### Test 7.4: Unread Message Count Boundary
- **Description**: Verify unread badge formatting when unread count is extremely high (e.g. 100+).
- **UI Actions**: Open `/chat`.
- **API Intercept Mocks**:
  - `GET /api/proxy/live-chat-admin`: Returns session with `unread: 150`.
- **Assertions**: Assert badge displays text `"99+"` or `"150"` and does not distort the circular badge container.

#### Test 7.5: Active User Sidebar has Zero Related Orders
- **Description**: Verify right sidebar layout when the active user has no related orders.
- **UI Actions**: Select active user who newly registered.
- **API Intercept Mocks**:
  - `GET /api/proxy/live-chat-admin/sessions/S-01`: Active user details return `orders: []`.
- **Assertions**: Assert "Transaksi Terkait" sub-section shows `"Tidak ada transaksi terkait"`.

---

### Feature 8: Articles CMS (`/articles`)

#### Test 8.1: Empty Article Table State
- **Description**: Verify list view fallback when no articles exist.
- **UI Actions**: Navigate to `/articles`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/artikel`: Mock returns empty array `[]`.
- **Assertions**: Assert table is replaced by empty state block showing `"Belum ada artikel yang dibuat"`.

#### Test 8.2: Views Counter Metric Format Boundary
- **Description**: Verify views column formats large figures correctly.
- **UI Actions**: Navigate to `/articles`.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/artikel`: Returns article with `views: 2489150`.
- **Assertions**: Assert views cell formats count as `"2.489.150"` (Indonesian locale grouping separator).

#### Test 8.3: Thumbnail File Size Upper Limit Check
- **Description**: Verify client-side rejection of large image uploads.
- **UI Actions**: Click `"Buat Artikel Baru"`, drag and drop a 5MB image file into the thumbnail area.
- **Assertions**: Assert that upload is rejected immediately on the client, showing red validation text `"Ukuran file maksimal 2MB"`. No network request is initiated.

#### Test 8.4: Thumbnail File Type Restriction Check
- **Description**: Verify client-side rejection of non-image file uploads.
- **UI Actions**: Click `"Buat Artikel Baru"`, upload a `.pdf` or `.zip` file.
- **Assertions**: Assert error validation message `"Format file harus PNG atau JPG"` is displayed.

#### Test 8.5: Auto-Save Background Network Failure
- **Description**: Verify notification if background auto-save API calls fail.
- **UI Actions**: Open article editor, edit title, wait for autosave trigger.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/artikel/autosave`: Returns `500 Internal Server Error`.
- **Assertions**: Assert that header status message switches from `"disimpan otomatis"` to `"Gagal menyimpan otomatis (Koneksi error)"` in warning colors.

---

### Feature 9: Settings & Profile (`/settings`)

#### Test 9.1: Bio Field Character Length Constraint
- **Description**: Verify validation checks when saving bio that exceeds field bounds.
- **UI Actions**: Navigate to `/settings`, type 600 characters in Bio textarea, click `"Simpan Perubahan"`.
- **Assertions**: Assert Zod validation warns `"Bio maksimal 500 karakter"` and blocks submission.

#### Test 9.2: Change Password - Invalid Current Password
- **Description**: Verify form feedback when password change request is rejected due to wrong current password.
- **UI Actions**: Click `"Keamanan & Password"`, enter wrong current password, submit.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/profile/password`: Returns `400 Bad Request` with `{ message: "Password saat ini tidak cocok." }`.
- **Assertions**: Assert warning alert `"Password saat ini tidak cocok"` is displayed under the current password input field.

#### Test 9.3: Notification Settings Saved Empty Matrix
- **Description**: Verify saving state when all notification switches are checked off.
- **UI Actions**: Click `"Preferensi Notifikasi"`, uncheck all email, push, and SMS boxes, click `"Simpan"`.
- **API Intercept Mocks**:
  - `PUT /api/proxy/admin/settings/notifications`: Receives payload with all boolean keys set to `false`. Mock returns `200 OK`.
- **Assertions**: Assert success toast `"Pengaturan notifikasi disimpan"` appears.

#### Test 9.4: Invite Team Member with Duplicate Email
- **Description**: Verify validation when inviting a user whose email is already registered.
- **UI Actions**: Click `"Tim & Izin Akses"`, click `"Undang Admin"`, fill email `"admin@skillmahasiswa.id"`, click send.
- **API Intercept Mocks**:
  - `POST /api/proxy/admin/team/invite`: Returns `409 Conflict` with `{ message: "Email ini sudah terdaftar sebagai admin." }`.
- **Assertions**: Assert modal shows red message `"Email ini sudah terdaftar sebagai admin."` under the input field.

#### Test 9.5: System Activity Log Empty State
- **Description**: Verify log activity panel layout when there are no logs for the last 30 days.
- **UI Actions**: Click `"Log Aktivitas"` sub-tab.
- **API Intercept Mocks**:
  - `GET /api/proxy/admin/logs`: Mock returns empty list `[]`.
- **Assertions**: Assert panel displays card saying `"Tidak ada log aktivitas dalam 30 hari terakhir"`.
