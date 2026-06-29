import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

type RouteContext = { params: Promise<{ path: string[] }> };

// Mock statistics
const mockStats = {
  activeUsers: 16284,
  activeUsersDelta: 8.4,
  transactionsCount: 1942,
  transactionsDelta: 12.1,
  revenue: 328400000,
  revenueDelta: 6.2,
  pendingReports: 27,
  pendingReportsDelta: -4.3
};

// Mock analytics
const mockAnalytics = {
  ordersLine: Array.from({ length: 30 }, (_, idx) => {
    const day = idx + 1;
    const orders = Math.floor(Math.random() * 40) + 100;
    const value = orders * (Math.floor(Math.random() * 1000000) + 1200000);
    return {
      name: `${day < 10 ? '0' : ''}${day} Apr`,
      orders,
      value,
      average: Math.round(value / orders)
    };
  }),
  categoriesDonut: [
    { name: "Web Dev", value: 1420, percentage: 38 },
    { name: "Mobile", value: 920, percentage: 25 },
    { name: "UI/UX", value: 550, percentage: 15 },
    { name: "Digital Mkt", value: 410, percentage: 11 },
    { name: "Lainnya", value: 370, percentage: 11 }
  ]
};

// Mock activity log
const mockActivities = [
  { id: "1", actorName: "Adinda R.", actorRole: "ADMIN", action: "report", message: "Menolak Laporan LP-0012 atas Mahasiswa MH-0239", createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "2", actorName: "Budi Santoso", actorRole: "CLIENT", action: "order", message: "Membayar Escrow sebesar Rp 2.500.000 untuk Pesanan #1289", createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "3", actorName: "Farhan Hakim", actorRole: "MAHASISWA", action: "user", message: "Mendaftar akun freelancer mahasiswa baru", createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "4", actorName: "System", actorRole: "SYSTEM", action: "report", message: "Laporan LP-0013 otomatis dibuat: Konten Jasa Terindikasi Spam", createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "5", actorName: "Rian Dwi", actorRole: "ADMIN", action: "user", message: "Memblokir sementara akun Klien CL-0104 karena aktivitas mencurigakan", createdAt: new Date(Date.now() - 12 * 3600000).toISOString() }
];

// Mock Users
const mockUsers = [
  { id: "MH-001", fullName: "Farhan Hakim", email: "farhan.hakim@student.ui.ac.id", role: "MAHASISWA", university: "Universitas Indonesia", rating: 4.8, jobs: 18, bannedAt: null, emailVerified: true, createdAt: "2026-01-15T08:00:00.000Z" },
  { id: "MH-002", fullName: "Rina Wijaya", email: "rina.w@student.itb.ac.id", role: "MAHASISWA", university: "Institut Teknologi Bandung", rating: 4.9, jobs: 24, bannedAt: null, emailVerified: true, createdAt: "2026-01-20T10:00:00.000Z" },
  { id: "MH-003", fullName: "Denny H.", email: "denny.h@student.its.ac.id", role: "MAHASISWA", university: "Institut Teknologi Sepuluh Nopember", rating: 4.5, jobs: 7, bannedAt: null, emailVerified: true, createdAt: "2026-02-02T14:00:00.000Z" },
  { id: "MH-004", fullName: "Andi Wijaya", email: "andi.w@student.ugm.ac.id", role: "MAHASISWA", university: "Universitas Gadjah Mada", rating: 4.2, jobs: 12, bannedAt: "2026-06-15T12:00:00.000Z", emailVerified: true, createdAt: "2026-01-10T09:00:00.000Z" },
  { id: "CL-001", fullName: "Budi Santoso", email: "budi@tokoberkah.com", role: "KLIEN", company: "Toko Berkah Mandiri", rating: 4.7, jobs: 5, bannedAt: null, emailVerified: true, createdAt: "2026-01-12T11:00:00.000Z" },
  { id: "CL-002", fullName: "Siti Rahma", email: "siti@solusindotech.id", role: "KLIEN", company: "Solusindo Tech", rating: 5.0, jobs: 14, bannedAt: null, emailVerified: true, createdAt: "2026-01-22T08:30:00.000Z" },
  { id: "CL-003", fullName: "Steven K.", email: "steven@eduventure.co", role: "KLIEN", company: "EduVenture Indonesia", rating: 4.6, jobs: 9, bannedAt: null, emailVerified: true, createdAt: "2026-02-18T16:00:00.000Z" }
];

