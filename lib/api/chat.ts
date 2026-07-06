import { chatMessagePreviewText } from "@/lib/chat-attachments";

import { apiClient } from "./client";
import {
  asRecord,
  listFromResponse,
  textFromValue,
  numberFromValue,
  booleanFromValue,
  dateValue,
} from "./normalizers";

export type ChatMessageType = "TEXT" | "FILE";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "ADMIN" | "MAHASISWA" | "KLIEN";
  message: string;
  messageType?: ChatMessageType;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
  isRead?: boolean;
}

export interface ChatSession {
  id: string; // userId of the user
  name: string;
  role: "MAHASISWA" | "KLIEN";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline: boolean;
  avatarUrl?: string;
  // Indonesian compatibility matching the design handoff
  nama?: string;
  last?: string;
  time?: string;
  unread?: number;
  online?: boolean;
}

export interface ChatThreadPage {
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
}

function normaliseMessage(raw: unknown, index = 0): ChatMessage {
  const record = asRecord(raw);
  const rawSender = asRecord(record.sender);
  const nested =
    record.message && typeof record.message === "object"
      ? asRecord(record.message)
      : record;
  const nestedSender = asRecord(nested.sender);

  const rawRole =
    record.senderRole ??
    record.sender_role ??
    rawSender.role ??
    nested.senderRole ??
    nested.sender_role ??
    nestedSender.role;
  const senderRole =
    typeof rawRole === "string" ? rawRole.toUpperCase() : "KLIEN";

  const senderName =
    record.senderName ??
    record.sender_name ??
    rawSender.name ??
    nested.senderName ??
    nested.sender_name ??
    nestedSender.name;
  const createdAt =
    record.createdAt ??
    record.created_at ??
    nested.createdAt ??
    nested.created_at ??
    record.time ??
    nested.time ??
    new Date().toISOString();
  const isRead = booleanFromValue(
    record.isRead ??
      record.is_read ??
      record.read ??
      nested.isRead ??
      nested.is_read ??
      nested.read ??
      false,
  );

  const rawMessageType =
    record.messageType ??
    record.message_type ??
    nested.messageType ??
    nested.message_type;
  const messageType: ChatMessageType | undefined =
    rawMessageType === "FILE" || rawMessageType === "TEXT"
      ? rawMessageType
      : record.fileUrl || record.file_url || nested.fileUrl || nested.file_url
        ? "FILE"
        : undefined;

  const fileUrl = textFromValue(
    record.fileUrl ?? record.file_url ?? nested.fileUrl ?? nested.file_url,
    "",
  );
  const fileName = textFromValue(
    record.fileName ?? record.file_name ?? nested.fileName ?? nested.file_name,
    "",
  );
  const mimeType = textFromValue(
    record.mimeType ?? record.mime_type ?? nested.mimeType ?? nested.mime_type,
    "",
  );
  const fileSizeRaw =
    record.fileSize ??
    record.file_size ??
    nested.fileSize ??
    nested.file_size;
  const fileSize =
    fileSizeRaw === null || fileSizeRaw === undefined
      ? null
      : numberFromValue(fileSizeRaw, 0);

  const messageText = textFromValue(
    record.message,
    textFromValue(
      nested.message ??
        nested.text ??
        nested.content ??
        nested.body ??
        nested.pesan ??
        record.pesan,
      "",
    ),
  );

  const normalized: ChatMessage = {
    id: String(
      record.id ??
        nested.id ??
        `${record.senderId ?? record.sender_id ?? nested.senderId ?? nested.sender_id ?? "msg"}-${createdAt}-${index}`,
    ),
    senderId: String(
      record.senderId ??
        record.sender_id ??
        rawSender.id ??
        nested.senderId ??
        nested.sender_id ??
        nestedSender.id ??
        "",
    ),
    senderName: textFromValue(
      senderName,
      senderRole === "ADMIN" ? "Admin" : "User",
    ),
    senderRole:
      senderRole === "ADMIN" ||
      senderRole === "MAHASISWA" ||
      senderRole === "KLIEN"
        ? senderRole
        : "KLIEN",
    message: messageText,
    messageType,
    fileUrl: fileUrl || null,
    fileName: fileName || null,
    fileSize,
    mimeType: mimeType || null,
    createdAt: String(createdAt),
    isRead,
  };

  if (!normalized.message && normalized.messageType === "FILE") {
    normalized.message = chatMessagePreviewText(normalized);
  }

  return normalized;
}

