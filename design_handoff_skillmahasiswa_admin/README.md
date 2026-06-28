# Handoff: SkillMahasiswa Admin Panel

## Overview

This is a full admin console for **SkillMahasiswa** — a freelancer marketplace platform connecting IT students (mahasiswa) with clients (klien). The admin panel covers user management, content moderation, dispute resolution, transaction/escrow monitoring, live chat support, blog/article management, and system settings.

The platform is built around the concept that verified IT students can offer freelance services (jasa) to clients, with all payments held in escrow until work is approved.

---

## About the Design Files

The files bundled in this handoff are **hi-fidelity HTML prototypes** — they demonstrate the intended look, layout, and interactive behavior of the admin panel. They are **not production code to copy directly**.

Your task is to **recreate these designs in your target codebase** (React, Next.js, Vue, etc.) using that codebase's established patterns, component libraries, and routing conventions. If no codebase exists yet, **React + Next.js (App Router)** is the recommended choice given the complexity of this dashboard.

---

## Fidelity

**High-fidelity.** Every screen has final colors, typography, spacing, component states (hover, active, disabled), and representative dummy data in Indonesian. Recreate pixel-accurately using the design tokens listed below.

---

## Screens / Views

### 1. Login (`/login`)
**Purpose:** Admin authentication before accessing the panel.

**Layout:**
- Two-column, 50/50 split, full viewport height (`min-height: 100vh`)
- Left column: branded hero panel
- Right column: centered form, max-width 400px

**Left hero panel:**
- Background: radial gradient `radial-gradient(120% 80% at 0% 0%, #4A68E0 0%, #1938A8 40%, #10255F 100%)`
- Logo mark: `42×42px`, border-radius `12px`, gradient `135deg #2047C9 → #152E88`, white text "Sm", font-size `18px`, font-weight 800
- Brand name: "SkillMahasiswa", Inter/Plus Jakarta Sans, 18px, weight 800, white
- Subtitle: "Admin Console · v2.4", 12px, opacity 0.7, white
- Hero headline: 38px, weight 800, line-height 1.1, letter-spacing -0.025em, white
- Body text: 15px, line-height 1.55, opacity 0.78, white, max-width 460px
- 3 stat items (row): each with large number (24px, weight 800) + label (12.5px, opacity 0.7)
- Decorative SVG circles: absolute positioned, right -80px top -80px, opacity 0.14
- Footer text: "© 2026 SkillMahasiswa. Hanya untuk akses internal.", 12px, opacity 0.55, absolute bottom 32px left 56px
- Padding: 48px 56px

**Right form panel:**
- Background: `#FFFFFF`
- Heading: 26px, weight 700, letter-spacing -0.02em
- Subtext: 14px, color `#6B7280`
- Form fields: Email (with mail icon), Password (with lock icon + show/hide toggle)
- Checkbox: "Ingat saya di perangkat ini selama 7 hari"
- Primary CTA button: full-width, height 44px, 14px, primary blue
- Divider "ATAU" separator
- SSO Google button: full-width, height 44px, secondary style, Google "G" SVG icon
- Footer note: 12px, centered, ink-400
- Padding: 48px

---

### 2. Dashboard (`/dashboard`)
**Purpose:** Overview of platform health — stats, charts, recent activity, alerts.

**Layout:**
- Shell layout (sidebar 248px + main area)
- Page padding: 28px 32px 48px
- Grid rows: page-head → 4-col stat cards → 2-col chart row → 2-col bottom row

**Stat cards (4 columns, gap 16px):**
Each card: white, border `#E5E9F0`, border-radius 10px, padding 20px 22px, min-height 138px
- Icon badge: 38×38px, border-radius 9px, color-specific bg at 9% opacity
- Label: 12.5px, ink-400, weight 500
- Value: 28px, weight 800, Plus Jakarta Sans, letter-spacing -0.02em
- Delta badge: pill with up/down arrow icon, green for positive, red for negative, 12px weight 600
- "vs bulan lalu" label: 12px, ink-400
- Sparkline SVG: 220×32px, color matches icon

