import { Page } from '@playwright/test';

// Define typed payloads matching the NestJS/BFF specs
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  university?: string;
  company?: string;
  status: 'Aktif' | 'Suspended' | 'Pending';
  createdAt: string;
  jobsCount: number;
  rating: number;
  bannedAt: string | null;
  emailVerified: boolean;
}

export interface DisputeItem {
  id: string;
  pelapor: { id: string; nama: string; role: 'Klien' | 'Mahasiswa'; email?: string };
  terlapor: { id: string; nama: string; role: 'Klien' | 'Mahasiswa'; email?: string };
  jenis: string;
  status: 'Terbuka' | 'Diproses' | 'Selesai' | 'Ditolak';
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
  tanggal: string;
  pesananId: string;
  amount: number;
  reason?: string;
  timeline?: Array<{ timestamp: string; actor: string; action: string }>;
}

export interface EscrowTransaction {
  id: string;
  nominal: number;
  status: 'Ditahan' | 'Dicairkan' | 'Refund';
  tanggal: string;
  klien: { id: string; nama: string; email?: string };
  mhs: { id: string; nama: string; email?: string };
  jasa: { id: string; judul: string };
  escrowTimeline?: Array<{ step: string; completed: boolean; timestamp?: string }>;
}

export interface FlaggedContent {
  id: string;
  judul: string;
  pemilik: { id: string; nama: string };
  kategori: string;
  laporanCount: number;
  postingDate: string;
  status: 'Ditinjau' | 'Aman' | 'Dihapus' | 'Disembunyikan';
  deskripsi?: string;
  tags?: string[];
}

export interface ArticleItem {
  id: string;
  judul: string;
  status: 'Published' | 'Draft';
  tanggal: string;
  views: number;
  kategori: string;
  content?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  nama: string;
  role: 'Klien' | 'Mahasiswa';
  last: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
  timestamp: string;
}

// Default mock data matching design_handoff_skillmahasiswa_admin/src/data.jsx
export const DEFAULT_ADMIN: AdminUser = {
  id: 'ADM-001',
  fullName: 'Adinda Rahmawati',
  email: 'admin@garapan.test',
  phone: '+6281298765432',
  bio: 'Platform Operations Manager',
  avatarUrl: null,
};

export const DEFAULT_STATS = {
  totalActiveUsers: 16284,
  activeUsersChange: 8.4,
  monthlyTransactions: 1942,
  transactionsChange: 12.1,
  platformRevenue: 328400000,
  revenueChange: 6.2,
  pendingReports: 27,
  reportsChange: -4.3,
};

export const DEFAULT_USERS: UserItem[] = [
  {
    id: 'MH-2041',
    fullName: 'Rizky Ananda Putra',
    email: 'rizky.ap@std.ui.ac.id',
    university: 'Universitas Indonesia',
    status: 'Aktif',
    createdAt: '2025-03-12T00:00:00Z',
    jobsCount: 18,
    rating: 4.9,
    bannedAt: null,
    emailVerified: true,
  },
  {
    id: 'MH-2044',
    fullName: 'Kirana Ayu Lestari',
    email: 'kirana.ayu@ugm.ac.id',
    university: 'Universitas Gadjah Mada',
    status: 'Suspended',
    createdAt: '2024-11-18T00:00:00Z',
    jobsCount: 7,
    rating: 3.6,
    bannedAt: '2026-05-10T12:00:00Z',
    emailVerified: true,
  },
  {
    id: 'MH-2045',
    fullName: 'Bagas Aditya Pratama',
    email: 'bagas.a@mhs.unhas.ac.id',
    university: 'Universitas Hasanuddin',
    status: 'Pending',
    createdAt: '2026-04-14T00:00:00Z',
    jobsCount: 0,
    rating: 0,
    bannedAt: null,
    emailVerified: false,
  },
  {
    id: 'CL-0918',
    fullName: 'Andika Surya',
    email: 'andika@kopipintar.id',
    company: 'Kopi Pintar Nusantara',
    status: 'Aktif',
    createdAt: '2025-01-08T00:00:00Z',
    jobsCount: 12,
    rating: 4.8,
    bannedAt: null,
    emailVerified: true,
  },
];

