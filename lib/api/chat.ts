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

export const chatApi = {
  listSessions: async (filter?: string): Promise<ChatSession[]> => {
    const path = `/live-chat-admin${filter ? `?filter=${filter}` : ""}`;
    const response = await apiClient<unknown>(path);
    const sessions = listFromResponse(response, ["sessions", "chats", "threads"]);
    
    // Normalise fields to match the UI requirements and support both forms
    return sessions.map((item, index) => {
      const s = asRecord(item);
      const user = asRecord(s.user);
      const latestMessage = asRecord(s.latestMessage);
      const id = String(s.id ?? s.userId ?? user.id ?? `session-${index}`);
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
    });
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