Stats:
1. Total User Aktif — `16.284` — +8.4% — blue `#2047C9`
2. Transaksi Bulan Ini — `1.942` — +12.1% — green `#10B981`
3. Pendapatan Platform (8%) — `Rp 328,4 jt` — +6.2% — amber `#F59E0B`
4. Laporan Pending — `27` — -4.3% — red `#EF4444`

**Chart row (1.7fr : 1fr, gap 16px):**

*Left — Line chart card:*
- Card with header (title + period toggle buttons 7H/30H/90H/1T)
- 3 summary numbers above chart (Total pesanan 3.741, Nilai transaksi Rp 4,1M, Rata-rata 124/hari)
- SVG line chart, 30 data points, height 230px, brand blue `#2047C9` with gradient fill area
- Y-axis labels: 10.5px Inter, ink-400; X-axis: day labels

*Right — Donut chart card:*
- Donut SVG, size 170px, inner radius 62% of outer
- Center text: total number (22px weight 700) + "total jasa" label
- Legend list alongside: colored squares (10×10 radius 3), category name, percentage (mono)
- Categories with blues: Web Dev `#2047C9`, Mobile `#4A68E0`, UI/UX `#7E95F0`, Digital Mkt `#B6C3F9`, Lainnya `#DCE4FD`

**Bottom row (1.7fr : 1fr, gap 16px):**

*Left — Aktivitas Terbaru:*
- List of 10 items, each row: icon badge (34×34, radius 8, color-coded) + text + timestamp
- Types: order (blue), user (green), report (red)
- Item padding: 12px 22px, border-bottom between items

*Right column (stacked):*
- "Perlu Perhatian" card: 4 quick-link rows (laporan, konten, chat, transaksi) — each navigates to that section
- System health dark card: bg `linear-gradient(135deg, #0F1729, #1F2B4D)`, white text, 3 metric tiles

---

### 3. Manajemen User (`/users`)
**Purpose:** View, filter, search, and manage all mahasiswa and klien accounts.

**Layout:**
- Single card with top tabs (Mahasiswa / Klien) + filter bar + data table + pagination

**Tabs:** "Mahasiswa [n]" | "Klien [n]" — border-bottom active style, brand blue

**Filter bar (flex, gap 10px):**
- Search input (max-width 320px)
- Status select: Semua / Aktif / Suspended / Pending
- Prodi select (mahasiswa tab only): 6 program studi options
- "Filter lanjutan" button
- Result count label (right-aligned)

**Table columns (Mahasiswa):**
checkbox | Mahasiswa (avatar + name + email) | NIM | Program Studi | Status | Rating | Tgl. Daftar | Aksi

**Table columns (Klien):**
checkbox | Klien (avatar + name + email) | Perusahaan | Email | Status | Pesanan | Tgl. Daftar | Aksi

**Avatar:** 32×32 circle, gradient background (8 color variants av-0 to av-7), white initials, weight 700, 12px

**Status pills:**
- Aktif: `#047857` text on `#ECFDF5` bg
- Suspended: `#B91C1C` text on `#FEF2F2` bg
- Pending: `#B45309` text on `#FFFBEB` bg

**Rating display:** Star icon (amber fill) + number (weight 600) + count in parentheses (muted)

**Aksi column:** Eye icon button + More icon button (32×32, border, radius 7px)

**Detail Modal (lg, max-width 820px):**
- Header: avatar (72×72) + name (20px weight 700) + email + status pills
- Info grid (2 cols): NIM, Prodi, Rating, Tgl. Daftar (or Perusahaan, Pesanan, Telp, Tgl. Daftar for klien)
- Riwayat Transaksi section (surface-2 bg): TRX ID + jasa name + nominal + status
- Riwayat Laporan section: LP ID + jenis + date + status
- Footer buttons: Tutup + conditional action (Suspend / Aktifkan / Verifikasi)

