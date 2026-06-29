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

export const chatApi = {
  listSessions: async (filter?: string): Promise<ChatSession[]> => {
    const path = `/live-chat-admin${filter ? `?filter=${filter}` : ""}`;
    const sessions = await apiClient<ChatSession[]>(path);
    
    // Normalise fields to match the UI requirements and support both forms
    return sessions.map((s) => ({
      ...s,
      name: s.name || s.nama || "User",
      nama: s.nama || s.name || "User",
      lastMessage: s.lastMessage || s.last || "",
      last: s.last || s.lastMessage || "",
      lastMessageAt: s.lastMessageAt || s.time || new Date().toISOString(),
      time: s.time || s.lastMessageAt || new Date().toISOString(),
      unreadCount: typeof s.unreadCount === "number" ? s.unreadCount : (s.unread || 0),
      unread: typeof s.unread === "number" ? s.unread : (s.unreadCount || 0),
      isOnline: typeof s.isOnline === "boolean" ? s.isOnline : (s.online || false),
      online: typeof s.online === "boolean" ? s.online : (s.isOnline || false),
    }));
  },

  getMessages: async (userId: string): Promise<ChatMessage[]> => {
    return apiClient<ChatMessage[]>(`/live-chat-admin/${userId}`);
  },

  sendMessage: async (userId: string, message: string): Promise<ChatMessage> => {
    return apiClient<ChatMessage>(`/live-chat-admin/${userId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
};
