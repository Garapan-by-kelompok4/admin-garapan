# GARAPAN E2E Test Strategy & Tier 1 Design Handoff Report

This report outlines the codebase state, design mapping, Playwright configuration, and detailed test designs for the first five core features of the GARAPAN Admin Panel.

---

## 1. Codebase State Analysis

The target Next.js application is structured around the Next.js App Router (Next.js v16.2.9 / React v19.2.4) with TypeScript and Tailwind CSS v4.

### Key Architectural Configurations:
- **Next.js & Turbopack**: The configuration file `next.config.ts` uses Next.js App Router. The `dev` command in `package.json` uses turbopack (`next dev --turbopack`).
- **Tailwind CSS v4 Integration**: Tailwind v4 is integrated via `@tailwindcss/postcss` in `package.json`. Rather than a `tailwind.config.ts`, global variables, themes, and semantic tokens are configured directly in `app/globals.css`.
- **CSS Custom Properties**: `app/globals.css` maps shadcn semantic tokens to GARAPAN design tokens (e.g. `--brand-50` to `--brand-800`, `--ink-200` to `--ink-900`, and surface colors like `--surface-2` for page background).
- **TypeScript Aliasing**: Path mapping `tsconfig.json` specifies path mapping `"@/*": ["./*"]` for absolute imports from the project root.
- **Client & Server State**: Client state is managed with **Zustand** (`store/auth-store.ts` for tracking `user` and `status`). Server state is managed using **TanStack Query v5** (`components/providers.tsx` registers a `QueryClient` with a default `staleTime` of 30,000ms and retry limit of 1).
- **API and BFF layer**: API requests are dispatched via the custom `apiClient` helper (`lib/api/client.ts`). All requests are routed through the BFF proxy layer under `/api/proxy` (e.g. `/api/proxy/admin/...`) which appends the Bearer token stored in an httpOnly cookie, shielding it from client scripts. Session refreshes are routed to `/api/auth/refresh`.
- **Current App State**: The `/app` directory contains only the base page (`app/page.tsx` displaying a "Ke Login" button) and layout (`app/layout.tsx`). The feature pages (`/login`, `/dashboard`, `/users`, `/moderation`, `/disputes`) do not exist yet. This E2E investigation acts as the E2E verification plan before implementing these pages.

---

## 2. Design Handoff Mapping (Screens 1 to 5)

We map the UI labels, routes, selectors, actions, and expected elements from `design_handoff_skillmahasiswa_admin/` for screens 1 to 5:

### 1. Login (`/login`)
- **Route**: `/login` (Prototype file: `page_login.jsx`)
- **UI Labels**: "Masuk ke akun Admin", "Email", "Password", "Lihat"/"Sembunyikan", "Ingat saya di perangkat ini selama 7 hari", "Masuk ke Dashboard", "ATAU", "Masuk dengan SSO Google Workspace".
- **Selectors**:
  - Email input: `input[type="email"]` or `label:has-text("Email") + div input`
  - Password input: `input[type="password"]` (or `input[type="text"]` when visible)
  - Show/Hide Toggle button: `button:has-text("Lihat")`, `button:has-text("Sembunyikan")`
  - Remember Me Checkbox: `input[type="checkbox"]`
  - Login CTA Button: `button[type="submit"]` (contains text "Masuk ke Dashboard")
  - Brand headline: `h1` ("Kelola marketplace freelancer mahasiswa IT dengan satu dashboard.")
- **Expected Interactions**:
  - Valid submission invokes BFF `POST /api/auth/login`, saves session cookies, sets Zustand state, and redirects to `/dashboard`.
  - Toggle button toggles password visibility.
  - Invalid credentials show a validation error toast (Sonner `Toaster`).