// Mock Content Moderation
const mockContent = [
  { id: "JS-011", title: "Jasa Pembuatan Web E-commerce Laravel", reportCount: 5, ownerName: "Farhan Hakim", ownerRole: "MAHASISWA", category: "Web Dev", createdAt: "2026-06-20T08:00:00.000Z", status: "Flagged" },
  { id: "JS-012", title: "Jasa Desain Landing Page Figma Murah", reportCount: 3, ownerName: "Rina Wijaya", ownerRole: "MAHASISWA", category: "UI/UX", createdAt: "2026-06-22T10:00:00.000Z", status: "Flagged" },
  { id: "JS-013", title: "Jasa Penulisan Artikel SEO Tren IT", reportCount: 2, ownerName: "Denny H.", ownerRole: "MAHASISWA", category: "Lainnya", createdAt: "2026-06-24T14:00:00.000Z", status: "Flagged" }
];

// Mock Disputes
const mockDisputes = [
  { id: "DP-001", orderId: "ORD-1029", reporterName: "Budi Santoso", reporterRole: "KLIEN", reportedName: "Farhan Hakim", reportedRole: "MAHASISWA", reason: "Hasil pengerjaan website tidak responsif dan banyak fitur error, padahal sudah lewat tenggat waktu 3 hari.", amount: 2500000, priority: "Tinggi", status: "Terbuka", createdAt: "2026-06-25T11:00:00.000Z" },
  { id: "DP-002", orderId: "ORD-1035", reporterName: "Rina Wijaya", reporterRole: "MAHASISWA", reportedName: "Siti Rahma", reportedRole: "KLIEN", reason: "Klien menolak menyelesaikan pesanan dan mencairkan escrow padahal semua revisi desain sudah saya kerjakan.", amount: 1500000, priority: "Sedang", status: "Terbuka", createdAt: "2026-06-26T08:30:00.000Z" }
];

// Mock Transactions
const mockTransactions = [
  { id: "TX-901", orderId: "ORD-1289", clientName: "Budi Santoso", studentName: "Farhan Hakim", amount: 2500000, status: "Ditahan", createdAt: "2026-06-29T08:00:00.000Z" },
  { id: "TX-902", orderId: "ORD-1275", clientName: "Siti Rahma", studentName: "Rina Wijaya", amount: 1500000, status: "Dilepas", createdAt: "2026-06-28T10:00:00.000Z" },
  { id: "TX-903", orderId: "ORD-1260", clientName: "Steven K.", studentName: "Denny H.", amount: 800000, status: "Refunded", createdAt: "2026-06-27T14:00:00.000Z" }
];

// Mock Chat Sessions
const mockChatSessions = [
  { id: "session-1", userId: "CL-001", userName: "Budi Santoso", userRole: "KLIEN", lastMessage: "Halo min, mohon bantuannya untuk dispute #ORD-1029", unreadCount: 1, lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "session-2", userId: "MH-002", userName: "Rina Wijaya", userRole: "MAHASISWA", lastMessage: "Terima kasih banyak penjelasannya admin!", unreadCount: 0, lastMessageAt: new Date(Date.now() - 30 * 60000).toISOString() }
];

// Mock Chat Messages
const mockChatMessages: Record<string, any[]> = {
  "CL-001": [
    { id: "m1", senderId: "CL-001", senderName: "Budi Santoso", senderRole: "KLIEN", text: "Halo admin, pesanan saya kena kendala freelancer tidak aktif.", createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: "m2", senderId: "mock-admin-id", senderName: "Admin Garapan", senderRole: "ADMIN", text: "Halo Pak Budi, boleh diinfokan nomor dispute pesanan Anda?", createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: "m3", senderId: "CL-001", senderName: "Budi Santoso", senderRole: "KLIEN", text: "Halo min, mohon bantuannya untuk dispute #ORD-1029", createdAt: new Date(Date.now() - 5 * 60000).toISOString() }
  ],
  "MH-002": [
    { id: "m4", senderId: "MH-002", senderName: "Rina Wijaya", senderRole: "MAHASISWA", text: "Min, pencairan dana escrow saya berapa lama prosesnya?", createdAt: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: "m5", senderId: "mock-admin-id", senderName: "Admin Garapan", senderRole: "ADMIN", text: "Proses pencairan dana escrow standar memakan waktu 1x24 jam kerja setelah transaksi diselesaikan.", createdAt: new Date(Date.now() - 35 * 60000).toISOString() },
    { id: "m6", senderId: "MH-002", senderName: "Rina Wijaya", senderRole: "MAHASISWA", text: "Terima kasih banyak penjelasannya admin!", createdAt: new Date(Date.now() - 30 * 60000).toISOString() }
  ]
};

