import type { Page, Route } from "@playwright/test";

export const MOCK_ADMIN_USER = {
  id: "e2e-admin-1",
  email: "admin@garapan.test",
  name: "E2E Admin",
  role: "ADMIN" as const,
};

export const MOCK_PROFILE = {
  id: "e2e-admin-1",
  fullName: "E2E Admin Profile",
  email: "admin@garapan.test",
  phone: "08123456789",
  bio: "Profil uji E2E",
  role: "ADMIN",
};

const MOCK_USER_ROW = {
  id: "user-mhs-1",
  email: "mhs@garapan.test",
  role: "MAHASISWA",
  fullName: "E2E Test User",
  emailVerified: true,
  bannedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  mahasiswa: { fullName: "E2E Test User", university: "UI" },
};

const MOCK_DISPUTE = {
  id: "dispute-1",
  reason: "Pekerjaan tidak sesuai",
  status: "PENDING",
  createdAt: "2026-01-02T00:00:00.000Z",
  reporter: {
    id: "reporter-1",
    email: "reporter@garapan.test",
    role: "KLIEN",
    displayName: "E2E Reporter",
    klien: { companyName: "E2E Reporter Co" },
  },
  target: {
    id: "target-1",
    email: "reported@garapan.test",
    role: "MAHASISWA",
    mahasiswa: { fullName: "E2E Reported" },
  },
  pesanan: { id: "order-dispute-1", status: "DISPUTED", totalPrice: 500000 },
};

const MOCK_ORDER = {
  id: "order-1",
  totalPrice: 750000,
  status: "IN_PROGRESS",
  createdAt: "2026-01-03T00:00:00.000Z",
  klien: { companyName: "E2E Client Co", user: { fullName: "E2E Client" } },
  mahasiswa: { user: { fullName: "E2E Freelancer", email: "freelancer@garapan.test" } },
  jasa: { title: "E2E Jasa Title" },
};

const MOCK_JASA = {
  id: "content-jasa-1",
  title: "E2E Flagged Jasa",
  description: "Konten uji moderasi",
  status: "ACTIVE",
  createdAt: "2026-01-04T00:00:00.000Z",
  mahasiswa: { user: { id: "owner-1", fullName: "E2E Owner", email: "owner@garapan.test" } },
};

const MOCK_ARTICLE = {
  id: "article-1",
  title: "E2E Artikel Blog",
  content: "<p>Konten artikel uji</p>",
  category: "Tips",
  tags: ["e2e"],
  publishedAt: "2026-01-05T00:00:00.000Z",
  createdAt: "2026-01-05T00:00:00.000Z",
};

const MOCK_CHAT_SESSION = {
  userId: "chat-user-1",
  user: {
    email: "mhs@garapan.test",
    role: "MAHASISWA",
    displayName: "E2E Chat User",
    online: true,
  },
  lastMessage: {
    id: "chat-msg-2",
    message: "",
    messageType: "FILE",
    fileUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    fileName: "bukti-screenshot.jpg",
    mimeType: "image/jpeg",
    createdAt: "2026-01-06T10:00:00.000Z",
    senderId: "chat-user-1",
  },
  unreadCount: 1,
  messageCount: 2,
};

const MOCK_CHAT_MESSAGES = [
  {
    id: "chat-msg-1",
    userId: "chat-user-1",
    adminId: "e2e-admin-1",
    senderId: "chat-user-1",
    senderRole: "MAHASISWA",
    message: "Halo admin",
    messageType: "TEXT",
    fileUrl: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    createdAt: "2026-01-06T09:55:00.000Z",
  },
  {
    id: "chat-msg-2",
    userId: "chat-user-1",
    adminId: "e2e-admin-1",
    senderId: "chat-user-1",
    senderRole: "MAHASISWA",
    message: "",
    messageType: "FILE",
    fileUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    fileName: "bukti-screenshot.jpg",
    fileSize: 245_000,
    mimeType: "image/jpeg",
    createdAt: "2026-01-06T10:00:00.000Z",
  },
];

function paginated<T>(items: T[], page = 1, limit = 10) {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}

function proxyPath(url: string): string {
  const marker = "/api/proxy";
  const index = url.indexOf(marker);
  if (index === -1) return "";
  const path = url.slice(index + marker.length);
  return path.split("?")[0] ?? "";
}

