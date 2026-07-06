"use client";

import { memo } from "react";

import { AttachmentPreview } from "@/components/chat/attachment-preview";
import { FileAttachmentRow } from "@/components/chat/file-attachment-row";
import { avatarClass, initials } from "@/lib/avatar";
import {
  isChatImageMime,
  chatMessagePreviewText,
} from "@/lib/chat-attachments";
import { formatTime } from "@/lib/chat-utils";
import type { ChatMessage } from "@/lib/api/chat";

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

function MessageBody({
  message,
  isMe,
}: {
  message: ChatMessage;
  isMe: boolean;
}) {
  const isFileMessage =
    message.messageType === "FILE" ||
    Boolean(message.fileUrl && message.mimeType);

  if (isFileMessage && message.fileUrl) {
    const fileName =
      message.fileName ||
      chatMessagePreviewText(message) ||
      "Lampiran";

    if (isChatImageMime(message.mimeType)) {
      return (
        <AttachmentPreview
          fileUrl={message.fileUrl}
          fileName={fileName}
          isMe={isMe}
        />
      );
    }

    return (
      <FileAttachmentRow
        fileUrl={message.fileUrl}
        fileName={fileName}
        mimeType={message.mimeType}
        fileSize={message.fileSize}
        isMe={isMe}
      />
    );
  }

  if (isFileMessage && !message.fileUrl) {
    const fileName = message.fileName || "Lampiran";
    return (
      <div
        className={`text-xs ${isMe ? "text-white/90" : "text-ink-600"}`}
      >
        <p className="font-semibold">{fileName}</p>
        <p className="mt-1 text-[10px] opacity-80">Tidak dapat mempratinjau</p>
      </div>
    );
  }

  return <>{message.message}</>;
}

export const ChatMessageBubble = memo(function ChatMessageBubble({
  message,
  isMe,
}: ChatMessageBubbleProps) {
  const isFileMessage =
    message.messageType === "FILE" ||
    Boolean(message.fileUrl && message.mimeType);
  const isImageAttachment =
    isFileMessage && isChatImageMime(message.mimeType) && message.fileUrl;

  return (
    <div
      className={`chat-message-item flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 72px" }}
    >
      {!isMe && (
        <div
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm ${avatarClass(message.senderName)}`}
        >
          {initials(message.senderName)}
        </div>
      )}
      <div className="max-w-[70%]">
        <div
          className={`rounded-xl text-xs font-medium leading-relaxed shadow-sm ${
            isImageAttachment
              ? "overflow-hidden p-0"
              : `p-3 ${
                  isMe
                    ? "rounded-br-xs bg-brand-500 text-white"
                    : "rounded-bl-xs border border-border bg-white text-ink-900"
                }`
          }`}
        >
          <MessageBody message={message} isMe={isMe} />
        </div>
        <span
          className={`mt-1 block text-[9.5px] font-medium text-ink-400 ${isMe ? "text-right" : "text-left"}`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
});
