import type { FlaggedContent } from "@/lib/api/content";

export type ModerationContentType = FlaggedContent["contentType"];

export function moderationContentLabels(contentType: ModerationContentType) {
  if (contentType === "project") {
    return {
      typeLabel: "Proyek",
      idLabel: "ID Proyek",
      copyIdLabel: "ID proyek",
      previewTitle: "Preview Konten Proyek",
      ownerRole: "Pemilik (Klien)",
      ownerTableSublabel: "Klien",
      removeAction: "Hapus Proyek",
      removeTitle: "Hapus proyek ini?",
      removeDescription:
        "Tindakan ini bersifat permanen. Proyek akan dihapus dari platform dan tidak dapat dipulihkan.",
      removeSuccess: "Proyek berhasil dihapus",
      markSafeAction: "Tandai Aman",
      markSafeTitle: "Tandai proyek sebagai aman?",
      markSafeDescription:
        "Semua laporan pending untuk proyek ini akan ditutup tanpa menghapus listing.",
      markSafeSuccess: "Proyek ditandai aman",
      moderationBlurb:
        "Tandai aman jika laporan tidak valid, atau hapus proyek jika konten melanggar kebijakan.",
      detailTitle: "Tinjau Proyek",
      typeBadgeClass:
        "bg-brand-50 text-brand-700 border-brand-100",
    };
  }

  return {
    typeLabel: "Jasa",
    idLabel: "ID Jasa",
    copyIdLabel: "ID jasa",
    previewTitle: "Preview Konten Jasa",
    ownerRole: "Pemilik (Mahasiswa)",
    ownerTableSublabel: "Mahasiswa",
    removeAction: "Hapus Jasa",
    removeTitle: "Hapus jasa ini?",
    removeDescription:
      "Tindakan ini bersifat permanen. Jasa akan dihapus dari platform dan tidak dapat dipulihkan.",
    removeSuccess: "Jasa berhasil dihapus",
    markSafeAction: "Tandai Aman",
    markSafeTitle: "Tandai jasa sebagai aman?",
    markSafeDescription:
      "Semua laporan pending untuk jasa ini akan ditutup tanpa menghapus listing.",
    markSafeSuccess: "Jasa ditandai aman",
    moderationBlurb:
      "Tandai aman jika laporan tidak valid, atau hapus jasa jika konten melanggar kebijakan.",
    detailTitle: "Tinjau Jasa",
    typeBadgeClass: "bg-warn-50 text-warn-700 border-warn-100",
  };
}
