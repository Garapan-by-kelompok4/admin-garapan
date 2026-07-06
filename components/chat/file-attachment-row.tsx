"use client";

import { Archive, FileText } from "lucide-react";

import { formatChatFileSize } from "@/lib/chat-attachments";
import { cn } from "@/lib/utils";

export interface FileAttachmentRowProps {
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  fileSize?: number | null;
  isMe?: boolean;
}

function fileIcon(mimeType?: string | null) {
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed"
  ) {
    return Archive;
  }
  return FileText;
}

export function FileAttachmentRow({
  fileName,
  fileUrl,
  mimeType,
  fileSize,
  isMe = false,
}: FileAttachmentRowProps) {
  const Icon = fileIcon(mimeType);
  const sizeLabel = formatChatFileSize(fileSize);

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className={cn(
        "flex min-w-[180px] max-w-full items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
        isMe
          ? "border-white/20 bg-white/10 hover:bg-white/15"
          : "border-border bg-surface-2/80 hover:bg-surface-3",
      )}
    >
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-md",
          isMe ? "bg-white/15 text-white" : "bg-white text-brand-600",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-xs font-semibold",
            isMe ? "text-white" : "text-ink-900",
          )}
          title={fileName}
        >
          {fileName}
        </p>
        {sizeLabel ? (
          <p
            className={cn(
              "text-[10px] font-medium",
              isMe ? "text-white/70" : "text-ink-400",
            )}
          >
            {sizeLabel}
          </p>
        ) : null}
      </div>
    </a>
  );
}