export const DEFAULT_DISPUTES: DisputeItem[] = [
  {
    id: 'LP-0415',
    pelapor: { id: 'CL-0918', nama: 'Andika Surya', role: 'Klien', email: 'andika@kopipintar.id' },
    terlapor: { id: 'MH-2041', nama: 'Rizky A. Putra', role: 'Mahasiswa', email: 'rizky.ap@std.ui.ac.id' },
    jenis: 'Hasil tidak sesuai brief',
    status: 'Terbuka',
    prioritas: 'Tinggi',
    tanggal: '2026-04-19T00:00:00Z',
    pesananId: 'TRX-84201',
    amount: 4500000,
    reason: 'Hasil pengerjaan website tidak responsif pada perangkat mobile dan tidak ada penyesuaian font.',
    timeline: [
      { timestamp: '2026-04-19T10:00:00Z', actor: 'Klien (Andika Surya)', action: 'Mengajukan Dispute' }
    ]
  },
  {
    id: 'LP-0414',
    pelapor: { id: 'CL-0919', nama: 'Laras Wulandari', role: 'Klien' },
    terlapor: { id: 'MH-2045', nama: 'Bagas Aditya Pratama', role: 'Mahasiswa' },
    jenis: 'Komunikasi tidak responsif',
    status: 'Diproses',
    prioritas: 'Sedang',
    tanggal: '2026-04-18T00:00:00Z',
    pesananId: 'TRX-84187',
    amount: 2200000,
  }
];

export const DEFAULT_TRANSACTIONS: EscrowTransaction[] = [
  {
    id: 'TRX-84201',
    nominal: 4500000,
    status: 'Ditahan',
    tanggal: '2026-04-19T00:00:00Z',
    klien: { id: 'CL-0918', nama: 'Andika Surya', email: 'andika@kopipintar.id' },
    mhs: { id: 'MH-2041', nama: 'Rizky A. Putra', email: 'rizky.ap@std.ui.ac.id' },
    jasa: { id: 'JS-1921', judul: 'Website Company Profile' },
    escrowTimeline: [
      { step: 'Pembayaran diterima', completed: true, timestamp: '2026-04-19T08:00:00Z' },
      { step: 'Dana masuk escrow', completed: true, timestamp: '2026-04-19T08:05:00Z' },
      { step: 'Pengerjaan dimulai', completed: true, timestamp: '2026-04-19T10:00:00Z' },
      { step: 'Submit hasil', completed: false },
      { step: 'Dana dicairkan', completed: false }
    ]
  },
  {
    id: 'TRX-84199',
    nominal: 3200000,
    status: 'Dicairkan',
    tanggal: '2026-04-18T00:00:00Z',
    klien: { id: 'CL-0919', nama: 'Laras Wulandari' },
    mhs: { id: 'MH-2042', nama: 'Aulia Rahmadani Safitri' },
    jasa: { id: 'JS-1914', judul: 'Desain UI/UX Aplikasi' }
  }
];

export const DEFAULT_CONTENT: FlaggedContent[] = [
  {
    id: 'JS-1921',
    judul: 'Jasa Pembuatan Website Company Profile Full Package',
    pemilik: { id: 'MH-2041', nama: 'Rizky A. Putra' },
    kategori: 'Web Development',
    laporanCount: 3,
    postingDate: '2026-04-14T00:00:00Z',
    status: 'Ditinjau',
    deskripsi: 'Kami menawarkan jasa pembuatan website company profile responsif...',
    tags: ['website', 'company profile', 'react'],
  },
  {
    id: 'JS-1918',
    judul: 'Mobile App Android Kotlin untuk UMKM — Murah Meriah',
    pemilik: { id: 'MH-2045', nama: 'Bagas Aditya Pratama' },
    kategori: 'Mobile Dev',
    laporanCount: 5,
    postingDate: '2026-04-11T00:00:00Z',
    status: 'Ditinjau',
  }
];

export const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: 'ART-021',
    judul: '5 Tips Menyusun Portofolio Mahasiswa IT yang Dilirik Klien',
    status: 'Published',
    tanggal: '2026-04-15T00:00:00Z',
    views: 3241,
    kategori: 'Karier',
  },
  {
    id: 'ART-018',
    judul: 'Cerita Sukses: Dari Tugas Kuliah Menjadi Klien Pertama',
    status: 'Draft',
    tanggal: '2026-04-20T00:00:00Z',
    views: 0,
    kategori: 'Inspirasi',
  }
];

