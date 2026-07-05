"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, ChatMessage, ChatThreadPage, ChatSession } from "@/lib/api/chat";

// One page of thread history. Page 1 is the newest batch; scrolling to the top
// of the log pulls older pages and prepends them (reverse infinite scroll).
const MESSAGE_PAGE_SIZE = 20;
import { avatarClass, initials } from "@/lib/avatar";
import {
  Search,
  X,
  Send,
  Phone,
  Mail,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Format date helpers
const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
};

// Quick templates array
const quickReplies = [
  "Halo, ada yang bisa kami bantu di Pusat Bantuan GARAPAN?",
  "Mohon tunggu sebentar ya, kami sedang memeriksa detail transaksi Anda.",
  "Terima kasih atas laporannya. Kasus ini telah diteruskan ke tim moderasi.",
  "Apakah kendala Anda sudah terselesaikan?",
];

function ChatRoom({
  activeSessionId,
  activeSession,
  onEndSession,
}: {
  activeSessionId: string;
  activeSession: ChatSession | null;
  onEndSession: () => void;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [oldestPageLoaded, setOldestPageLoaded] = useState(1);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [adminNote, setAdminNote] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`chat_note_${activeSessionId}`) || "";
    }
    return "";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const liveMessagesLenRef = useRef(0);

  // Query the newest page of messages (polls every 5 seconds)
  const {
    data: livePage,
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ["chatMessages", activeSessionId],
    queryFn: async () => {
      const page = await chatApi.getThreadPage(
        activeSessionId,
        1,
        MESSAGE_PAGE_SIZE,
      );
      // Await markAsRead to ensure the backend DB reflects the read status
      await chatApi.markAsRead(activeSessionId);
      // Invalidate sessions list query so both Column 1 and Sidebar badges update instantly
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
      return page;
    },
    refetchInterval: 5000, // poll messages every 5s when open
  });

  // Derive live messages from the query cache, plus optimistic sends.
  const liveMessages = useMemo(() => livePage?.messages ?? [], [livePage?.messages]);
  const totalMessages = livePage?.total ?? 0;

  // Merge older history + live tail + optimistic, de-duplicated by id and ordered oldest -> newest.
  const allMessages = useMemo(() => {
    const byId = new Map<string, ChatMessage>();
    for (const m of olderMessages) byId.set(m.id, m);
    for (const m of liveMessages) byId.set(m.id, m);
    for (const m of optimisticMessages) byId.set(m.id, m);
    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [olderMessages, liveMessages, optimisticMessages]);

  const hasMoreMessages = allMessages.length < totalMessages;

  // Load the next older page and prepend it, preserving the user's scroll position
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMoreMessages) return;
    const container = messagesContainerRef.current;
    const prevHeight = container?.scrollHeight ?? 0;
    const prevTop = container?.scrollTop ?? 0;
    setIsLoadingOlder(true);
    try {
      const nextPage = oldestPageLoaded + 1;
      const res = await chatApi.getThreadPage(
        activeSessionId,
        nextPage,
        MESSAGE_PAGE_SIZE,
      );
      setOlderMessages((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        for (const m of res.messages) byId.set(m.id, m);
        return Array.from(byId.values());
      });
      setOldestPageLoaded(nextPage);
      // Keep the same message under the user's eyes after older content is prepended
      requestAnimationFrame(() => {
        const c = messagesContainerRef.current;
        if (c) c.scrollTop = c.scrollHeight - prevHeight + prevTop;
      });
    } catch (e) {
      console.warn("Failed to load older messages", e);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [activeSessionId, isLoadingOlder, hasMoreMessages, oldestPageLoaded]);

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop <= 40) loadOlderMessages();
  };

  // Scroll helper with delay to allow rendering and paint to complete
  const scrollToBottom = useCallback((behavior: "smooth" | "auto" = "auto") => {
    setTimeout(() => {
      const container = messagesContainerRef.current;
      if (!container) return;
      if (behavior === "smooth") {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }, 60);
  }, []);

  // Scroll to bottom when new live messages arrive, but not when older history is prepended above.
  const liveLength = livePage?.messages.length ?? 0;
  useEffect(() => {
    if (liveLength > 0 && liveLength !== liveMessagesLenRef.current) {
      const isInitialLoad = olderMessages.length === 0;
      scrollToBottom(isInitialLoad ? "auto" : "smooth");
    }
    liveMessagesLenRef.current = liveLength;
  }, [liveLength, olderMessages.length, scrollToBottom]);

  // Mutation to Send a Message
  const sendMessageMutation = useMutation({
    mutationFn: ({ userId, message }: { userId: string; message: string }) =>
      chatApi.sendMessage(userId, message),
    onSuccess: (newMessage) => {
      // Optimistically update the cached live page
      queryClient.setQueryData<ChatThreadPage>(
        ["chatMessages", activeSessionId],
        (old) =>
          old
            ? {
                ...old,
                messages: [...old.messages, newMessage],
                total: old.total + 1,
              }
            : old,
      );
      // Optimistically update local messages list instantly
      setOptimisticMessages((prev) => [...prev, newMessage]);
      // Clear input
      setMessageInput("");
      // Invalidate sessions query to update last message preview
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim pesan");
    },
  });

  // Handle send message submit
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessageMutation.mutate({
      userId: activeSessionId,
      message: messageInput.trim(),
    });
  };

  // Handle Quick Template replies
  const handleQuickReply = (text: string) => {
    setMessageInput(text);
  };

  // Save admin notes to localStorage
  const handleSaveNote = () => {
    localStorage.setItem(`chat_note_${activeSessionId}`, adminNote);
    toast.success("Catatan admin berhasil disimpan");
  };

  return (
    <>
      {/* COLUMN 2: Active Chat Room (Flex-1) */}
      <div className="flex-1 flex flex-col h-full bg-surface-2 min-w-0 relative">
        {/* Chat Room Header */}
        <div className="h-[60px] border-b border-border bg-white px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
              title="Klik untuk detail profile user"
            >
              <div className="relative">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${avatarClass(activeSession?.name || "")}`}
                >
                  {initials(activeSession?.name || "")}
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    activeSession?.isOnline
                      ? "bg-success-500"
                      : "bg-slate-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900 text-sm leading-tight hover:underline">
                  {activeSession?.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-ink-400 font-medium">
                    {activeSession?.isOnline ? "Online" : "Offline"}
                  </span>
                  <span className="text-ink-200 text-[10px]">•</span>
                  <span className="text-[10px] text-ink-400 font-semibold uppercase">
                    ID: {activeSession?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowCloseConfirm(true)}
              className="px-3 py-1.5 border border-danger-200 bg-danger-50/50 hover:bg-danger-55 hover:text-danger-700 text-xs font-bold text-danger-600 rounded-lg transition-colors cursor-pointer"
            >
              Tutup Sesi
            </Button>
          </div>
        </div>

        {/* Chat Message Logs Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {isLoadingMessages && allMessages.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink-400 font-medium">
              Memuat riwayat chat...
            </div>
          ) : allMessages.length > 0 ? (
            <>
              {hasMoreMessages && (
                <div className="flex items-center justify-center py-1">
                  <span className="text-[10px] font-bold text-ink-400">
                    {isLoadingOlder
                      ? "Memuat pesan lama..."
                      : "Gulir ke atas untuk pesan lama"}
                  </span>
                </div>
              )}
              {!hasMoreMessages && (
                <div className="flex items-center justify-center py-1">
                  <span className="text-[10px] font-bold text-ink-300">
                    Awal percakapan
                  </span>
                </div>
              )}
              {allMessages.map((msg, idx) => {
                const isMe =
                  msg.senderRole === "ADMIN" ||
                  (user && msg.senderId === user.id);

                const showDateSeparator =
                  idx === 0 ||
                  new Date(
                    allMessages[idx - 1].createdAt,
                  ).toDateString() !==
                    new Date(msg.createdAt).toDateString();

                return (
                  <React.Fragment key={`${msg.id}-${msg.createdAt}-${idx}`}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-0.5 rounded border border-border bg-white text-[10px] font-bold text-ink-400 shadow-sm">
                          {formatDateLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                    >
                      {!isMe && (
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 shadow-sm ${avatarClass(msg.senderName)}`}
                        >
                          {initials(msg.senderName)}
                        </div>
                      )}
                      <div className="max-w-[70%]">
                        <div
                          className={`p-3 text-xs font-medium leading-relaxed rounded-xl shadow-sm ${
                            isMe
                              ? "bg-brand-500 text-white rounded-br-xs"
                              : "bg-white text-ink-900 border border-border rounded-bl-xs"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span
                          className={`block text-[9.5px] text-ink-400 font-medium mt-1 ${isMe ? "text-right" : "text-left"}`}
                        >
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-ink-400 font-medium">
              Sesi dimulai. Silakan kirim pesan balasan pertama Anda untuk
              membantu user.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input & Suggestions Bar */}
        <div className="bg-white border-t border-border p-4 flex flex-col gap-3 flex-shrink-0">
          {/* Quick Suggestion Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-thin">
            <span className="text-[10px] font-bold text-brand-600 self-center mr-1 flex items-center gap-1 flex-shrink-0">
              <Sparkles className="h-3 w-3" /> Balas cepat:
            </span>
            {quickReplies.map((r, idx) => (
              <Button
                key={idx}
                type="button"
                onClick={() => handleQuickReply(r)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full border border-border bg-surface-2 hover:bg-surface-3 hover:text-ink-900 text-ink-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                {r}
              </Button>
            ))}
          </div>

          {/* Text Form */}
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 items-end"
          >
            <Textarea
              rows={1}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Tulis pesan balasan bantuan..."
              className="flex-1 min-h-[38px] max-h-[100px] p-2 px-3 bg-surface-2 border border-border rounded-lg text-xs placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium resize-y"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <Button
              type="submit"
              disabled={
                sendMessageMutation.isPending || !messageInput.trim()
              }
              className="h-[38px] px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <span>Kirim</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>

        {/* Custom centered "Tutup Sesi" confirm modal overlay */}
        {showCloseConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-border/85 animate-in zoom-in-95 duration-200">
              <h4 className="font-heading font-bold text-sm text-ink-900 mb-2">
                Tutup Sesi Chat
              </h4>
              <p className="text-xs text-ink-500 mb-6 leading-relaxed">
                Apakah Anda yakin ingin mengakhiri sesi bantuan live support
                chat ini? Tindakan ini akan menutup sesi obrolan aktif.
              </p>
              <div className="flex justify-end gap-2.5">
                <Button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="px-4 py-2 border border-border bg-white text-ink-700 hover:bg-surface-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCloseConfirm(false);
                    onEndSession();
                    toast.success("Sesi bantuan ditutup");
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Ya, Akhiri Sesi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COLUMN 3: User Info Sidebar (280px Collapsible) */}
      {showUserInfo && (
        <div className="w-[280px] border-l border-border flex flex-col h-full bg-white flex-shrink-0 overflow-y-auto transition-all duration-300 animate-in slide-in-from-right duration-200">
          {activeSession && (
            <div className="p-5 space-y-6">
              {/* Header Profil */}
              <div className="text-center space-y-3 border-b border-border pb-5">
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto shadow-sm ${avatarClass(activeSession.name)}`}
                >
                  {initials(activeSession.name)}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-ink-900 leading-tight">
                    {activeSession.name}
                  </h4>
                  <span
                    className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded border mt-2 ${
                      activeSession.role === "KLIEN"
                        ? "bg-info-50 border-info-100 text-info-700"
                        : "bg-success-50 border-success-100 text-success-700"
                    }`}
                  >
                    {activeSession.role === "KLIEN"
                      ? "User Klien"
                      : "Freelancer Mahasiswa"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center gap-1.5 pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Apakah Anda yakin ingin memblokir ${activeSession.name}?`,
                        )
                      ) {
                        toast.success("User berhasil diblokir");
                      }
                    }}
                    className="px-4 py-1.5 border border-danger-200 bg-danger-50 text-[11px] font-bold text-danger-700 rounded-lg hover:bg-danger-55 transition-colors cursor-pointer shadow-sm w-full max-w-[120px]"
                  >
                    Blokir
                  </Button>
                </div>
              </div>

              {/* Info Kontak */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Info Kontak
                </h5>
                <div className="rounded-lg border border-border bg-surface-2/40 p-3.5 space-y-3">
                  <div className="flex gap-2.5 items-center text-xs">
                    <Mail className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
                    <span
                      className="font-medium text-ink-800 truncate"
                      title={activeSession.id + "@garapan.test"}
                    >
                      {activeSession.id}@garapan.test
                    </span>
                  </div>
                  <div className="flex gap-2.5 items-center text-xs">
                    <Phone className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
                    <span className="font-semibold text-ink-800">
                      +62 812-3456-789
                    </span>
                  </div>
                  <div className="flex gap-2.5 items-center text-xs">
                    <Calendar className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
                    <span className="font-semibold text-ink-800">
                      19 Apr 2026
                    </span>
                  </div>
                </div>
              </div>

              {/* Catatan Admin */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-baseline">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Catatan Internal
                  </h5>
                  <Button
                    type="button"
                    onClick={handleSaveNote}
                    className="text-[10px] text-brand-600 hover:text-brand-700 font-bold bg-transparent border-0 cursor-pointer"
                  >
                    Simpan
                  </Button>
                </div>
                <Textarea
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Tuliskan catatan internal mengenai user atau sesi kendala bantuan ini..."
                  className="w-full p-2.5 bg-surface-2 border border-border rounded-lg text-xs placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "ALL" | "KLIEN" | "MAHASISWA" | "UNREAD"
  >("ALL");
  const [showSessionList] = useState(true);

  // 1. Query chat sessions list (polls every 5 seconds)
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions(),
    refetchInterval: 5000,
  });

  // Get active session details from list
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Filtered sessions based on search & tab role
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === "UNREAD") return s.unreadCount > 0;
    if (roleFilter === "KLIEN") return s.role === "KLIEN";
    if (roleFilter === "MAHASISWA") return s.role === "MAHASISWA";

    return true;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] border border-border rounded-xl bg-white shadow-sh-2 overflow-hidden select-none">
      {/* COLUMN 1: Session List (320px or Full Width) */}
      <div
        className={`${
          activeSessionId
            ? "w-[320px] border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.05)] z-10"
            : "w-full"
        } flex flex-col h-full bg-white flex-shrink-0 transition-all duration-300 ${
          activeSessionId && !showSessionList
            ? "w-0 overflow-hidden border-r-0"
            : ""
        }`}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative flex">
            <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
            <Input
              placeholder="Cari chat user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[36px] pl-9 pr-8 bg-surface-2 border border-border rounded-lg text-xs placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
            />
            {search && (
              <Button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-2 p-0.5 text-ink-400 hover:text-ink-700 bg-transparent border-0 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {(
              [
                { id: "ALL", label: "Semua" },
                { id: "UNREAD", label: "Belum Dibaca" },
                { id: "KLIEN", label: "Klien" },
                { id: "MAHASISWA", label: "Mahasiswa" },
              ] as const
            ).map((f) => (
              <Button
                key={f.id}
                type="button"
                onClick={() => setRoleFilter(f.id)}
                className={`px-2.5 py-1 text-[10.5px] font-bold rounded-md border transition-all whitespace-nowrap cursor-pointer ${
                  roleFilter === f.id
                    ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                    : "bg-white border-border text-ink-500 hover:bg-surface-3 hover:text-ink-900"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sessions Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {isLoadingSessions ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="p-4 flex gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-surface-3" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface-3 rounded w-1/3" />
                  <div className="h-2 bg-surface-3 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session, idx) => {
              const isActive = session.id === activeSessionId;
              const unreadCount = isActive ? 0 : session.unreadCount;
              const hasUnread = unreadCount > 0;
              return (
                <div
                  key={`${session.id}-${idx}`}
                  onClick={async () => {
                    setActiveSessionId(session.id);

                    // Optimistically set unreadCount to 0 for this session in listSessions cache
                    queryClient.setQueryData<ChatSession[]>(
                      ["chatSessions"],
                      (old) => {
                        if (!old) return old;
                        return old.map((s) =>
                          s.id === session.id
                            ? { ...s, unreadCount: 0, unread: 0 }
                            : s,
                        );
                      },
                    );

                    try {
                      // Mark as read on the backend and await database write
                      await chatApi.markAsRead(session.id);
                    } catch (e) {
                      console.warn(e);
                    }

                    // Invalidate chatSessions query to refetch updated count from backend
                    queryClient.invalidateQueries({
                      queryKey: ["chatSessions"],
                    });
                  }}
                  className={`p-3.5 flex gap-3 cursor-pointer hover:bg-surface-2 transition-all relative ${
                    isActive
                      ? "bg-brand-50/70 border-l-[3px] border-brand-500 pl-[11px]"
                      : ""
                  }`}
                >
                  {/* Avatar wrapper with online indicator */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${avatarClass(session.name)}`}
                    >
                      {initials(session.name)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                        session.isOnline ? "bg-success-500" : "bg-slate-400"
                      }`}
                    />
                  </div>

                  {/* Message body preview */}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-ink-900 text-sm truncate">
                        {session.name}
                      </span>
                      <span className="text-[10px] text-ink-400 font-medium">
                        {formatTime(session.lastMessageAt || "")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p
                        className={`text-xs truncate max-w-[170px] ${hasUnread ? "font-bold text-ink-900" : "text-ink-450"}`}
                      >
                        {session.lastMessage || "Belum ada pesan."}
                      </p>
                      {hasUnread && (
                        <span className="h-5 min-w-[20px] rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {/* User role indicator */}
                    <span
                      className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded border mt-1.5 ${
                        session.role === "KLIEN"
                          ? "bg-info-50 border-info-100 text-info-700"
                          : "bg-success-50 border-success-100 text-success-700"
                      }`}
                    >
                      {session.role === "KLIEN" ? "Klien" : "Mahasiswa"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-ink-400 font-medium">
              Tidak ada sesi chat aktif.
            </div>
          )}
        </div>
      </div>

      {activeSessionId && (
         <ChatRoom
          key={activeSessionId}
          activeSessionId={activeSessionId}
          activeSession={activeSession}
          onEndSession={() => setActiveSessionId(null)}
        />
      )}
    </div>
  );
}
