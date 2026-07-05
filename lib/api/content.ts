import { apiClient } from "./client";
import { asRecord, type UnknownRecord } from "./normalizers";

export interface FlaggedContent {
  id: string;
  title: string;
  description: string;
  category: string;
  /** Omitted when backend does not expose per-post counts (ADR 001 deferral). */
  reportCount?: number;
  status: "Ditinjau" | "Aman" | "Dihapus" | "Disembunyikan";
  createdAt: string;
  contentType: "jasa" | "project";
  owner: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  reports?: Array<{
    id: string;
    reporterName: string;
    reporterEmail: string;
    reason: string;
    category: string;
    createdAt: string;
  }>;
}

export interface ListContentParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface ListContentResponse {
  data: FlaggedContent[];
  total: number;
  page: number;
  limit: number;
}

function mapContentStatus(
  backendStatus: string,
  contentType: "jasa" | "project",
): FlaggedContent["status"] {
  const status = backendStatus.toUpperCase();
  if (contentType === "jasa") {
    if (status === "INACTIVE") return "Dihapus";
    if (status === "ACTIVE") return "Ditinjau";
  }
  if (contentType === "project") {
    if (status === "CLOSED") return "Dihapus";
    if (status === "OPEN") return "Ditinjau";
  }
  return "Ditinjau";
}

function normaliseFlaggedItem(
  raw: UnknownRecord,
  type: "jasa" | "project",
): FlaggedContent {
  const mahasiswa = asRecord(raw.mahasiswa);
  const klien = asRecord(raw.klien);
  const ownerUser =
    type === "jasa"
      ? asRecord(mahasiswa.user)
      : asRecord(klien.user);
  const ownerId = String(
    ownerUser.id ?? mahasiswa.id ?? klien.id ?? "",
  );
  const ownerLabel = String(
    ownerUser.fullName ??
      ownerUser.displayName ??
      ownerUser.email ??
      (ownerId ? `User ${ownerId.slice(0, 8)}` : "—"),
  );

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    description: "",
    category: "",
    status: mapContentStatus(String(raw.status ?? ""), type),
    createdAt: String(raw.createdAt ?? ""),
    contentType: type,
    owner: {
      id: ownerId,
      fullName: ownerLabel,
      email: String(ownerUser.email ?? ""),
      avatarUrl: ownerUser.avatarUrl ? String(ownerUser.avatarUrl) : undefined,
    },
  };
}

function filterContent(
  items: FlaggedContent[],
  params: ListContentParams,
): FlaggedContent[] {
  let filtered = items;

  if (params.status && params.status !== "Semua") {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  const search = params.search?.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.id.toLowerCase().includes(search) ||
        item.owner.fullName.toLowerCase().includes(search) ||
        item.owner.email.toLowerCase().includes(search),
    );
  }

  return filtered;
}

export const contentApi = {
  list: async (
    params: ListContentParams = {},
  ): Promise<ListContentResponse> => {
    const raw = await apiClient<unknown>("/admin/content");
    const record = asRecord(raw);

    const jasaItems = (record.jasa ?? []) as UnknownRecord[];
    const projectItems = (record.projects ?? []) as UnknownRecord[];

    const allItems: FlaggedContent[] = [
      ...jasaItems.map((item) => normaliseFlaggedItem(item, "jasa")),
      ...projectItems.map((item) => normaliseFlaggedItem(item, "project")),
    ];

    const filtered = filterContent(allItems, params);
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      total: filtered.length,
      page,
      limit,
    };
  },

  remove: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/content/${id}/remove`, {
      method: "PATCH",
    });
  },
};