function isMessageRecord(item: unknown): boolean {
  const record = asRecord(item);
  const hasBody = Boolean(
    record.message ||
      record.text ||
      record.content ||
      record.body ||
      record.pesan ||
      record.fileUrl ||
      record.file_url ||
      record.messageType === "FILE" ||
      record.message_type === "FILE",
  );
  return Boolean(
    (record.senderId ||
      record.sender_id ||
      record.sender ||
      record.senderRole ||
      record.sender_role) &&
    hasBody &&
    (record.createdAt || record.created_at),
  );
}

function resolveLastMessagePreview(
  s: ReturnType<typeof asRecord>,
  latestMessage: ReturnType<typeof asRecord>,
): string {
  const rawLast =
    s.lastMessage ??
    s.last_message ??
    s.latestMessage ??
    s.latest_message;

  if (rawLast && typeof rawLast === "object") {
    const msg = asRecord(rawLast);
    const messageType =
      msg.messageType === "FILE" || msg.message_type === "FILE"
        ? ("FILE" as const)
        : undefined;

    return chatMessagePreviewText({
      message: textFromValue(msg.message, ""),
      messageType,
      fileName: textFromValue(msg.fileName ?? msg.file_name, "") || null,
      mimeType: textFromValue(msg.mimeType ?? msg.mime_type, "") || null,
    });
  }

  return textFromValue(rawLast ?? s.last ?? latestMessage.message, "");
}

function normaliseSession(raw: unknown, index: number): ChatSession {
  const s = asRecord(raw);
  const user = asRecord(s.user);
  const latestMessage = asRecord(
    s.lastMessage ?? s.last_message ?? s.latestMessage ?? s.latest_message,
  );
  const id = String(
    s.userId ?? s.user_id ?? user.id ?? s.id ?? `session-${index}`,
  );
  const name = textFromValue(
    s.name ??
      s.nama ??
      user.displayName ??
      user.display_name ??
      user.name ??
      user.fullName ??
      user.full_name,
    "User",
  );
  const lastMessage = resolveLastMessagePreview(s, latestMessage);

  // Safe message list timestamp comparison (independent of array sorting order)
  let arrayMessageAt = "";
  if (Array.isArray(s.messages) && s.messages.length > 0) {
    const firstMsg = s.messages[0];
    const lastMsg = s.messages[s.messages.length - 1];
    const firstTime = new Date(
      firstMsg?.createdAt || firstMsg?.created_at || 0,
    ).getTime();
    const lastTime = new Date(
      lastMsg?.createdAt || lastMsg?.created_at || 0,
    ).getTime();
    arrayMessageAt =
      firstTime >= lastTime
        ? firstMsg?.createdAt || firstMsg?.created_at || ""
        : lastMsg?.createdAt || lastMsg?.created_at || "";
  }

  const lastMessageAt = String(
    s.lastMessageAt ??
      s.last_message_at ??
      s.time ??
      latestMessage.createdAt ??
      latestMessage.created_at ??
      s.updatedAt ??
      s.updated_at ??
      s.createdAt ??
      s.created_at ??
      arrayMessageAt ??
      "",
  );

  const rawRole = s.role ?? user.role;
  const normalizedRole =
    typeof rawRole === "string" && rawRole.toUpperCase() === "MAHASISWA"
      ? "MAHASISWA"
      : "KLIEN";

  return {
    ...s,
    id,
    name,
    nama: textFromValue(
      s.nama ??
        s.name ??
        user.displayName ??
        user.display_name ??
        user.name ??
        user.fullName ??
        user.full_name,
      name,
    ),
    role: normalizedRole,
    lastMessage,
    last: textFromValue(
      s.last ??
        s.lastMessage ??
        s.last_message ??
        s.latestMessage ??
        s.latest_message,
      lastMessage,
    ),
    lastMessageAt,
    time: String(
      s.time ??
        s.lastMessageAt ??
        s.last_message_at ??
        latestMessage.createdAt ??
        latestMessage.created_at ??
        lastMessageAt,
    ),
    unreadCount: numberFromValue(
      s.unreadCount ?? s.unread_count,
      numberFromValue(s.unread),
    ),
    unread: numberFromValue(
      s.unread,
      numberFromValue(s.unreadCount ?? s.unread_count),
    ),
    isOnline: booleanFromValue(
      s.isOnline ??
        s.is_online ??
        s.online ??
        user.online ??
        user.isOnline ??
        user.is_online,
      false,
    ),
    online: booleanFromValue(
      s.online ??
        s.isOnline ??
        s.is_online ??
        user.online ??
        user.isOnline ??
        user.is_online,
      false,
    ),
  };
}