---

### 4. Moderasi Konten (`/moderation`)
**Purpose:** Review flagged service listings and take moderation actions.

**Layout:**
- 4 summary stat cards → filter bar + table

**Summary cards (4 cols):**
- Perlu Ditinjau: 8 (warn yellow)
- Dilaporkan Hari Ini: 12 (info blue)
- Ditandai Aman: 142 (success green)
- Dihapus/Disembunyikan: 37 (danger red)

**Filter bar:** Segmented button group (Semua/Ditinjau/Aman/Disembunyikan/Dihapus) + search + date filter

**Table columns:**
Jasa (44×44 thumbnail placeholder + title + ID) | Pemilik (avatar + name) | Kategori (pill) | Laporan count (colored pill) | Status | Tanggal Posting | Aksi (Review button)

**Laporan count pill:** red bg if ≥5 reports, amber if <5

**Review Modal (lg):**
- 2-column grid: left = content preview + title + tags + description + owner card; right = list of report reasons
- Each report reason: border card with reporter avatar + name + timestamp + category pill + quoted reason text
- Footer: Batal | Sembunyikan | Hapus Jasa (red) | Tandai Aman (green)

---

### 5. Dispute & Laporan (`/disputes`)
**Purpose:** Manage reported disputes between clients and freelancers.

**Layout:**
- 4 stat cards → filter bar + table

**Stat cards:** Terbuka (12), Diproses (8), Selesai (147), SLA < 24j (3)

**Table columns:**
ID (mono blue) | Pelapor (avatar + name) | Terlapor (avatar + name) | Jenis Masalah | Prioritas pill | Status pill | Tanggal | Detail button

**Prioritas pills:**
- Tinggi: `#B91C1C` on `#FEF2F2`
- Sedang: `#B45309` on `#FFFBEB`
- Rendah: `#6B7280` on `#EEF1F7`

**Detail Modal (lg):**
- Pills row: status + prioritas + opened date + linked transaction
- 2-col grid: Pelapor card (surface-2) + Terlapor card (surface-2)
- Deskripsi Masalah: white bordered card, 13.5px text
- Bukti Terlampir: 3 image placeholder tiles (4:3 ratio)
- Riwayat Komunikasi: vertical timeline with dot indicators, each entry has timestamp + actor + action text
- Tindak Lanjut textarea + quick-fill buttons (Refund penuh, Refund parsial, Peringatan tertulis, Perpanjangan deadline)
- Footer: Tutup | Tolak Laporan (ghost danger) | Tutup Laporan/Selesai (primary, disabled until textarea filled)

---

### 6. Transaksi & Escrow (`/transactions`)
**Purpose:** Monitor all financial transactions and escrow fund statuses.

**Layout:**
- 4 stat cards → filter bar + table

**Stat cards:**
- Total Nilai Escrow: Rp 428,5 jt (info blue)
- Ditahan: Rp 184,2 jt (warn)
- Dicairkan Bulan Ini: Rp 3,24 M (success)
- Refund: Rp 12,8 jt (danger)

**Table columns:**
ID Transaksi (mono blue) | Klien (avatar + name) | Mahasiswa (avatar + name) | Jasa (truncated) | Nominal (mono bold) | Status Escrow | Tanggal | Eye icon

**Status escrow:**
- Ditahan: amber pill
- Dicairkan: green pill
- Refund: red pill

**Detail Modal (lg) — Escrow timeline:**
- Header: wallet icon badge (52×52, radius 12, brand-50 bg) + IDR amount (24px weight 800) + status pill + date
- 2-col cards: Klien info + Mahasiswa info (each surface-2, with avatar + name + role)
- Jasa card: bordered, shows package details
- Escrow Timeline: vertical step list with circle indicators
  - Steps: Pembayaran diterima → Dana masuk escrow → Pengerjaan dimulai → Submit hasil → Dana dicairkan
  - Done steps: green filled circle with check icon; pending: white circle with border
  - Connector line: green for done, gray for pending
