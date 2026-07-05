import { apiClient } from "./client";
import {
  asRecord,
  nullableNumber,
  optionalString,
  recordList,
  stringOr,
  textFromValue,
  type UnknownRecord,
} from "./normalizers";

export interface FlaggedContent {
  id: string;
  title: string;
  description: string;
  category: string;
  /** Present when backend groups pending content reports for this listing. */
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
  search?: string;
  contentType?: FlaggedContent["contentType"];
}

export interface ListContentResponse {
  data: FlaggedContent[];
  total: number;
  page: number;
  limit: number;
}

export interface ContentModerationStats {
  pendingListings: number;
  pendingReports: number;
  dismissedReports: number;
  actionTakenReports: number;
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

function normaliseContentReports(
  raw: unknown,
): NonNullable<FlaggedContent["reports"]> {
  return recordList(raw).map((report) => {
    const reporter = asRecord(report.reporter);
    const reporterName = textFromValue(
      reporter.fullName,
      textFromValue(reporter.displayName, textFromValue(reporter.email, "Pengguna")),
    );

    return {
      id: stringOr(report.id),
      reporterName,
      reporterEmail: stringOr(reporter.email),
      reason: stringOr(report.reason),
      category: "Laporan Konten",
      createdAt: stringOr(report.createdAt),
    };
  });
}

function resolveOwner(
  raw: UnknownRecord,
  type: "jasa" | "project",
): FlaggedContent["owner"] {
  const owner = asRecord(raw.owner);
  if (owner.id || owner.fullName || owner.email) {
    return {
      id: stringOr(owner.id),
      fullName: textFromValue(owner.fullName, textFromValue(owner.email, "—")),
      email: stringOr(owner.email),
      avatarUrl: optionalString(owner.avatarUrl),
    };
  }

  const mahasiswa = asRecord(raw.mahasiswa);
  const klien = asRecord(raw.klien);
  const ownerUser =
    type === "jasa" ? asRecord(mahasiswa.user) : asRecord(klien.user);
  const ownerId = stringOr(ownerUser.id ?? mahasiswa.id ?? klien.id);
  const ownerLabel = textFromValue(
    type === "jasa" ? mahasiswa.fullName : klien.companyName,
    textFromValue(
      ownerUser.displayName,
      textFromValue(ownerUser.email, ownerId ? `User ${ownerId.slice(0, 8)}` : "—"),
    ),
  );

  return {
    id: ownerId,
    fullName: ownerLabel,
    email: stringOr(ownerUser.email),
    avatarUrl: optionalString(
      type === "jasa" ? mahasiswa.avatarUrl : klien.avatarUrl,
    ),
  };
}

function resolveContentType(
  raw: UnknownRecord,
  fallback: "jasa" | "project",
): FlaggedContent["contentType"] {
  const rawType = stringOr(raw.contentType).toLowerCase();
  if (rawType === "project") return "project";
  if (rawType === "jasa") return "jasa";
  return fallback;
}

function normaliseFlaggedItem(
  raw: UnknownRecord,
  type: "jasa" | "project",
): FlaggedContent {
  const kategori = asRecord(raw.kategori);
  const reports = normaliseContentReports(raw.reports);
  const reportCount =
    nullableNumber(raw.reportCount) ??
    (reports.length > 0 ? reports.length : undefined);
  const contentType = resolveContentType(raw, type);

  return {
    id: stringOr(raw.id),
    title: stringOr(raw.title),
    description: stringOr(raw.description),
    category: textFromValue(kategori.name, ""),
    ...(reportCount !== undefined ? { reportCount } : {}),
    ...(reports.length > 0 ? { reports } : {}),
    status: mapContentStatus(stringOr(raw.status), contentType),
    createdAt: stringOr(raw.createdAt),
    contentType,
    owner: resolveOwner(raw, contentType),
  };
}

function filterContent(
  items: FlaggedContent[],
  params: ListContentParams,
): FlaggedContent[] {
  let filtered = items;

  if (params.contentType) {
    filtered = filtered.filter(
      (item) => item.contentType === params.contentType,
    );
  }

  const search = params.search?.trim().toLowerCase();
  if (!search) return filtered;

  return filtered.filter(
    (item) =>
      item.title.toLowerCase().includes(search) ||
      item.id.toLowerCase().includes(search) ||
      item.owner.fullName.toLowerCase().includes(search) ||
      item.owner.email.toLowerCase().includes(search),
  );
}

export const contentApi = {
  stats: async (): Promise<ContentModerationStats> => {
    const raw = await apiClient<unknown>("/admin/content/stats");
    const record = asRecord(raw);

    return {
      pendingListings: nullableNumber(record.pendingListings) ?? 0,
      pendingReports: nullableNumber(record.pendingReports) ?? 0,
      dismissedReports: nullableNumber(record.dismissedReports) ?? 0,
      actionTakenReports: nullableNumber(record.actionTakenReports) ?? 0,
    };
  },

  list: async (
    params: ListContentParams = {},
  ): Promise<ListContentResponse> => {
    const raw = await apiClient<unknown>("/admin/content");
    const record = asRecord(raw);

    const jasaItems = recordList(record.jasa);
    const projectItems = recordList(record.projects);

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

  markSafe: async (
    id: string,
    resolutionNote?: string,
  ): Promise<{ contentId: string; reportsDismissed: number }> => {
    return apiClient<{ contentId: string; reportsDismissed: number }>(
      `/admin/content/${id}/dismiss`,
      {
        method: "PATCH",
        body: JSON.stringify(
          resolutionNote ? { resolutionNote } : {},
        ),
      },
    );
  },
};