function queryInt(url: string, key: string, fallback: number): number {
  const value = new URL(url).searchParams.get(key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function handleProxyRoute(url: string, method: string): unknown {
  const path = proxyPath(url);

  if (path === "/admin/stats" || path.startsWith("/admin/stats?")) {
    return {
      users: 120,
      revenue: 15_000_000,
      orders: { total: 42 },
      pendingDisputes: 3,
      sparklines: {
        users: [10, 12, 11, 14, 13, 15, 16],
        orders: [4, 5, 6, 5, 7, 8, 9],
        revenue: [1, 2, 2, 3, 3, 4, 5],
        pendingDisputes: [1, 2, 1, 3, 2, 2, 3],
      },
    };
  }

  if (path.startsWith("/admin/analytics")) {
    return {
      period: { start: "2026-01-01", end: "2026-01-31" },
      timeSeries: [
        { date: "2026-01-01", orders: 2, revenue: 1000000 },
        { date: "2026-01-02", orders: 3, revenue: 1500000 },
      ],
      categoryBreakdown: [
        { kategoriId: "k1", name: "Desain", count: 5, revenue: 5000000 },
      ],
      deltas: { users: 5, orders: 10, revenue: 8 },
    };
  }

  if (path === "/admin/activity") {
    return {
      data: [
        {
          id: "act-1",
          action: "ORDER_CREATED",
          createdAt: "2026-01-06T09:00:00.000Z",
          user: { fullName: "E2E Actor", role: "USER" },
        },
      ],
    };
  }

  if (path.startsWith("/admin/users")) {
    const page = queryInt(url, "page", 1);
    const limit = queryInt(url, "limit", 10);
    return paginated([MOCK_USER_ROW], page, limit);
  }

  if (path.startsWith("/admin/disputes")) {
    const page = queryInt(url, "page", 1);
    const limit = queryInt(url, "limit", 10);
    return paginated([MOCK_DISPUTE], page, limit);
  }

  if (path === "/admin/content/stats") {
    return {
      pendingListings: 1,
      pendingReports: 1,
      dismissedReports: 0,
      actionTakenReports: 0,
    };
  }

  if (path === "/admin/content") {
    return { jasa: [MOCK_JASA], projects: [] };
  }

  if (path.startsWith("/admin/orders")) {
    const page = queryInt(url, "page", 1);
    const limit = queryInt(url, "limit", 10);
    return paginated([MOCK_ORDER], page, limit);
  }

  if (path.startsWith("/live-chat-admin")) {
    if (path === "/live-chat-admin" || path.startsWith("/live-chat-admin?")) {
      return [MOCK_CHAT_SESSION];
    }

    if (path.endsWith("/attachments") && method === "POST") {
      return {
        id: "chat-msg-upload",
        userId: "chat-user-1",
        adminId: MOCK_ADMIN_USER.id,
        senderId: MOCK_ADMIN_USER.id,
        senderRole: "ADMIN",
        message: "",
        messageType: "FILE",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        fileName: "admin-reply.jpg",
        fileSize: 120_000,
        mimeType: "image/jpeg",
        createdAt: new Date().toISOString(),
      };
    }

    return {
      data: MOCK_CHAT_MESSAGES,
      page: queryInt(url, "page", 1),
      limit: queryInt(url, "limit", 20),
      total: MOCK_CHAT_MESSAGES.length,
    };
  }

  if (path.startsWith("/admin/artikel")) {
    const page = queryInt(url, "page", 1);
    const limit = queryInt(url, "limit", 10);
    return paginated([MOCK_ARTICLE], page, limit);
  }

  if (path === "/admin/me" && method === "GET") {
    return MOCK_PROFILE;
  }

  if (path === "/admin/kategori") {
    return { data: [{ id: "kat-1", name: "Desain", icon: "🎨" }] };
  }

  if (path.startsWith("/admin/skills")) {
    return {
      data: [
        {
          id: "skill-1",
          name: "Figma",
          kategori: "Desain",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
  }

  if (method === "PATCH" || method === "POST" || method === "DELETE") {
    return {};
  }

  return { data: [], total: 0 };
}

/** Intercept BFF auth + proxy routes so E2E runs without NestJS. */
export async function installMockApi(page: Page) {
  await page.route("**/api/auth/me", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await fulfillJson(route, { user: MOCK_ADMIN_USER });
  });

  await page.route("**/api/auth/refresh", async (route) => {
    await fulfillJson(route, { ok: true });
  });

  await page.route("**/api/proxy/**", async (route) => {
    const body = handleProxyRoute(
      route.request().url(),
      route.request().method(),
    );
    const status = route.request().method() === "DELETE" ? 204 : 200;
    if (status === 204) {
      await route.fulfill({ status: 204, body: "" });
      return;
    }
    await fulfillJson(route, body, status);
  });
}

/** Mock failed login for auth error tests. */
export async function installFailedLoginMock(page: Page) {
  await page.route("**/api/auth/login", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await fulfillJson(
      route,
      { message: "Email atau password salah" },
      401,
    );
  });
}