- Bukti Pembayaran: 2 document placeholder tiles (140px wide, 3:4 aspect ratio)
- Footer: Tutup | Proses Refund (danger) | Cairkan Dana (success) — conditional on status

---

### 7. Live Chat (`/chat`)
**Purpose:** Admin responds to support chat from users in real-time.

**Layout:**
- 3-column layout within card: `320px | 1fr | 280px`
- Height: `calc(100vh - 210px)`, min-height 540px
- No internal scroll on the outer grid — each panel scrolls independently

**Left panel (320px) — Session list:**
- Search input + filter buttons (Semua / Belum dibaca / Klien / Mahasiswa)
- Session rows: avatar (with online dot) + name + time + last message + unread badge + role pill
- Active row: brand-50 bg, 3px brand-500 left border
- Online indicator: 10×10 green dot, absolute bottom-right of avatar, 2px white border

**Center panel — Chat:**
- Top bar: avatar + name + online status + role + icon buttons + "Tutup Sesi" red button
- Messages area: surface-2 background, padding 18px 24px
  - Me bubbles: brand-500 bg, white text, radius `14px 14px 4px 14px`, right-aligned, max-width 72%
  - Them bubbles: white bg, ink-900 text, border, radius `14px 14px 14px 4px`, left-aligned
  - Timestamp: 10.5px, ink-400, below each bubble
  - Date separator pill: centered, 11px, surface/border style
- Input area: white bg, top border, flex column
  - Quick suggestion buttons row (💡, 📎, 📋)
  - Input container: bordered radius 10, flex row with icon buttons + textarea + send button

**Right panel (280px) — User info:**
- Avatar (72×72) + name + role/ID + action buttons (Profil, Blokir)
- Info Kontak: surface-2 card (email, phone, join date)
- Transaksi Terkait: list of linked orders (bordered cards with ID + status + label)
- Catatan Admin: textarea (surface-2)

---

### 8. Artikel & Blog (`/articles`)
**Purpose:** Manage educational blog posts for the platform.

**Layout:**
- 3 summary cards → filter bar + table
- "Buat Artikel Baru" navigates to the editor view within the same page

**Summary cards (3 cols):**
- Total Artikel: 47 (34 Published, 13 Draft)
- Total Pembaca 30 hari: 28.4K (+18%)
- Artikel Terpopuler: title + views + date

**Table columns:**
Artikel (56×42 icon tile + title + ID) | Kategori | Status | Tgl. Publikasi | Views | Aksi (edit + preview + more)

**Article Editor view (replaces list when "Buat Artikel Baru" clicked):**
- 2-col layout: editor area (1fr) + settings sidebar (320px)
- Editor area (card):
  - Title input: 30px weight 800, Plus Jakarta Sans, no border, full-width
  - Status pill + autosave timestamp
  - Thumbnail upload area: 16:7 aspect ratio, dashed 2px border, drag-drop UI
  - Toolbar: paragraph/heading select + Bold/Italic/Link/List/Image icon buttons + Kutipan/Code block
  - Textarea: 15px, line-height 1.7, no border, padding 0
- Settings sidebar:
  - Pengaturan Publikasi card: Kategori select, Tags (pill chips with ×), Jadwal, SEO meta description textarea
  - SEO tips card: brand-50 bg, brand-700 text, tip text

---

### 9. Profil & Settings (`/settings`)
**Purpose:** Admin account management and system configuration.

**Layout:**
- 2-col: `240px sidebar | 1fr content`
- Sidebar: card with nav buttons (5 items)
- Content: changes based on active sub-tab

**Sub-tab: Informasi Profil**
- Avatar (84×84) + upload/delete buttons
- 2-col grid form: Nama Lengkap, Email (disabled), Nomor Telepon, Role (select), Bio (full-width textarea)