### 2. Dashboard (`/dashboard`)
- **Route**: `/dashboard` (Prototype file: `page_dashboard.jsx`)
- **UI Labels**: "Selamat datang kembali, Adinda 👋", "Beranda > Dashboard", "Total User Aktif", "Transaksi Bulan Ini", "Pendapatan Platform (8%)", "Laporan Pending", "Transaksi 30 Hari Terakhir", "Kategori Jasa Populer", "Aktivitas Terbaru", "Perlu Perhatian", "Kesehatan Sistem".
- **Selectors**:
  - Stat Card wrapper: `.card:has-text("Total User Aktif")`, `.card:has-text("Transaksi Bulan Ini")` etc.
  - Line chart period buttons: `button:has-text("7H")`, `button:has-text("30H")`, `button:has-text("90H")`, `button:has-text("1T")`
  - "Perlu Perhatian" navigation buttons: `button:has-text("Laporan Terbuka")`, `button:has-text("Konten Perlu Ditinjau")`, `button:has-text("Live Chat Menunggu")`
  - Quick-link targets: navigate to `/disputes`, `/moderation`, `/chat`, and `/transactions`.
  - System health card metrics: `.card:has-text("Kesehatan Sistem")` contains "API Gateway", "Payment Escrow", "Push Notif" grid items.
- **Expected Interactions**:
  - Period toggles trigger chart updates.
  - "Perlu Perhatian" clicks perform instant client-side routing.
  - Stats display local number formatting (`Rp 328,4 jt`, `16.284`, etc.).

### 3. Users Management (`/users`)
- **Route**: `/users` (Prototype file: `page_users.jsx`)
- **UI Labels**: "Manajemen User", "Mahasiswa", "Klien", "Cari nama atau email...", "Semua", "Aktif", "Suspended", "Pending", "NIM", "Program Studi", "Rating", "Perusahaan", "Pesanan", "Tgl. Daftar", "Aksi", "Suspend Akun", "Aktifkan Kembali", "Verifikasi & Aktifkan".
- **Selectors**:
  - Tab triggers: `button.tab:has-text("Mahasiswa")`, `button.tab:has-text("Klien")`
  - Search input: `input[placeholder*="Cari nama"]`
  - Status select dropdown: `select` (first dropdown)
  - Program Studi select dropdown: `select` (second dropdown, Mahasiswa tab only)
  - Table rows: `table.table tbody tr`
  - Eye button (Aksi): `button[title="Lihat detail"]`
  - Detail Modal: `[role="dialog"]` or `.modal`
  - Modal Footer Actions: `button:has-text("Suspend Akun")`, `button:has-text("Aktifkan Kembali")`, `button:has-text("Verifikasi & Aktifkan")`
- **Expected Interactions**:
  - Tabs toggle columns & search placeholder.
  - Filters automatically recalculate row rendering and result counts.
  - Detail Modal loads full metadata, transaction records, and triggers ban/unban mutations.

### 4. Content Moderation (`/moderation`)
- **Route**: `/moderation` (Prototype file: `page_moderation.jsx`)
- **UI Labels**: "Moderasi Konten", "Perlu Ditinjau", "Dilaporkan Hari Ini", "Ditandai Aman", "Dihapus / Disembunyikan", "Semua", "Ditinjau", "Aman", "Disembunyikan", "Dihapus", "Jasa", "Pemilik", "Kategori", "Laporan", "Review", "Sembunyikan", "Hapus Jasa", "Tandai Aman".
- **Selectors**:
  - Segmented filters: `button:has-text("Semua")`, `button:has-text("Ditinjau")`, `button:has-text("Aman")`, `button:has-text("Disembunyikan")`, `button:has-text("Dihapus")`
  - Review button on listing: `button:has-text("Review")`
  - Flag count badge: `span:has-text("laporan")` (red bg if >= 5, amber if < 5)
  - Review Modal: `[role="dialog"]` or `.modal`
  - Modal Action Buttons: `button:has-text("Sembunyikan")`, `button:has-text("Hapus Jasa")`, `button:has-text("Tandai Aman")`
- **Expected Interactions**:
  - Review Modal lists individual user reports detailing reporter, time, category, and explanation.
  - Action buttons send specific moderation state payloads to backend and invalidate Query cache.