// Mock Articles
const mockArticles = [
  { id: "ART-001", title: "Panduan Menjadi Freelancer Sukses saat Kuliah", category: "Tips Karir", status: "Published", views: 1250, thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800", createdAt: "2026-06-01T08:00:00.000Z", content: "<p>Menjadi freelancer saat kuliah memberikan banyak keuntungan...</p>", tags: ["freelancer", "kuliah"], seoDescription: "Tips sukses membagi waktu kuliah dan kerja." },
  { id: "ART-002", title: "Tutorial Integrasi Midtrans di Next.js 15", category: "Tutorial", status: "Published", views: 980, thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800", createdAt: "2026-06-10T10:00:00.000Z", content: "<p>Midtrans adalah gateway pembayaran populer di Indonesia...</p>", tags: ["nextjs", "payment"], seoDescription: "Cara mudah mengintegrasikan Midtrans di NextJS." },
  { id: "ART-003", title: "Tren Framework Javascript Terpopuler Tahun 2026", category: "Tren IT", status: "Draft", views: 0, thumbnailUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800", createdAt: "2026-06-25T14:00:00.000Z", content: "<p>Ekosistem Javascript terus berkembang dengan cepat...</p>", tags: ["javascript", "tren"], seoDescription: "Daftar framework JS paling diminati di tahun 2026." }
];

// Mock Skills Master Data
const mockSkills = [
  { id: "s1", name: "Next.js Development", category: "Web Dev", createdAt: new Date().toISOString() },
  { id: "s2", name: "Figma UI/UX Design", category: "UI/UX", createdAt: new Date().toISOString() },
  { id: "s3", name: "React Native Mobile App", category: "Mobile", createdAt: new Date().toISOString() },
  { id: "s4", name: "SEO Optimization", category: "Digital Mkt", createdAt: new Date().toISOString() },
  { id: "s5", name: "PostgreSQL Database Admin", category: "Lainnya", createdAt: new Date().toISOString() }
];

export async function handle(request: NextRequest, context: RouteContext) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken || accessToken !== "mock-access-token") {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const { path } = await context.params;
  const endpoint = path.join("/");
  const method = request.method;

  // 1. STATS
  if (endpoint === "admin/stats" && method === "GET") {
    return NextResponse.json(mockStats);
  }

  // 2. ANALYTICS
  if (endpoint === "admin/analytics" && method === "GET") {
    return NextResponse.json(mockAnalytics);
  }

  // 3. ACTIVITY LOGS
  if (endpoint === "admin/activity" && method === "GET") {
    return NextResponse.json(mockActivities);
  }

  // 4. USERS
  if (endpoint === "admin/users" && method === "GET") {
    const role = request.nextUrl.searchParams.get("role");
    const search = request.nextUrl.searchParams.get("search")?.toLowerCase();
    
    let filtered = mockUsers;
    if (role) {
      const targetRole = role === "CLIENT" ? "KLIEN" : role;
      filtered = filtered.filter(u => u.role === targetRole);
    }
    if (search) {
      filtered = filtered.filter(u => u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    }
    
    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 10
    });
  }

  if (endpoint.startsWith("admin/users/") && method === "GET") {
    const id = endpoint.split("/")[2];
    const user = mockUsers.find(u => u.id === id) || mockUsers[0];
    return NextResponse.json({
      ...user,
      phone: "081234567890",
      bio: "Ini adalah deskripsi profil biografi pengguna dari database.",
      orderHistory: [
        { id: "ORD-1201", title: "Web development React", amount: 1500000, status: "Selesai", date: "2026-05-10T12:00:00Z" },
        { id: "ORD-1289", title: "Desain Mobile Figma", amount: 2500000, status: "Ditahan", date: "2026-06-29T08:00:00Z" }
      ],
      reportHistory: [
        { id: "LP-0012", type: "Tenggat Waktu Lewat", date: "2026-06-25T11:00:00Z", status: "Ditolak" }
      ]
    });
  }

  if (endpoint.startsWith("admin/users/") && (endpoint.endsWith("/ban") || endpoint.endsWith("/unban")) && method === "PATCH") {
    return new NextResponse(null, { status: 204 });
  }

  // 5. CONTENT MODERATION
  if (endpoint === "admin/content" && method === "GET") {
    return NextResponse.json({
      data: mockContent,
      total: mockContent.length,
      page: 1,
      limit: 10
    });
  }

  if (endpoint.startsWith("admin/content/") && method === "PATCH") {
    return new NextResponse(null, { status: 204 });
  }

  // 6. DISPUTES
  if (endpoint === "admin/disputes" && method === "GET") {
    return NextResponse.json({
      data: mockDisputes,
      total: mockDisputes.length,
      page: 1,
      limit: 10
    });
  }

  if (endpoint.startsWith("admin/disputes/") && endpoint.endsWith("/resolve") && method === "PATCH") {
    return new NextResponse(null, { status: 204 });
  }

  // 7. TRANSACTIONS
  if (endpoint === "admin/orders" && method === "GET") {
    return NextResponse.json({
      data: mockTransactions,
      total: mockTransactions.length,
      page: 1,
      limit: 10
    });
  }

  // 8. LIVE CHAT
  if (endpoint === "live-chat-admin" && method === "GET") {
    return NextResponse.json(mockChatSessions);
  }

  if (endpoint.startsWith("live-chat-admin/") && method === "GET") {
    const userId = endpoint.split("/")[1];
    const messages = mockChatMessages[userId] || mockChatMessages["CL-001"];
    return NextResponse.json(messages);
  }

  if (endpoint.startsWith("live-chat-admin/") && method === "POST") {
    return NextResponse.json({ success: true, id: "msg-" + Math.random() });
  }

  // 9. ARTICLES
  if (endpoint === "admin/artikel" && method === "GET") {
    const search = request.nextUrl.searchParams.get("search")?.toLowerCase();
    const category = request.nextUrl.searchParams.get("category");
    let filtered = mockArticles;
    
    if (search) {
      filtered = filtered.filter(a => a.title.toLowerCase().includes(search));
    }
    if (category && category !== "Semua") {
      filtered = filtered.filter(a => a.category === category);
    }
    
    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 10
    });
  }

  if (endpoint.startsWith("admin/artikel/") && method === "GET") {
    const id = endpoint.split("/")[2];
    const art = mockArticles.find(a => a.id === id) || mockArticles[0];
    return NextResponse.json(art);
  }

  if ((endpoint === "artikel" || endpoint.startsWith("artikel/")) && (method === "POST" || method === "PATCH" || method === "DELETE")) {
    return NextResponse.json({ id: "ART-" + Math.floor(Math.random() * 1000) });
  }

  // 10. MASTER DATA & PROFILE ME
  if (endpoint === "admin/me" && method === "GET") {
    return NextResponse.json({
      id: "mock-admin-id",
      fullName: "Admin Garapan",
      email: "admin@garapan.test",
      phone: "081234567890",
      bio: "Administrator konsol pusat GARAPAN.",
      role: "ADMIN"
    });
  }

  if (endpoint === "admin/me" && method === "PATCH") {
    return NextResponse.json({ success: true });
  }

  if (endpoint === "admin/me/password" && method === "PATCH") {
    return new NextResponse(null, { status: 204 });
  }

  if (endpoint === "admin/skills" && method === "GET") {
    return NextResponse.json(mockSkills);
  }

  if (endpoint === "admin/skills" && method === "POST") {
    return NextResponse.json({ id: "skill-" + Math.random(), name: "New Skill", category: "Web Dev", createdAt: new Date().toISOString() });
  }

  if (endpoint.startsWith("admin/skills/") && method === "DELETE") {
    return new NextResponse(null, { status: 204 });
  }

  // DEFAULT FALLBACK SUCCESS
  return NextResponse.json({ success: true });
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