**Sub-tab: Keamanan & Password**
- Ganti Password card: 3 password inputs + security tip box + update button
- 2FA card: shield icon + status indicator + manage button

**Sub-tab: Preferensi Notifikasi**
- Table with columns: Peristiwa | Email | Push | SMS (checkboxes)
- Grouped by category (Laporan & Dispute, Transaksi, Komunikasi) with surface-2 group headers

**Sub-tab: Tim & Izin Akses**
- Table: Nama/email/avatar | Role pill | Status pill | Terakhir Aktif | More button
- "Undang Admin" primary button in header

**Sub-tab: Log Aktivitas**
- Chronological list: avatar + "[Who] [action]" + timestamp
- Ekspor button in header

---

## Interactions & Behavior

### Navigation
- Client-side routing; sidebar items navigate instantly (no page reload)
- Active sidebar item: brand-50 bg, brand-600 text, font-weight 600
- Current page stored in localStorage key `sm-admin-page` (wrap in try/catch — some environments restrict localStorage)
- Login → Dashboard on form submit; Logout → Login via sidebar footer icon

### Modals
- Open: fade-in overlay (0.16s) + zoom-in modal (0.18s scale 0.96→1)
- Close: click overlay, click ✕ button, or press Escape
- Footer action buttons: right-aligned, gap 10px

### Tables & Filtering
- All filters are client-side on the current page's data
- Filters combine: status + prodi/kategori + search query (case-insensitive substring on name + email)
- Empty state: centered icon + "Tidak ada hasil" heading + hint text
- Hover row: background changes to `#F7F8FB`
- Pagination: shows start–end of total, page number buttons (max 5 visible), prev/next icons

### Chat
- Messages display latest at bottom
- "Kirim" button sends (UI only in prototype)
- Online dot: `#10B981` green; offline: `#94A3B8` gray
- Unread badge: brand-500 circle, white text, min-width 18px

### Top Bar
- Notification dropdown: click bell → dropdown (width 340px, max-height 360px scrollable)
- Profile dropdown: click profile pill → dropdown (width 220px)
- Both dropdowns close when clicking outside

### Article Editor
- "Buat Artikel Baru" and any edit action replaces article list with editor view (no router change needed — internal state toggle)
- "Batal" returns to article list
- Primary CTA "Publikasikan" should be disabled until title and content are non-empty

---

## State Management

| State | Scope | Type |
|---|---|---|
| `page` | App | string — current route ID |
| `tab` | Users, Articles, Settings | string — active sub-tab |
| `filterStatus` | Users, Disputes, Transactions, Moderation | string |
| `filterProdi` | Users (mahasiswa) | string |
| `q` | All table pages | string — search query |
| `detail` | Users, Moderation, Disputes, Transactions | object or null — open modal data |
| `activeId` | Chat | string — active session ID |
| `editing` | Articles | boolean — editor vs list view |
| `draft` | Chat | string — current message input |
| `resolusi` | Disputes | string — resolution text |

---

## Design Tokens

### Colors

```css
/* Brand */
--brand-50:   #EEF2FE
--brand-100:  #DCE4FD
--brand-200:  #B6C3F9
--brand-300:  #7E95F0
--brand-400:  #4A68E0
--brand-500:  #2047C9   /* Primary */
--brand-600:  #1938A8
--brand-700:  #152E88
--brand-800:  #10255F

/* Ink (text) */
--ink-900:    #0F1729   /* Headings, primary text */
--ink-700:    #273043   /* Body text */
--ink-500:    #4B5563   /* Secondary text */
--ink-400:    #6B7280   /* Muted / placeholder */
--ink-300:    #94A3B8   /* Very muted */
--ink-200:    #C9D0DB   /* Borders (soft) */

/* Surface */
--surface:    #FFFFFF
--surface-2:  #F7F8FB   /* Page background */
--surface-3:  #EEF1F7   /* Hover state bg */
--border:     #E5E9F0
--border-strong: #D1D7E2

/* Feedback */
--success-50:  #ECFDF5
--success-500: #10B981
--success-700: #047857

--warn-50:     #FFFBEB
--warn-500:    #F59E0B
--warn-700:    #B45309

--danger-50:   #FEF2F2
--danger-500:  #EF4444
--danger-700:  #B91C1C

--info-50:     #EFF6FF
--info-500:    #3B82F6
```

