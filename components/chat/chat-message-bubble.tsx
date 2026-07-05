"use client";

import { memo } from "react";

import { avatarClass, initials } from "@/lib/avatar";
import { formatTime } from "@/lib/chat-utils";
import type { ChatMessage } from "@/lib/api/chat";

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export const ChatMessageBubble = memo(function ChatMessageBubble({
  message,
  isMe,
}: ChatMessageBubbleProps) {
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
          className={`rounded-xl p-3 text-xs font-medium leading-relaxed shadow-sm ${
            isMe
              ? "rounded-br-xs bg-brand-500 text-white"
              : "rounded-bl-xs border border-border bg-white text-ink-900"
          }`}
        >
          {message.message}
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
