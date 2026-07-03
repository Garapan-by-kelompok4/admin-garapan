import { apiClient } from "./client";

export interface FlaggedContent {
  id: string;
  title: string;
  description: string;
  category: string;
  reportCount: number;
  status: "Ditinjau" | "Aman" | "Dihapus" | "Disembunyikan";
  createdAt: string;
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

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function normaliseFlaggedItem(
  raw: UnknownRecord,
  type: "jasa" | "project",
): FlaggedContent {
  const owner =
    type === "jasa"
      ? asRecord(asRecord(raw.mahasiswa).user)
      : asRecord(asRecord(raw.klien).user);

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    description: "",
    category: "",
    reportCount: 0,
    status: "Ditinjau",
    createdAt: new Date().toISOString(),
    owner: {
      id: String(owner.id ?? ""),
      fullName: String(owner.fullName ?? owner.displayName ?? ""),
      email: String(owner.email ?? ""),
      avatarUrl: String(owner.avatarUrl ?? ""),
    },
  };
}

export const contentApi = {
  list: async (
    _params: ListContentParams = {},
  ): Promise<ListContentResponse> => {
    const raw = await apiClient<unknown>("/admin/content");
    const record = asRecord(raw);

    const jasaItems = (record.jasa ?? []) as UnknownRecord[];
    const projectItems = (record.projects ?? []) as UnknownRecord[];

    const data: FlaggedContent[] = [
      ...jasaItems.map((item) => normaliseFlaggedItem(item, "jasa")),
      ...projectItems.map((item) => normaliseFlaggedItem(item, "project")),
    ];

    return {
      data,
      total: data.length,
      page: _params.page ?? 1,
      limit: _params.limit ?? data.length,
    };
  },

  remove: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/content/${id}/remove`, {
      method: "PATCH",
    });
  },
};