export const DEFAULT_CHATS: ChatSession[] = [
  { id: 'S-01', userId: 'CL-0918', nama: 'Andika Surya', role: 'Klien', last: 'Baik, saya tunggu konfirmasinya ya kak', time: 'baru saja', unread: 2, online: true },
  { id: 'S-02', userId: 'MH-2041', nama: 'Rizky Ananda Putra', role: 'Mahasiswa', last: 'Dokumen sudah saya kirim via email', time: '2 menit', unread: 1, online: true }
];

export const DEFAULT_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'S-01': [
    { id: 'm-1', from: 'them', text: 'Halo admin, saya ingin tanya mengenai proses refund untuk pesanan #ORD-2380', timestamp: '2026-06-29T02:10:00Z' },
    { id: 'm-2', from: 'me', text: 'Halo kak Andika 👋 Baik, untuk pesanan #ORD-2380 saat ini statusnya masih dalam proses verifikasi.', timestamp: '2026-06-29T02:12:00Z' },
    { id: 'm-3', from: 'them', text: 'Baik, saya tunggu konfirmasinya ya kak', timestamp: '2026-06-29T02:15:00Z' }
  ]
};

export const DEFAULT_ACTIVITIES = [
  { id: 'act-1', type: 'order', text: 'Pesanan baru #ORD-2406 dari Andika Surya', target: 'Jasa Pembuatan Website Company Profile', time: '2 menit lalu', who: 'Andika Surya' },
  { id: 'act-2', type: 'user', text: 'Mahasiswa baru terdaftar', target: 'Salsabila Dwi Anggraini · Undip', time: '14 menit lalu', who: 'Salsabila Dwi A.' },
];

export const DEFAULT_SKILLS = [
  { id: 'sk-1', name: 'React' },
  { id: 'sk-2', name: 'TypeScript' }
];

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Web Development', skills: ['sk-1', 'sk-2'] }
];

