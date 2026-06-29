import { apiClient } from "./client";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "ADMIN" | "MAHASISWA" | "KLIEN";
  message: string;
  createdAt: string;
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
  const senderRole = record.senderRole ?? rawSender.role ?? nested.senderRole ?? nestedSender.role;
  const senderName = record.senderName ?? rawSender.name ?? nested.senderName ?? nestedSender.name;
  const createdAt = record.createdAt ?? nested.createdAt ?? record.time ?? nested.time ?? new Date().toISOString();

  return {
    id: String(record.id ?? nested.id ?? `${record.senderId ?? nested.senderId ?? "msg"}-${createdAt}-${index}`),
    senderId: String(record.senderId ?? rawSender.id ?? nested.senderId ?? nestedSender.id ?? ""),
    senderName: textFromValue(senderName, senderRole === "ADMIN" ? "Admin" : "User"),
    senderRole: senderRole === "ADMIN" || senderRole === "MAHASISWA" || senderRole === "KLIEN" ? senderRole : "KLIEN",
    message: textFromValue(record.message, textFromValue(nested.message ?? nested.text ?? nested.content ?? nested.body, "")),
    createdAt: String(createdAt),
  };
}

function isMessageRecord(item: unknown): boolean {
  const record = asRecord(item);
  return Boolean(
    (record.senderId || record.sender || record.senderRole) &&
      (record.message || record.text || record.content || record.body) &&
      record.createdAt,
  );
}

function normaliseSession(raw: unknown, index: number): ChatSession {
  const s = asRecord(raw);
  const user = asRecord(s.user);
  const latestMessage = asRecord(s.latestMessage);
  const id = String(s.userId ?? user.id ?? s.id ?? `session-${index}`);
  const name = textFromValue(s.name ?? s.nama ?? user.name ?? user.fullName, "User");
  const lastMessage = textFromValue(s.lastMessage ?? s.last ?? s.latestMessage, "");
  const lastMessageAt = String(s.lastMessageAt ?? s.time ?? latestMessage.createdAt ?? new Date().toISOString());

  return {
    ...s,
    id,
    name,
    nama: textFromValue(s.nama ?? s.name ?? user.name ?? user.fullName, name),
    role: s.role === "MAHASISWA" || user.role === "MAHASISWA" ? "MAHASISWA" : "KLIEN",
    lastMessage,
    last: textFromValue(s.last ?? s.lastMessage ?? s.latestMessage, lastMessage),
    lastMessageAt,
    time: String(s.time ?? s.lastMessageAt ?? latestMessage.createdAt ?? lastMessageAt),
    unreadCount: numberFromValue(s.unreadCount, numberFromValue(s.unread)),
    unread: numberFromValue(s.unread, numberFromValue(s.unreadCount)),
    isOnline: booleanFromValue(s.isOnline, booleanFromValue(s.online)),
    online: booleanFromValue(s.online, booleanFromValue(s.isOnline)),
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
    ? textFromValue(record.receiverId ?? record.recipientId ?? record.toUserId ?? receiver.id ?? record.userId ?? user.id, msg.senderId)
    : textFromValue(record.senderId ?? sender.id ?? record.userId ?? user.id, msg.senderId);
  const participantName = isFromAdmin
    ? textFromValue(receiver.name ?? receiver.fullName ?? user.name ?? user.fullName, "User")
    : textFromValue(record.senderName ?? sender.name ?? sender.fullName ?? user.name ?? user.fullName, "User");
  const participantRole = isFromAdmin
    ? textFromValue(receiver.role ?? user.role, "KLIEN")
    : textFromValue(record.senderRole ?? sender.role ?? user.role, "KLIEN");

  return {
    id: participantId,
    name: participantName,
    nama: participantName,
    role: participantRole === "MAHASISWA" ? "MAHASISWA" : "KLIEN",
    lastMessage: msg.message,
    last: msg.message,
    lastMessageAt: msg.createdAt,
    time: msg.createdAt,
    unreadCount: isFromAdmin ? 0 : 1,
    unread: isFromAdmin ? 0 : 1,
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
    const response = await apiClient<unknown>(`/live-chat-admin/${userId}`);
    return listFromResponse(response, ["messages", "chat", "data"]).map(normaliseMessage);
  },

  sendMessage: async (userId: string, message: string): Promise<ChatMessage> => {
    const raw = await apiClient<unknown>(`/live-chat-admin/${userId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return normaliseMessage(asRecord(raw).data ?? raw);
  },
};
