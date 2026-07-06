export const CHAT_ATTACHMENT_MAX_BYTES = 10_000_000;

/** Mirrors backend `SUPPORT_ATTACHMENT_MIME_TYPES` in live-chat-admin.service.ts */
export const CHAT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const CHAT_DOCUMENT_MIME_TYPES = CHAT_ALLOWED_MIME_TYPES.filter(
  (mime) => !mime.startsWith("image/"),
);

export const CHAT_DOCUMENT_ACCEPT = [
  ".pdf",
  ".docx",
  ".zip",
  ...CHAT_DOCUMENT_MIME_TYPES,
].join(",");

export const CHAT_IMAGE_ACCEPT = "image/png,image/jpeg";

export type ChatAttachmentValidationError =
  | "too_large"
  | "unsupported_type";

export function isChatImageMime(mimeType: string | null | undefined): boolean {
  return Boolean(mimeType?.startsWith("image/"));
}

export function isAllowedChatAttachment(file: File): boolean {
  return CHAT_ALLOWED_MIME_TYPES.includes(
    file.type as (typeof CHAT_ALLOWED_MIME_TYPES)[number],
  );
}

export function validateChatAttachment(
  file: File,
): ChatAttachmentValidationError | null {
  if (file.size > CHAT_ATTACHMENT_MAX_BYTES) return "too_large";
  if (!isAllowedChatAttachment(file)) return "unsupported_type";
  return null;
}

export function chatAttachmentErrorMessage(
  error: ChatAttachmentValidationError,
): string {
  switch (error) {
    case "too_large":
      return "Ukuran file maksimal 10 MB";
    case "unsupported_type":
      return "Format file tidak didukung. Gunakan PNG, JPEG, PDF, DOCX, atau ZIP";
  }
}

export function formatChatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function chatMessagePreviewText(message: {
  message: string;
  messageType?: "TEXT" | "FILE";
  fileName?: string | null;
  mimeType?: string | null;
}): string {
  if (message.messageType === "FILE" || message.fileName || message.mimeType) {
    if (message.fileName) return message.fileName;
    if (isChatImageMime(message.mimeType)) return "Gambar";
    return "Lampiran";
  }
  return message.message;
}