### 5. Disputes & Reports (`/disputes`)
- **Route**: `/disputes` (Prototype file: `page_disputes.jsx`)
- **UI Labels**: "Dispute & Laporan", "Terbuka", "Diproses", "Selesai", "SLA < 24j", "Pelapor", "Terlapor", "Jenis Masalah", "Prioritas", "Status", "Tanggal", "Detail", "Tolak Laporan", "Tutup Laporan (Selesai)", "Bukti Terlampir", "Riwayat Komunikasi", "Tindak Lanjut / Resolusi", "Refund penuh", "Refund parsial", "Peringatan tertulis", "Perpanjangan deadline".
- **Selectors**:
  - Table Detail Trigger: `button:has-text("Detail")`
  - Priority badge: `span:has-text("Tinggi")`, `span:has-text("Sedang")`, `span:has-text("Rendah")`
  - Status badge: `span:has-text("Terbuka")`, `span:has-text("Diproses")`, `span:has-text("Selesai")`
  - Modal follow-up textarea: `textarea[placeholder*="Jelaskan keputusan"]`
  - Quick-fill buttons: `button:has-text("Refund penuh")`, `button:has-text("Refund parsial")`, etc.
  - Tutup Laporan submit button: `button:has-text("Tutup Laporan (Selesai)")`
  - Tolak Laporan button: `button:has-text("Tolak Laporan")`
- **Expected Interactions**:
  - "Tutup Laporan (Selesai)" remains `disabled` until the follow-up text area has content.
  - Clicking quick-fill buttons prepends/replaces textarea text.
  - Action updates dispute status and refreshes table.

---

## 3. Playwright E2E Setup Configuration

Below is the formulated `playwright.config.ts` tailored for the GARAPAN Next.js project. It uses a **Global Setup** pattern to share cookies and session state across tests, preventing redundant login steps.