### Typography

```css
--f-display: "Plus Jakarta Sans", system-ui, sans-serif
--f-body:    "Inter", system-ui, sans-serif
--f-mono:    "JetBrains Mono", ui-monospace, monospace

/* Scale */
Page title:       24px / 700 / -0.02em  / Plus Jakarta Sans
Card title:       15px / 700 / -0.01em  / Plus Jakarta Sans
Section heading:  14px / 700            / Plus Jakarta Sans
Table header:     11.5px / 600 / 0.04em / Inter / uppercase / ink-400
Body:             14px / 400 / 1.5      / Inter
Body small:       13.5px / 400          / Inter
Label:            12.5px / 600          / Inter / ink-700
Muted text:       12.5px / 400          / Inter / ink-400
Extra small:      11.5px / 400          / Inter / ink-400
Mono:             12.5px / 400          / JetBrains Mono
Stat value:       28px / 800 / -0.02em  / Plus Jakarta Sans
Hero heading:     38px / 800 / -0.025em / Plus Jakarta Sans
```

### Spacing

```
4px / 6px / 8px / 10px / 12px / 14px / 16px / 18px / 20px / 22px / 24px / 28px / 32px / 48px
Card padding:     20px 22px
Page padding:     28px 32px 48px
Table cell:       14px 18px (td) / 11px 18px (th)
Modal body:       20px 22px
```

### Border Radius

```
--r-sm:  6px   (xs buttons, tags)
--r-md:  8px   (buttons, inputs, icon buttons)
--r-lg:  10px  (cards)
--r-xl:  14px  (modals)
999px          (pills, badges, profile pill)
```

### Shadows

```css
--sh-1: 0 1px 2px rgba(15,23,41,.04), 0 1px 3px rgba(15,23,41,.04)   /* Cards */
--sh-2: 0 4px 12px rgba(15,23,41,.06), 0 2px 4px rgba(15,23,41,.04)
--sh-3: 0 20px 40px -12px rgba(15,23,41,.18), 0 8px 16px rgba(15,23,41,.06)  /* Modals, dropdowns */
```

### Avatar Gradients (8 variants, av-0 to av-7)

```css
av-0: linear-gradient(135deg, #F7C38D, #E9765A)   /* Orange */
av-1: linear-gradient(135deg, #93C5FD, #2563EB)   /* Blue */
av-2: linear-gradient(135deg, #A7F3D0, #059669)   /* Green */
av-3: linear-gradient(135deg, #FCA5A5, #DC2626)   /* Red */
av-4: linear-gradient(135deg, #C4B5FD, #7C3AED)   /* Purple */
av-5: linear-gradient(135deg, #FDE68A, #D97706)   /* Amber */
av-6: linear-gradient(135deg, #F9A8D4, #DB2777)   /* Pink */
av-7: linear-gradient(135deg, #A5F3FC, #0E7490)   /* Teal */
```
Avatar color is determined by: `seed_string → sum of charCodes * 31 → abs → mod 8`

---

## Component Inventory

### Buttons
| Variant | Height | Padding | Font | Style |
|---|---|---|---|---|
| Primary | 38px | 0 14px | 13.5px/600 | brand-500 bg, white text |
| Secondary | 38px | 0 14px | 13.5px/600 | white bg, border-strong, ink-700 |
| Success | 38px | 0 14px | 13.5px/600 | success-500 bg, white |
| Danger | 38px | 0 14px | 13.5px/600 | danger-500 bg, white |
| Ghost | 38px | 0 14px | 13.5px/600 | transparent, ink-500 |
| sm | 32px | 0 10px | 12.5px | same variants |
| xs | 26px | 0 8px | 12px | same variants |
| Icon btn | 32×32px | — | — | border, radius 7px, white bg |