function participantFromMessage(raw: unknown, index: number): ChatSession {
  const msg = normaliseMessage(raw, index);
  const record = asRecord(raw);
  const sender = asRecord(record.sender);
  const receiver = asRecord(record.receiver ?? record.recipient ?? record.to);
  const user = asRecord(record.user);
  const isFromAdmin = msg.senderRole === "ADMIN";
  const participantId = isFromAdmin
    ? textFromValue(
        record.receiverId ??
          record.receiver_id ??
          record.recipientId ??
          record.recipient_id ??
          record.toUserId ??
          record.to_user_id ??
          receiver.id ??
          record.userId ??
          record.user_id ??
          user.id,
        msg.senderId,
      )
    : textFromValue(
        record.senderId ??
          record.sender_id ??
          sender.id ??
          record.userId ??
          record.user_id ??
          user.id,
        msg.senderId,
      );
  const participantName = isFromAdmin
    ? textFromValue(
        receiver.name ??
          receiver.fullName ??
          receiver.full_name ??
          user.name ??
          user.fullName ??
          user.full_name,
        "User",
      )
    : textFromValue(
        record.senderName ??
          record.sender_name ??
          sender.name ??
          sender.fullName ??
          sender.full_name ??
          user.name ??
          user.fullName ??
          user.full_name,
        "User",
      );

  const rawRole = isFromAdmin
    ? (receiver.role ?? user.role)
    : (record.senderRole ?? record.sender_role ?? sender.role ?? user.role);
  const participantRole =
    typeof rawRole === "string" && rawRole.toUpperCase() === "MAHASISWA"
      ? "MAHASISWA"
      : "KLIEN";

  const isUnread = !isFromAdmin && !msg.isRead;

  return {
    id: participantId,
    name: participantName,
    nama: participantName,
    role: participantRole,
    lastMessage: chatMessagePreviewText(msg),
    last: chatMessagePreviewText(msg),
    lastMessageAt: msg.createdAt,
    time: msg.createdAt,
    unreadCount: isUnread ? 1 : 0,
    unread: isUnread ? 1 : 0,
    isOnline: false,
    online: false,
  };
}