### Formulated `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Define the session cache path
export const STORAGE_STATE_PATH = path.join(__dirname, 'playwright/.auth/admin-session.json');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Project 1: Setup auth once
    {
      name: 'auth-setup',
      testMatch: /global\.setup\.ts/,
    },
    // Project 2: Main E2E suite using cached auth
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PATH,
      },
      dependencies: ['auth-setup'],
    },
    // Project 3: Run login/logout tests without cached auth
    {
      name: 'auth-gates',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /auth\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Authentication Helper Strategy (`tests/e2e/global.setup.ts`)
```typescript
import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../../playwright.config';

setup('authenticate as admin', async ({ page }) => {
  // Clear any existing cookie context
  await page.context().clearCookies();
  
  // Go to login page
  await page.goto('/login');
  
  // Interact with login form
  await page.fill('input[type="email"]', 'admin@garapan.test');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // Verify successful authentication and redirection
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Assert presence of layout shell sidebar (authenticated zone indicator)
  await expect(page.locator('aside')).toBeVisible();

  // Save cookies and local storage state
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
```

### Network Mocking Strategy
To run E2E tests reliably in isolation (avoiding database contamination and external backend dependency), we intercept and mock API calls through Playwright's `page.route()`.
Example helper pattern:
```typescript
export async function mockApiResponse(page: any, endpoint: string | RegExp, status: number, body: object) {
  await page.route(endpoint, async (route: any) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}
```

---

## 4. Tier 1: Feature Coverage Test Designs (25 Test Cases)

### Feature 1: Login & Logout (`/login`)
*Runs under the `auth-gates` project without cached authentication state.*

#### Test 1.1: Successful Login Flow
- **Description**: Verify that entering valid credentials routes the request to BFF, sets HTTP cookies, and redirects the admin to the dashboard.
- **UI Actions**:
  1. Navigate to `/login`.
  2. Input `admin@garapan.test` in the Email field.
  3. Input `Password123!` in the Password field.
  4. Click "Masuk ke Dashboard".
- **API Intercept Mocks**:
  - Mock `POST /api/auth/login` to return status `200` with body: `{ "user": { "id": "AD-001", "email": "admin@garapan.test", "name": "Adinda", "role": "ADMIN" } }` and inject headers simulating httpOnly session cookie.
  - Mock `GET /api/proxy/admin/me` to return status `200` with the user profile object.
- **Expected Assertions**:
  - Current URL redirects to `/dashboard`.
  - Sidebar profile displays "Adinda" / "Super Admin".
  - Zustand auth state becomes `"authenticated"`.

#### Test 1.2: Failed Login (Invalid Credentials)
- **Description**: Verify that incorrect credentials show a clear error message in Indonesian and prevent dashboard access.
- **UI Actions**:
  1. Navigate to `/login`.
  2. Input `wrongadmin@garapan.test` in the Email field.
  3. Input `WrongPass123!` in the Password field.
  4. Click "Masuk ke Dashboard".
- **API Intercept Mocks**:
  - Mock `POST /api/auth/login` to return status `401` with body: `{ "message": "Email atau password salah." }`.
- **Expected Assertions**:
  - Current URL remains `/login`.
  - Sonner error toast appears with text "Email atau password salah.".
  - Zustand state remains `"guest"`.

#### Test 1.3: Client-side Form Validation
- **Description**: Verify that blank fields or malformed emails show immediate validation messages without calling the backend.
- **UI Actions**:
  1. Navigate to `/login`.
  2. Input `invalid-email-format` in the Email field.
  3. Leave Password field empty.
  4. Click "Masuk ke Dashboard".
- **API Intercept Mocks**:
  - Listen to `POST /api/auth/login` and ensure it is **not** called.
- **Expected Assertions**:
  - URL remains `/login`.
  - Error messages appear below Email field ("Format email tidak valid") and Password field ("Password wajib diisi").

#### Test 1.4: Guest Redirect Guard (Unauthenticated Access)
- **Description**: Verify that trying to access a secure dashboard page when unauthenticated redirects the user back to the login page.
- **UI Actions**:
  1. Clear all cookies.
  2. Navigate directly to `/dashboard`.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/me` to return status `401` Unauthorized.
- **Expected Assertions**:
  - Current URL changes automatically to `/login`.
  - Optional: URL query parameters contain redirect state: `/login?callbackUrl=%2Fdashboard`.

#### Test 1.5: Successful Logout
- **Description**: Verify that logging out clears session tokens and returns the user to the login screen.
- **UI Actions**:
  1. Navigate to `/dashboard` (assuming authenticated via cookie).
  2. Click the Logout icon button in the Sidebar footer.
- **API Intercept Mocks**:
  - Mock `POST /api/auth/logout` to return status `200` success and clear cookies.
- **Expected Assertions**:
  - Current URL redirects to `/login`.
  - Zustand auth state resets to `user: null`, `status: "guest"`.
  - Clicking "Back" on browser does not show the dashboard (guest redirection operates).

---

### Feature 2: Dashboard (`/dashboard`)
*Runs under the `chromium` project with cached session state.*

#### Test 2.1: Render Statistics Cards and Formats
- **Description**: Verify the dashboard loads successfully and displays the 4 core cards with accurate formatted Indonesian currency and numbers.
- **UI Actions**:
  1. Navigate to `/dashboard`.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/stats` to return:
    ```json
    {
      "activeUsers": 16284, "activeUsersDelta": 8.4,
      "transactionsThisMonth": 1942, "transactionsDelta": 12.1,
      "platformRevenue": 328400000, "revenueDelta": 6.2,
      "pendingReports": 27, "reportsDelta": -4.3
    }
    ```
- **Expected Assertions**:
  - "Total User Aktif" card shows value `"16.284"` and delta badge `"+8.4%"`.
  - "Transaksi Bulan Ini" card shows value `"1.942"` and delta badge `"+12.1%"`.
  - "Pendapatan Platform (8%)" card shows value `"Rp 328,4 jt"` or `"Rp 328.400.000"` (subject to final formatting spec) and delta badge `"+6.2%"`.
  - "Laporan Pending" card shows value `"27"` and delta badge `"-4.3%"`.

#### Test 2.2: Line Chart Period Selector Actions
- **Description**: Verify that clicking different period selectors (7H, 30H, 90H, 1T) updates the transaction charts.
- **UI Actions**:
  1. Navigate to `/dashboard`.
  2. Click the `"7H"` button in the "Transaksi 30 Hari Terakhir" card.
- **API Intercept Mocks**:
  - Mock initial load `GET /api/proxy/admin/stats/transactions?period=30` with 30 items.
  - Mock subsequent load `GET /api/proxy/admin/stats/transactions?period=7` with 7 items.
- **Expected Assertions**:
  - Verify network request for `period=7` is dispatched.
  - Line chart renders updated data nodes.
  - The `"7H"` button displays active styles (primary class), while `"30H"` drops active styles.

#### Test 2.3: Recent Activity Rendering
- **Description**: Verify the activity feed populates with the correct chronological rows, labels, and event-specific styling.
- **UI Actions**:
  1. Navigate to `/dashboard`.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/activity` to return 10 items containing order creation, user registration, and report filing.
- **Expected Assertions**:
  - Feed renders exactly 10 row items.
  - An "order" item displays a blue wallet icon.
  - A "user" item displays a green users icon.
  - A "report" item displays a red flag icon.

#### Test 2.4: System Health Service Statuses
- **Description**: Verify health indicators reflect operational status metrics for backend systems.
- **UI Actions**:
  1. Navigate to `/dashboard`.
- **Expected Assertions**:
  - Health container displays "Semua layanan beroperasi normal".
  - Status dot contains success indicator shadow/color (`#10B981`).
  - System tiles show "API Gateway: 99.98%" (ok), "Payment Escrow: 99.91%" (ok), and "Push Notif: 98.72%" (warn - amber pill/color).

#### Test 2.5: Attention Banner Navigation
- **Description**: Verify that clicking quick-links under the "Perlu Perhatian" banner correctly navigates to the target page.
- **UI Actions**:
  1. Navigate to `/dashboard`.
  2. Click the row button labeled "Laporan Terbuka".
- **Expected Assertions**:
  - URL redirects to `/disputes`.
  - Active navigation state in the Sidebar highlights the "Dispute & Laporan" tab.

---

### Feature 3: Users Management (`/users`)
*Runs under the `chromium` project.*

#### Test 3.1: Tab Switching (Mahasiswa vs. Klien)
- **Description**: Verify that clicking tabs swaps user list, column headers, and totals.
- **UI Actions**:
  1. Navigate to `/users`.
  2. Observe default "Mahasiswa" tab.
  3. Click "Klien" tab.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/users?role=mahasiswa` to return student list.
  - Mock `GET /api/proxy/admin/users?role=klien` to return client list.
- **Expected Assertions**:
  - Clicking "Klien" changes table headers from "NIM", "Program Studi", "Rating" to "Perusahaan", "Email", "Pesanan".
  - Tab button "Klien" has the `.active` class.
  - Search placeholder changes to "Cari nama atau perusahaan…".

#### Test 3.2: Filter and Search Execution
- **Description**: Verify that entering search strings and selecting filters fetches the matching subset and updates results count.
- **UI Actions**:
  1. Navigate to `/users`.
  2. Select status filter "Suspended".
  3. Select program studi filter "Teknik Informatika".
  4. Type "Hendra" in search input.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/users?role=mahasiswa&status=Suspended&prodi=Teknik%20Informatika&q=Hendra` to return 1 record.
- **Expected Assertions**:
  - Result label shows `"1 dari X hasil"` matching the mocked response count.
  - Table renders exactly 1 row containing "Hendra" with status pill "Suspended".

#### Test 3.3: Student Detail Modal and History
- **Description**: Verify clicking a student record loads the modal with their profile info, transaction list, and dispute history.
- **UI Actions**:
  1. Navigate to `/users`.
  2. Click on student name "Adnan Wijaya" in the table row, or click its Eye action button.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/users/MH-401` to return Adnan's detail record, transaction history, and report logs.
- **Expected Assertions**:
  - Modal overlay is visible.
  - Modal title is "Detail User".
  - Inside modal, fields show: NIM "1203220042", Prodi "Teknik Informatika", Status pill "Aktif".
  - Modal footer displays "Tutup" and "Suspend Akun" (since status is "Aktif").

#### Test 3.4: Client Detail Modal and History
- **Description**: Verify clicking a client record loads the modal with client-specific metrics and histories.
- **UI Actions**:
  1. Navigate to `/users`.
  2. Switch to "Klien" tab.
  3. Click on client name "CV Jaya Abadi" or its Eye icon.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/users/CL-882` to return CV Jaya Abadi details.
- **Expected Assertions**:
  - Detail modal displays Company "CV Jaya Abadi" and "23 pesanan".
  - Modal footer displays "Tutup" and "Suspend Akun".

#### Test 3.5: Moderation Action - Suspend Account
- **Description**: Verify that confirming a suspension from the detail modal updates the user status on the table.
- **UI Actions**:
  1. Navigate to `/users`.
  2. Click Eye icon on active student "Adnan Wijaya".
  3. In modal, click "Suspend Akun".
- **API Intercept Mocks**:
  - Mock `POST /api/proxy/admin/users/MH-401/suspend` to return status `200` success.
  - Mock list refetch `GET /api/proxy/admin/users?role=mahasiswa` to return "Adnan Wijaya" with status "Suspended".
- **Expected Assertions**:
  - Modal closes.
  - Success toast "Akun berhasil ditangguhkan" is displayed.
  - The status pill for "Adnan Wijaya" in the data table changes to "Suspended" (red pill).

---

### Feature 4: Content Moderation (`/moderation`)
*Runs under the `chromium` project.*

#### Test 4.1: Flagged Content Summary and Table
- **Description**: Verify the moderation overview and table render correctly with appropriate flag warning indicators.
- **UI Actions**:
  1. Navigate to `/moderation`.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/moderation/stats` to return metrics.
  - Mock `GET /api/proxy/admin/moderation/flagged` to return list of flagged listings.
- **Expected Assertions**:
  - "Perlu Ditinjau" shows value `"8"` (warn color).
  - Row with >=5 reports displays a red flag badge (`--danger-700` text on `--danger-50` background).
  - Row with <5 reports displays an amber flag badge (`--warn-700` text on `--warn-50` background).

#### Test 4.2: Status Tab Filters
- **Description**: Verify that clicking segmented filters ("Semua", "Ditinjau", "Aman", "Disembunyikan", "Dihapus") updates the list.
- **UI Actions**:
  1. Navigate to `/moderation`.
  2. Click the "Disembunyikan" segmented filter button.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/moderation/flagged?status=Disembunyikan` to return list of hidden listings.
- **Expected Assertions**:
  - Table updates and displays only listings with status pill "Disembunyikan".
  - Active segmented tab highlights "Disembunyikan".

#### Test 4.3: Moderation Review Modal Contents
- **Description**: Verify that clicking review loads the full details of the flagged service and the list of report reasons.
- **UI Actions**:
  1. Navigate to `/moderation`.
  2. Click "Review" on listing "Jasa Website Portofolio" (ID: `JS-024`).
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/moderation/flagged/JS-024` to return detailed listing info with 3 user reports.
- **Expected Assertions**:
  - Modal opens with title "Review Konten Dilaporkan".
  - Left panel shows title "Jasa Website Portofolio", price range, description, and owner "Adnan Wijaya".
  - Right panel shows header "Alasan Laporan (3)".
  - Individual reports show reporters "Andika Surya", "Laras Wulandari", and "Hendra Gunawan" with their quoted reasons.

#### Test 4.4: Moderation Decision: Mark Safe
- **Description**: Verify that clicking "Tandai Aman" marks the listing safe, updates the status, and refreshes statistics.
- **UI Actions**:
  1. Navigate to `/moderation`.
  2. Click "Review" on listing `JS-024`.
  3. Click "Tandai Aman".
- **API Intercept Mocks**:
  - Mock `POST /api/proxy/admin/moderation/flagged/JS-024/safe` to return status `200` success.
  - Mock list refetch `GET /api/proxy/admin/moderation/flagged` to show `JS-024` status as "Aman".
- **Expected Assertions**:
  - Modal closes.
  - Success toast "Jasa ditandai aman dan dipulihkan" displays.
  - The status pill for `JS-024` in the moderation table becomes "Aman" (green pill).

#### Test 4.5: Moderation Decision: Delete Listing
- **Description**: Verify that clicking "Hapus Jasa" removes the listing and updates the table.
- **UI Actions**:
  1. Navigate to `/moderation`.
  2. Click "Review" on listing `JS-024`.
  3. Click "Hapus Jasa".
- **API Intercept Mocks**:
  - Mock `DELETE /api/proxy/admin/moderation/flagged/JS-024` to return status `200` success.
  - Mock list refetch `GET /api/proxy/admin/moderation/flagged` to return list excluding `JS-024`.
- **Expected Assertions**:
  - Modal closes.
  - Success toast "Jasa berhasil dihapus secara permanen" displays.
  - Listing `JS-024` is removed from the table view.

---

### Feature 5: Disputes & Reports (`/disputes`)
*Runs under the `chromium` project.*

#### Test 5.1: Disputes Overview and Priorities
- **Description**: Verify dispute list rendering, priority styling, and SLA status counters.
- **UI Actions**:
  1. Navigate to `/disputes`.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/disputes` to return a list of active disputes.
- **Expected Assertions**:
  - SLA < 24j stat card displays `"3"`.
  - A dispute with priority "Tinggi" displays red pill styling (`--danger-700` text, `--danger-50` background).
  - A dispute with status "Terbuka" displays amber pill styling (`--warn-700` text, `--warn-50` background).

#### Test 5.2: Filter by Issue Type
- **Description**: Verify filtering by issue type updates table records.
- **UI Actions**:
  1. Navigate to `/disputes`.
  2. Select "Permintaan refund" in the issue dropdown.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/disputes?issueType=Permintaan%20refund` to return filtered list.
- **Expected Assertions**:
  - Disputes table contains only rows with "Permintaan refund" under the "Jenis Masalah" column.

#### Test 5.3: Dispute Detailed Timeline and Attachments
- **Description**: Verify details modal displays reporter/defendant cards, timeline, and uploaded images.
- **UI Actions**:
  1. Navigate to `/disputes`.
  2. Click "Detail" on dispute `LP-842`.
- **API Intercept Mocks**:
  - Mock `GET /api/proxy/admin/disputes/LP-842` to return full dispute schema including timeline logs and 3 attachment URLs.
- **Expected Assertions**:
  - Modal is titled "Detail Laporan — LP-842".
  - Pelapor section shows "CL-0918" (Klien) and Terlapor section shows "MH-2041" (Mahasiswa).
  - 3 image containers are visible under "Bukti Terlampir (3)".
  - Timeline displays 4 history nodes (from "Mengajukan laporan" to "Memberi tanggapan").

#### Test 5.4: Dispute Decision: Reject Report
- **Description**: Verify rejecting a dispute updates status and closes modal.
- **UI Actions**:
  1. Navigate to `/disputes`.
  2. Click "Detail" on dispute `LP-842`.
  3. Click "Tolak Laporan".
- **API Intercept Mocks**:
  - Mock `POST /api/proxy/admin/disputes/LP-842/reject` to return status `200` success.
  - Mock list refetch `GET /api/proxy/admin/disputes` to return `LP-842` status as "Ditolak".
- **Expected Assertions**:
  - Modal closes.
  - Toast notification "Laporan berhasil ditolak" displays.
  - Status pill for `LP-842` in the main table updates to "Ditolak".

#### Test 5.5: Dispute Decision: Resolve with Refund Action
- **Description**: Verify resolving dispute requires a resolution text, enables the submit button, and processes the resolution.
- **UI Actions**:
  1. Navigate to `/disputes`.
  2. Click "Detail" on dispute `LP-842`.
  3. Observe that "Tutup Laporan (Selesai)" button is `disabled`.
  4. Click the quick-fill button "Refund penuh".
  5. Check that the follow-up textarea now contains "Refund penuh".
  6. Observe that "Tutup Laporan (Selesai)" button is now `enabled`.
  7. Click "Tutup Laporan (Selesai)".
- **API Intercept Mocks**:
  - Mock `POST /api/proxy/admin/disputes/LP-842/resolve` with body `{ "resolution": "Refund penuh" }` to return status `200`.
  - Mock list refetch `GET /api/proxy/admin/disputes` to return `LP-842` status as "Selesai".
- **Expected Assertions**:
  - Modal closes.
  - Success toast "Laporan dispute diselesaikan" displays.
  - Status pill for `LP-842` in the table updates to "Selesai" (green pill).