export class MockApi {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // General setups
  async setupDefaultMocks() {
    // 1. BFF Authenticated /me
    await this.page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: DEFAULT_ADMIN, status: 'authenticated' }),
      });
    });

    // 2. Dashboard Stats
    await this.page.route('**/api/proxy/admin/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEFAULT_STATS),
      });
    });

    // 3. Activity
    await this.page.route('**/api/proxy/admin/activity', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEFAULT_ACTIVITIES),
      });
    });

    // 4. Analytics charts
    await this.page.route('**/api/proxy/admin/analytics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          transactions: [
            { date: '2026-06-25', count: 12, amount: 15000000 },
            { date: '2026-06-26', count: 15, amount: 22000000 },
            { date: '2026-06-27', count: 18, amount: 28000000 },
          ],
          jasaCategories: [
            { category: 'Web Dev', percentage: 42 },
            { category: 'Mobile', percentage: 25 },
          ]
        }),
      });
    });

    // 5. Users List
    await this.page.route('**/api/proxy/admin/users*', async (route) => {
      const url = new URL(route.request().url());
      const role = url.searchParams.get('role');
      const filtered = DEFAULT_USERS.filter(u => {
        if (role === 'MAHASISWA') return u.id.startsWith('MH-');
        if (role === 'KLIEN') return u.id.startsWith('CL-');
        return true;
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered,
          total: filtered.length,
          page: 1,
          limit: 10,
        }),
      });
    });

    // 6. User detail
    await this.page.route('**/api/proxy/admin/users/MH-*', async (route) => {
      const url = route.request().url();
      const id = url.split('/').pop() || 'MH-2041';
      const user = DEFAULT_USERS.find(u => u.id === id) || DEFAULT_USERS[0];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...user,
          phone: '+628123456789',
          bio: 'Mahasiswa IT yang tertarik dengan project freelance.',
          orders: [
            { id: 'ORD-2406', jasa: 'Website Company Profile', nominal: 4500000, status: 'Ditahan' }
          ],
          reports: []
        }),
      });
    });

    // 7. Content Flag/Moderation
    await this.page.route('**/api/proxy/admin/content*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: DEFAULT_CONTENT,
          total: DEFAULT_CONTENT.length,
          page: 1,
          limit: 10,
        }),
      });
    });

    // 8. Disputes
    await this.page.route('**/api/proxy/admin/disputes*', async (route) => {
      const url = route.request().url();
      // If it's a specific dispute detail request
      if (url.includes('/disputes/')) {
        const id = url.split('/').pop() || 'LP-0415';
        const dispute = DEFAULT_DISPUTES.find(d => d.id === id) || DEFAULT_DISPUTES[0];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(dispute),
        });
        return;
      }
      // General list
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: DEFAULT_DISPUTES,
          total: DEFAULT_DISPUTES.length,
          page: 1,
          limit: 10,
        }),
      });
    });

    // 9. Orders/Transactions
    await this.page.route('**/api/proxy/admin/orders*', async (route) => {
      const url = route.request().url();
      if (url.includes('/orders/')) {
        const id = url.split('/').pop() || 'TRX-84201';
        const tx = DEFAULT_TRANSACTIONS.find(t => t.id === id) || DEFAULT_TRANSACTIONS[0];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(tx),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: DEFAULT_TRANSACTIONS,
          total: DEFAULT_TRANSACTIONS.length,
          page: 1,
          limit: 10,
        }),
      });
    });

    // 10. Live chat threads
    await this.page.route('**/api/proxy/live-chat-admin', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEFAULT_CHATS),
      });
    });

    // 11. Live chat history
    await this.page.route('**/api/proxy/live-chat-admin/*', async (route) => {
      const url = route.request().url();
      const userId = url.split('/').pop() || 'S-01';
      // Find matching session
      const session = DEFAULT_CHATS.find(c => c.userId === userId || c.id === userId);
      const messages = DEFAULT_CHAT_MESSAGES[session?.id || 'S-01'] || [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(messages),
      });
    });

    // 12. Articles List
    await this.page.route('**/api/proxy/admin/artikel', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEFAULT_ARTICLES),
      });
    });

    // 13. Settings master data (Skills & Categories)
    await this.page.route('**/api/proxy/admin/skills', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEFAULT_SKILLS),
      });
    });

    await this.page.route('**/api/proxy/admin/kategori', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEFAULT_CATEGORIES),
      });
    });

    // 14. Admin Profile details
    await this.page.route('**/api/proxy/admin/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DEFAULT_ADMIN),
      });
    });
  }

  // Helpers to mock specific failure or mutation responses
  async mockLoginSuccess() {
    await this.page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: DEFAULT_ADMIN,
        }),
        headers: {
          'Set-Cookie': 'access_token=mock_access; Path=/; HttpOnly; SameSite=Lax; Max-Age=900'
        }
      });
    });
  }

  async mockLoginFailure(status: number = 401, message: string = 'Kredensial salah') {
    await this.page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ message }),
      });
    });
  }

  async mockBanUserSuccess(userId: string) {
    await this.page.route(`**/api/proxy/admin/users/${userId}/ban`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bannedAt: new Date().toISOString(),
        }),
      });
    });
  }

  async mockResolveDisputeSuccess(disputeId: string, outcome: 'RELEASE' | 'REFUND' | 'REJECT') {
    await this.page.route(`**/api/proxy/admin/disputes/${disputeId}/resolve`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          status: 'RESOLVED',
          outcome,
          resolvedAt: new Date().toISOString(),
        }),
      });
    });
  }

  async mockRemoveContentSuccess(contentId: string) {
    await this.page.route(`**/api/proxy/admin/content/${contentId}/remove`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          status: 'Dihapus',
        }),
      });
    });
  }

  async mockCreateArticleSuccess() {
    await this.page.route('**/api/proxy/artikel', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'ART-999',
          judul: 'Panduan E2E Mocking',
          status: 'Draft',
          createdAt: new Date().toISOString(),
        }),
      });
    });
  }

  async mockPublishArticleSuccess(id: string) {
    await this.page.route(`**/api/proxy/artikel/${id}/publish`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          status: 'Published',
          publishedAt: new Date().toISOString(),
        }),
      });
    });
  }

  async mockSendChatMessageSuccess(userId: string) {
    await this.page.route(`**/api/proxy/live-chat-admin/${userId}`, async (route) => {
      if (route.request().method() === 'POST') {
        const payload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: `msg-${Date.now()}`,
            from: 'me',
            text: payload.text || '',
            timestamp: new Date().toISOString(),
          }),
        });
      }
    });
  }

  async mockUpdateAdminProfileSuccess() {
    await this.page.route('**/api/proxy/admin/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        const payload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...DEFAULT_ADMIN,
            fullName: payload.fullName || DEFAULT_ADMIN.fullName,
            phone: payload.phone || DEFAULT_ADMIN.phone,
            bio: payload.bio || DEFAULT_ADMIN.bio,
          }),
        });
      }
    });
  }
}
