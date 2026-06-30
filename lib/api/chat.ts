import { apiClient } from "./client";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "ADMIN" | "MAHASISWA" | "KLIEN";
  message: string;
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

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function listFromResponse(raw: unknown, keys: string[] = []): unknown[] {
  const record = asRecord(raw);
  const data = asRecord(record.data);

  if (Array.isArray(raw)) return raw;

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key];
    if (Array.isArray(data[key])) return data[key];
  }

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function textFromValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (!value) return fallback;
  const record = asRecord(value);
  return textFromValue(record.message ?? record.text ?? record.content ?? record.body, fallback);
}

function numberFromValue(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function booleanFromValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function dateValue(value: unknown): number {
  const time = new Date(textFromValue(value, "")).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function normaliseMessage(raw: unknown, index = 0): ChatMessage {
  const record = asRecord(raw);
  const rawSender = asRecord(record.sender);
  const nested = record.message && typeof record.message === "object" ? asRecord(record.message) : record;
  const nestedSender = asRecord(nested.sender);
  
  const rawRole = record.senderRole ?? record.sender_role ?? rawSender.role ?? nested.senderRole ?? nested.sender_role ?? nestedSender.role;
  const senderRole = typeof rawRole === "string" ? rawRole.toUpperCase() : "KLIEN";
  
  const senderName = record.senderName ?? record.sender_name ?? rawSender.name ?? nested.senderName ?? nested.sender_name ?? nestedSender.name;
  const createdAt = record.createdAt ?? record.created_at ?? nested.createdAt ?? nested.created_at ?? record.time ?? nested.time ?? new Date().toISOString();
  const isRead = booleanFromValue(record.isRead ?? record.is_read ?? record.read ?? nested.isRead ?? nested.is_read ?? nested.read ?? false);

  return {
    id: String(record.id ?? nested.id ?? `${record.senderId ?? record.sender_id ?? nested.senderId ?? nested.sender_id ?? "msg"}-${createdAt}-${index}`),
    senderId: String(record.senderId ?? record.sender_id ?? rawSender.id ?? nested.senderId ?? nested.sender_id ?? nestedSender.id ?? ""),
    senderName: textFromValue(senderName, senderRole === "ADMIN" ? "Admin" : "User"),
    senderRole: senderRole === "ADMIN" || senderRole === "MAHASISWA" || senderRole === "KLIEN" ? senderRole : "KLIEN",
    message: textFromValue(record.message, textFromValue(nested.message ?? nested.text ?? nested.content ?? nested.body ?? nested.pesan ?? record.pesan, "")),
    createdAt: String(createdAt),
    isRead,
  };
}

function isMessageRecord(item: unknown): boolean {
  const record = asRecord(item);
  return Boolean(
    (record.senderId || record.sender_id || record.sender || record.senderRole || record.sender_role) &&
      (record.message || record.text || record.content || record.body || record.pesan) &&
      (record.createdAt || record.created_at),
  );
}

function normaliseSession(raw: unknown, index: number): ChatSession {
  const s = asRecord(raw);
  const user = asRecord(s.user);
  const latestMessage = asRecord(s.lastMessage ?? s.last_message ?? s.latestMessage ?? s.latest_message);
  const id = String(s.userId ?? s.user_id ?? user.id ?? s.id ?? `session-${index}`);
  const name = textFromValue(s.name ?? s.nama ?? user.displayName ?? user.display_name ?? user.name ?? user.fullName ?? user.full_name, "User");
  const lastMessage = textFromValue(s.lastMessage ?? s.last_message ?? s.last ?? s.latestMessage ?? s.latest_message, "");

  // Safe message list timestamp comparison (independent of array sorting order)
  let arrayMessageAt = "";
  if (Array.isArray(s.messages) && s.messages.length > 0) {
    const firstMsg = s.messages[0];
    const lastMsg = s.messages[s.messages.length - 1];
    const firstTime = new Date(firstMsg?.createdAt || firstMsg?.created_at || 0).getTime();
    const lastTime = new Date(lastMsg?.createdAt || lastMsg?.created_at || 0).getTime();
    arrayMessageAt = firstTime >= lastTime 
      ? (firstMsg?.createdAt || firstMsg?.created_at || "") 
      : (lastMsg?.createdAt || lastMsg?.created_at || "");
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
    ""
  );

  const rawRole = s.role ?? user.role;
  const normalizedRole = typeof rawRole === "string" && rawRole.toUpperCase() === "MAHASISWA" ? "MAHASISWA" : "KLIEN";

  return {
    ...s,
    id,
    name,
    nama: textFromValue(s.nama ?? s.name ?? user.displayName ?? user.display_name ?? user.name ?? user.fullName ?? user.full_name, name),
    role: normalizedRole,
    lastMessage,
    last: textFromValue(s.last ?? s.lastMessage ?? s.last_message ?? s.latestMessage ?? s.latest_message, lastMessage),
    lastMessageAt,
    time: String(s.time ?? s.lastMessageAt ?? s.last_message_at ?? latestMessage.createdAt ?? latestMessage.created_at ?? lastMessageAt),
    unreadCount: numberFromValue(s.unreadCount ?? s.unread_count, numberFromValue(s.unread)),
    unread: numberFromValue(s.unread, numberFromValue(s.unreadCount ?? s.unread_count)),
    isOnline: booleanFromValue(s.isOnline ?? s.is_online, booleanFromValue(s.online)),
    online: booleanFromValue(s.online, booleanFromValue(s.isOnline ?? s.is_online)),
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
    ? textFromValue(record.receiverId ?? record.receiver_id ?? record.recipientId ?? record.recipient_id ?? record.toUserId ?? record.to_user_id ?? receiver.id ?? record.userId ?? record.user_id ?? user.id, msg.senderId)
    : textFromValue(record.senderId ?? record.sender_id ?? sender.id ?? record.userId ?? record.user_id ?? user.id, msg.senderId);
  const participantName = isFromAdmin
    ? textFromValue(receiver.name ?? receiver.fullName ?? receiver.full_name ?? user.name ?? user.fullName ?? user.full_name, "User")
    : textFromValue(record.senderName ?? record.sender_name ?? sender.name ?? sender.fullName ?? sender.full_name ?? user.name ?? user.fullName ?? user.full_name, "User");
  
  const rawRole = isFromAdmin
    ? (receiver.role ?? user.role)
    : (record.senderRole ?? record.sender_role ?? sender.role ?? user.role);
  const participantRole = typeof rawRole === "string" && rawRole.toUpperCase() === "MAHASISWA" ? "MAHASISWA" : "KLIEN";

  const isUnread = !isFromAdmin && !msg.isRead;

  return {
    id: participantId,
    name: participantName,
    nama: participantName,
    role: participantRole,
    lastMessage: msg.message,
    last: msg.message,
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

    const isNewer = dateValue(next.lastMessageAt) >= dateValue(current.lastMessageAt);
    sessions.set(next.id, {
      ...current,
      ...(isNewer ? {
        lastMessage: next.lastMessage,
        last: next.last,
        lastMessageAt: next.lastMessageAt,
        time: next.time,
      } : {}),
      name: current.name !== "User" ? current.name : next.name,
      nama: current.nama !== "User" ? current.nama : next.nama,
      role: current.role === "MAHASISWA" || next.role === "MAHASISWA" ? "MAHASISWA" : "KLIEN",
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
    const sessions = listFromResponse(response, ["sessions", "chats", "threads", "messages"]);
    
    if (sessions.length > 0 && sessions.every(isMessageRecord)) {
      return groupMessageSessions(sessions);
    }

    // Normalise fields to match the UI requirements and support both forms.
    return sessions.map(normaliseSession);
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

  sendMessage: async (userId: string, message: string): Promise<ChatMessage> => {
    const raw = await apiClient<unknown>(`/live-chat-admin/${userId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return normaliseMessage(asRecord(raw).data ?? raw);
  },

  markAsRead: async (userId: string): Promise<void> => {
    try {
      await apiClient<unknown>(`/live-chat-admin/${userId}/read`, { method: "PATCH" });
    } catch (e) {
      console.warn("Failed to mark chat as read:", e);
    }
  },
};
