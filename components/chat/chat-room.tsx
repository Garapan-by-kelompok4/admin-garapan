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
import { usersApi } from "@/lib/api/users";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDateLabel, quickReplies } from "@/lib/chat-utils";
import { formatDate } from "@/lib/utils";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentVisible } from "@/hooks/use-document-visible";
import {
  CHAT_POLL_INTERVAL_MS,
  visibilityAwareInterval,
} from "@/lib/query/polling";
import {
  Send,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

// One page of thread history. Page 1 is the newest batch; scrolling to the top
// of the log pulls older pages and prepends them (reverse infinite scroll).
export const MESSAGE_PAGE_SIZE = 20;

export interface ChatRoomProps {
  activeSessionId: string;
  activeSession: ChatSession | null;
  onEndSession: () => void;
  onBackToSessions?: () => void;
}

export function ChatRoom({
  activeSessionId,
  activeSession,
  onEndSession,
  onBackToSessions,
}: ChatRoomProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isDocumentVisible = useDocumentVisible();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
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
      await chatApi.markAsRead(activeSessionId);
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
      return page;
    },
    refetchInterval: visibilityAwareInterval(
      CHAT_POLL_INTERVAL_MS,
      isDocumentVisible,
    ),
    refetchOnWindowFocus: true,
  });

  const liveMessages = useMemo(() => livePage?.messages ?? [], [livePage?.messages]);
  const totalMessages = livePage?.total ?? 0;

  const { data: contactUser, isLoading: isLoadingContact } = useQuery({
    queryKey: ["chatContactUser", activeSessionId],
    queryFn: () => usersApi.getById(activeSessionId),
    enabled: showUserInfo && !!activeSessionId,
  });

  const banMutation = useMutation({
    mutationFn: () => usersApi.ban(activeSessionId),
    onSuccess: () => {
      toast.success("User berhasil diblokir");
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memblokir user");
    },
  });

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
  const visibleQuickReplies = quickReplies.slice(0, 2);
  const overflowQuickReplies = quickReplies.slice(2);

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

  const liveLength = livePage?.messages.length ?? 0;
  useEffect(() => {
    if (liveLength > 0 && liveLength !== liveMessagesLenRef.current) {
      const isInitialLoad = olderMessages.length === 0;
      scrollToBottom(isInitialLoad ? "auto" : "smooth");
    }
    liveMessagesLenRef.current = liveLength;
  }, [liveLength, olderMessages.length, scrollToBottom]);

  const sendMessageMutation = useMutation({
    mutationFn: ({ userId, message }: { userId: string; message: string }) =>
      chatApi.sendMessage(userId, message),
    onSuccess: (newMessage) => {
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
      setOptimisticMessages((prev) => [...prev, newMessage]);
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim pesan");
    },
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessageMutation.mutate({
      userId: activeSessionId,
      message: messageInput.trim(),
    });
  };

  const handleQuickReply = (text: string) => {
    setMessageInput(text);
  };

  const handleSaveNote = () => {
    localStorage.setItem(`chat_note_${activeSessionId}`, adminNote);
    toast.success("Catatan admin berhasil disimpan");
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-surface-2 min-w-0 relative">
        <div className="h-[60px] border-b border-border bg-white px-3 md:px-5 flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Kembali ke daftar chat"
              onClick={onBackToSessions}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-white text-ink-600 shadow-sm md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="flex min-w-0 items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
              title="Klik untuk detail profile user"
            >
              <div className="relative flex-shrink-0">
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
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-ink-900 text-sm leading-tight hover:underline">
                  {activeSession?.name}
                </h3>
                <div className="flex min-w-0 items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-ink-400 font-medium">
                    {activeSession?.isOnline ? "Online" : "Offline"}
                  </span>
                  <span className="text-ink-200 text-[10px] flex-shrink-0">•</span>
                  <span className="truncate text-[10px] text-ink-400 font-semibold uppercase">
                    ID: {activeSession?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCloseConfirm(true)}
              className="hidden px-3 py-1.5 border border-danger-200 bg-danger-50/50 hover:bg-danger-55 hover:text-danger-700 text-xs font-bold text-danger-600 rounded-lg transition-colors cursor-pointer sm:inline-flex"
            >
              Tutup Sesi
            </button>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 md:p-5"
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
                  <React.Fragment key={msg.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-0.5 rounded border border-border bg-white text-[10px] font-bold text-ink-400 shadow-sm">
                          {formatDateLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <ChatMessageBubble message={msg} isMe={!!isMe} />
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

        <div className="bg-white border-t border-border p-3 md:p-4 flex flex-col gap-3 flex-shrink-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 select-none">
            <span className="text-[10px] font-bold text-brand-600 self-center mr-1 flex items-center gap-1 flex-shrink-0">
              <Sparkles className="h-3 w-3" /> Balas cepat:
            </span>
            {visibleQuickReplies.map((r, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(r)}
                title={r}
                className="min-w-0 max-w-[360px] px-2.5 py-1 text-[11px] font-medium rounded-full border border-border bg-surface-2 hover:bg-surface-3 hover:text-ink-900 text-ink-600 transition-colors cursor-pointer"
              >
                <span className="block truncate">{r}</span>
              </button>
            ))}
            {overflowQuickReplies.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-[26px] flex-shrink-0 items-center gap-1 rounded-full border border-border bg-white px-2.5 text-[11px] font-bold text-ink-600 shadow-sm transition-colors hover:bg-surface-2 hover:text-ink-900">
                  Template lainnya
                  <ChevronDown className="h-3 w-3 text-ink-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[min(360px,calc(100vw-24px))]">
                  {overflowQuickReplies.map((reply, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      className="cursor-pointer text-xs font-medium leading-relaxed"
                    >
                      {reply}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 items-end"
          >
            <textarea
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

            <button
              type="submit"
              disabled={
                sendMessageMutation.isPending || !messageInput.trim()
              }
              className="h-[38px] px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <span>Kirim</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        <ConfirmDialog
          open={showCloseConfirm}
          onOpenChange={setShowCloseConfirm}
          title="Tutup Sesi Chat"
          description="Apakah Anda yakin ingin mengakhiri sesi bantuan live support chat ini? Tindakan ini akan menutup sesi obrolan aktif."
          confirmLabel="Ya, Akhiri Sesi"
          variant="destructive"
          onConfirm={() => {
            onEndSession();
            toast.success("Sesi bantuan ditutup");
          }}
        />
      </div>

      {showUserInfo && (
        <div className="hidden w-[280px] border-l border-border md:flex flex-col h-full bg-white flex-shrink-0 overflow-y-auto transition-all duration-300 animate-in slide-in-from-right duration-200">
          {activeSession && (
            <div className="p-5 space-y-6">
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

                <div className="flex justify-center gap-1.5 pt-2">
                  <button
                    onClick={() => setShowBanConfirm(true)}
                    disabled={banMutation.isPending || contactUser?.bannedAt != null}
                    className="px-4 py-1.5 border border-danger-200 bg-danger-50 text-[11px] font-bold text-danger-700 rounded-lg hover:bg-danger-55 transition-colors cursor-pointer shadow-sm w-full max-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactUser?.bannedAt ? "Diblokir" : "Blokir"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Info Kontak
                </h5>
                <div className="rounded-lg border border-border bg-surface-2/40 p-3.5 space-y-3">
                  {isLoadingContact ? (
                    <p className="text-xs text-ink-400">Memuat info kontak…</p>
                  ) : (
                    <>
                      <div className="flex gap-2.5 items-center text-xs">
                        <Mail className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
                        <span
                          className="font-medium text-ink-800 truncate"
                          title={contactUser?.email ?? activeSession.id}
                        >
                          {contactUser?.email ?? "—"}
                        </span>
                      </div>
                      <div className="flex gap-2.5 items-center text-xs">
                        <Phone className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
                        <span className="font-semibold text-ink-800">
                          {contactUser?.phone ?? "—"}
                        </span>
                      </div>
                      <div className="flex gap-2.5 items-center text-xs">
                        <Calendar className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
                        <span className="font-semibold text-ink-800">
                          {contactUser?.createdAt
                            ? formatDate(contactUser.createdAt)
                            : "—"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-baseline">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Catatan Internal
                  </h5>
                  <button
                    onClick={handleSaveNote}
                    className="text-[10px] text-brand-600 hover:text-brand-700 font-bold bg-transparent border-0 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
                <textarea
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

      <ConfirmDialog
        open={showBanConfirm}
        onOpenChange={setShowBanConfirm}
        title={`Blokir ${activeSession?.name ?? "user"}?`}
        description="User tidak akan bisa login atau menggunakan platform setelah diblokir. Anda dapat memulihkan akun dari halaman Users."
        confirmLabel="Blokir User"
        isLoading={banMutation.isPending}
        onConfirm={() => banMutation.mutate()}
      />
    </>
  );
}