### Status Pills
Inline badge: `display: inline-flex`, `align-items: center`, `gap: 6px`, `padding: 3px 9px`, `border-radius: 999px`, `font-size: 11.5px`, `font-weight: 600`

Leading dot: `::before` pseudo, 6×6px circle, same color as text, opacity 0.8
`.no-dot` modifier removes the dot.

### Inputs
Height 38px, padding `0 12px`, border `1px solid #D1D7E2`, border-radius 8px, font 13.5px
Focus: border `#4A68E0`, box-shadow `0 0 0 3px #EEF2FE`

### Table
- `border-collapse: separate; border-spacing: 0`
- `th`: 11.5px/600/uppercase/0.04em tracking, surface-2 bg, ink-400, padding 11px 18px
- `td`: 14px 18px, ink-700, border-bottom between rows
- Last `td`: no border-bottom
- Row hover: surface-2 bg on all cells

### Tabs
`border-bottom: 1px solid #E5E9F0` on container; active tab: `border-bottom: 2px solid #2047C9`, brand-600 text; `margin-bottom: -1px` to overlap container border

---

## Icons

All icons are custom stroke SVG (lucide-style). Properties: `fill: none`, `stroke: currentColor`, `strokeWidth: 1.75`, `strokeLinecap: round`, `strokeLinejoin: round`. Size 18px default. Can be replaced with [Lucide React](https://lucide.dev) using the same icon names.

Icons used: Home, Grid, Users, Shield, Flag, MessageCircle, Edit3, Wallet, Settings, Search, Bell, ChevronDown/Right/Left, Plus, Filter, Download, Eye, MoreHorizontal, X, Check, Trash, Pause, Play, Upload, Send, Paperclip, Smile, Lock, Mail, LogOut, ArrowRight, ArrowUp, ArrowDown, Calendar, Clock, Tag, Folder, TrendingUp, Image, Bold, Italic, List, Link, AlertCircle, Ban, CheckCircle, FileText, Star, Heading

---

## Sidebar Structure

```
Width: 248px | sticky top:0, height:100vh
Background: #FFFFFF
Border-right: 1px solid #E5E9F0

Brand header (padding 20px 20px 18px, border-bottom):
  Logo mark 34×34, brand gradient, radius 9px
  Brand name "SkillMahasiswa" + subtitle "Admin Console"

Nav groups (padding 8px 10px 20px):
  Group: "Umum"
    → Dashboard
  Group: "Manajemen"
    → Manajemen User
    → Moderasi Konten [badge: count]
    → Dispute & Laporan [badge: count]
    → Transaksi & Escrow
  Group: "Komunikasi & Konten"
    → Live Chat [badge: count]
    → Artikel & Blog
  Group: "Sistem"
    → Profil & Settings

Footer (padding 12px, border-top):
  Admin avatar (36×36 av-0 gradient)
  Name "Adinda Rahmawati" / Role "Super Admin"
  Logout icon button
```

---

## Top Bar Structure

```
Height: 62px | sticky top:0, z-index:40
Background: rgba(255,255,255,0.88) + backdrop-filter: saturate(160%) blur(8px)
Border-bottom: 1px solid #E5E9F0
Padding: 0 28px

Left: breadcrumb (12.5px, ink-400) + page title (16px/700, Plus Jakarta Sans)
Center: search input (flex 1, max-width 520px, surface-2 bg, border, radius 9px, ⌘K shortcut badge)
Right: Help icon btn + Bell icon btn (with red dot) + Profile pill (avatar + name + chevron)
```

---

## Data Models (for API design)

```typescript
interface Mahasiswa {
  id: string;          // "MH-XXXX"
  nama: string;
  email: string;       // institutional email (*.ac.id)
  nim: string;
  prodi: string;
  status: "Aktif" | "Suspended" | "Pending";
  daftar: string;      // date string
  jobs: number;
  rating: number;      // 0 if no jobs yet
}

interface Klien {
  id: string;          // "CL-XXXX"
  nama: string;
  email: string;
  perusahaan: string;
  status: "Aktif" | "Suspended" | "Pending";
  daftar: string;
  jobs: number;
}

interface Transaksi {
  id: string;          // "TRX-XXXXX"
  klien: string;
  mhs: string;
  jasa: string;
  nominal: number;     // IDR, integer
  status: "Ditahan" | "Dicairkan" | "Refund";
  tanggal: string;
}

interface Laporan {
  id: string;          // "LP-XXXX"
  pelapor: string;
  terlapor: string;
  jenis: string;
  status: "Terbuka" | "Diproses" | "Selesai" | "Ditolak";
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  tanggal: string;
}

interface KontenFlag {
  id: string;          // "JS-XXXX"
  judul: string;
  pemilik: string;
  kategori: string;
  laporan: number;     // report count
  posting: string;
  status: "Ditinjau" | "Aman" | "Dihapus" | "Disembunyikan";
}

interface Artikel {
  id: string;          // "ART-XXX"
  judul: string;
  status: "Published" | "Draft";
  tanggal: string;
  views: number;
  kategori: string;
}

interface ChatSession {
  id: string;
  nama: string;
  role: "Klien" | "Mahasiswa";
  last: string;
  time: string;
  unread: number;
  online: boolean;
}
```

---

## Localization Notes

- All UI copy is in **Bahasa Indonesia**
- Currency: IDR formatted as `Rp X.XXX.XXX` (use `Intl.NumberFormat('id-ID')`)
- Dates: Indonesian format, abbreviated months (e.g., "19 Apr 2026")
- Platform commission is 8% of transaction value (referenced in Escrow timeline)

---

## Files in This Package

| File | Description |
|---|---|
| `admin.html` | Main interactive prototype (multi-page, client-side routing) |
| `SkillMahasiswa Admin Panel.html` | Standalone offline bundle of the interactive prototype |
| `SkillMahasiswa Admin Panel - Figma Export.html` | All 9 pages rendered vertically for Figma import |
| `src/icons.jsx` | All SVG icon components |
| `src/data.jsx` | All dummy data (Indonesian) |
| `src/shell.jsx` | Sidebar, TopBar, Modal, Pagination, StatusPill components |
| `src/charts.jsx` | SVG chart components (LineChart, DonutChart, Sparkline) |
| `src/page_login.jsx` | Login page |
| `src/page_dashboard.jsx` | Dashboard page |
| `src/page_users.jsx` | User management page |
| `src/page_moderation.jsx` | Content moderation page |
| `src/page_disputes.jsx` | Disputes & reports page |
| `src/page_chat.jsx` | Live chat page |
| `src/page_articles.jsx` | Articles & blog + editor |
| `src/page_transactions.jsx` | Transactions & escrow page |
| `src/page_settings.jsx` | Profile & settings page |
| `src/app.jsx` | App root + routing |

---

## Recommended Tech Stack (if starting fresh)

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (map tokens above to tailwind config) or CSS Modules
- **Icons:** Lucide React (`npm install lucide-react`)
- **Charts:** Recharts or Tremor
- **Tables:** TanStack Table v8
- **Forms:** React Hook Form + Zod
- **State:** Zustand or React Context
- **Auth:** NextAuth.js
- **Real-time chat:** Socket.io or Supabase Realtime
- **i18n:** next-intl (Bahasa Indonesia)
- **UI Components:** shadcn/ui (maps well to this design system)

---

*Handoff generated from SkillMahasiswa Admin Panel prototype — June 2026*