function groupMessageSessions(items: unknown[]): ChatSession[] {
  const sessions = new Map<string, ChatSession>();

  items.forEach((item, index) => {
    const next = participantFromMessage(item, index);
    const current = sessions.get(next.id);

    if (!current) {
      sessions.set(next.id, next);
      return;
    }

    const isNewer =
      dateValue(next.lastMessageAt) >= dateValue(current.lastMessageAt);
    sessions.set(next.id, {
      ...current,
      ...(isNewer
        ? {
            lastMessage: next.lastMessage,
            last: next.last,
            lastMessageAt: next.lastMessageAt,
            time: next.time,
          }
        : {}),
      name: current.name !== "User" ? current.name : next.name,
      nama: current.nama !== "User" ? current.nama : next.nama,
      role:
        current.role === "MAHASISWA" || next.role === "MAHASISWA"
          ? "MAHASISWA"
          : "KLIEN",
      unreadCount: current.unreadCount + next.unreadCount,
      unread: (current.unread ?? 0) + (next.unread ?? 0),
    });
  });

  return Array.from(sessions.values()).sort(
    (a, b) => dateValue(b.lastMessageAt) - dateValue(a.lastMessageAt),
  );
}

export const chatApi = {
  listSessions: async (filter?: string): Promise<ChatSession[]> => {
    const path = `/live-chat-admin${filter ? `?filter=${filter}` : ""}`;
    const response = await apiClient<unknown>(path);
    const sessions = listFromResponse(response, [
      "sessions",
      "chats",
      "threads",
      "messages",
    ]);

    if (sessions.length > 0 && sessions.every(isMessageRecord)) {
      return groupMessageSessions(sessions);
    }

    // Normalise fields to match the UI requirements and support both forms.
    return sessions.map(normaliseSession);
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await apiClient<unknown>(
      "/live-chat-admin/unread-count",
    );
    const record = asRecord(response);
    return { unreadCount: numberFromValue(record.unreadCount, 0) };
  },

  getMessages: async (userId: string): Promise<ChatMessage[]> => {
    const { messages } = await chatApi.getThreadPage(userId);
    return messages;
  },

  /**
   * Fetch one page of a thread. `page` 1 is the newest `limit` messages
   * (the backend serves newest-first then reverses); higher pages walk
   * backwards into older history for reverse infinite scroll.
   */
  getThreadPage: async (
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<ChatThreadPage> => {
    const response = await apiClient<unknown>(
      `/live-chat-admin/${userId}?page=${page}&limit=${limit}`,
    );
    const record = asRecord(response);
    const messages = listFromResponse(response, [
      "messages",
      "chats",
      "chat",
      "data",
      "history",
      "records",
      "items",
      "pesan",
      "chatMessages",
    ]).map(normaliseMessage);
    return {
      messages,
      total: numberFromValue(record.total, messages.length),
      page: numberFromValue(record.page, page),
      limit: numberFromValue(record.limit, limit),
    };
  },

  sendMessage: async (
    userId: string,
    message: string,
  ): Promise<ChatMessage> => {
    const raw = await apiClient<unknown>(`/live-chat-admin/${userId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return normaliseMessage(asRecord(raw).data ?? raw);
  },

  markAsRead: async (userId: string): Promise<void> => {
    try {
      await apiClient<unknown>(`/live-chat-admin/${userId}/read`, {
        method: "PATCH",
      });
    } catch (e) {
      console.warn("Failed to mark chat as read:", e);
    }
  },

  sendAttachment: async (
    userId: string,
    file: File,
    options: { retryOnUnauthorized?: boolean } = {},
  ): Promise<ChatMessage> => {
    const { retryOnUnauthorized = true } = options;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `/api/proxy/live-chat-admin/${userId}/attachments`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
    );

    if (response.status === 401 && retryOnUnauthorized) {
      const refreshed = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (refreshed.ok) {
        return chatApi.sendAttachment(userId, file, {
          retryOnUnauthorized: false,
        });
      }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      let detail = "";
      try {
        const error = JSON.parse(text) as Record<string, unknown>;
        detail =
          typeof error.message === "string"
            ? error.message
            : Array.isArray(error.message)
              ? error.message.join("; ")
              : JSON.stringify(error);
      } catch {
        detail = text.slice(0, 500);
      }
      throw new Error(
        detail.length > 0 && detail !== "{}"
          ? detail
          : `Upload gagal (status ${response.status})`,
      );
    }

    const raw = await response.json();
    return normaliseMessage(asRecord(raw).data ?? raw);
  },
};
