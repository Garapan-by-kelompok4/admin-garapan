"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

import { ImageLightbox } from "@/components/chat/image-lightbox";
import { cn } from "@/lib/utils";

export interface AttachmentPreviewProps {
  fileUrl: string;
  fileName: string;
  isMe?: boolean;
}

export function AttachmentPreview({
  fileUrl,
  fileName,
  isMe = false,
}: AttachmentPreviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  if (previewFailed) {
    return (
      <div
        className={cn(
          "space-y-2 rounded-lg border px-3 py-2 text-xs",
          isMe
            ? "border-white/20 bg-white/10 text-white"
            : "border-border bg-surface-2 text-ink-700",
        )}
      >
        <p className="font-semibold">{fileName}</p>
        <p className={isMe ? "text-white/80" : "text-ink-500"}>
          Tidak dapat mempratinjau
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline",
            isMe ? "text-white" : "text-brand-600",
          )}
        >
          Unduh file
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="block max-w-[200px] overflow-hidden rounded-xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={fileName}
          className="max-h-[200px] w-full object-cover"
          onError={() => setPreviewFailed(true)}
        />
      </button>
      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        src={fileUrl}
        alt={fileName}
      />
    </>
  );
}
