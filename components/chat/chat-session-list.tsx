"use client";

import { useQueryClient } from "@tanstack/react-query";
import { chatApi, ChatSession } from "@/lib/api/chat";
import { avatarClass, initials } from "@/lib/avatar";
import { formatTime } from "@/lib/chat-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, X } from "lucide-react";

export type RoleFilter = "ALL" | "KLIEN" | "MAHASISWA";

export interface ChatSessionListProps {
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (filter: RoleFilter) => void;
  unreadOnly: boolean;
  onUnreadOnlyChange: (value: boolean) => void;
  showSessionList: boolean;
  filteredSessions: ChatSession[];
  isLoadingSessions: boolean;
}

export function ChatSessionList({
  activeSessionId,
  onSelectSession,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  unreadOnly,
  onUnreadOnlyChange,
  showSessionList,
  filteredSessions,
  isLoadingSessions,
}: ChatSessionListProps) {
  const queryClient = useQueryClient();
  const roleLabel =
    roleFilter === "KLIEN"
      ? "Klien"
      : roleFilter === "MAHASISWA"
        ? "Mahasiswa"
        : "Semua Role";

  const handleSessionClick = async (session: ChatSession) => {
    onSelectSession(session.id);

    queryClient.setQueryData<ChatSession[]>(["chatSessions"], (old) => {
      if (!old) return old;
      return old.map((s) =>
        s.id === session.id ? { ...s, unreadCount: 0, unread: 0 } : s,
      );
    });

    try {
      await chatApi.markAsRead(session.id);
    } catch (e) {
      console.warn(e);
    }

    queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
  };

  return (
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
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative flex">
          <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
          <input
            placeholder="Cari chat user..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-[36px] pl-9 pr-8 bg-surface-2 border border-border rounded-lg text-xs placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-2 p-0.5 text-ink-400 hover:text-ink-700 bg-transparent border-0 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
            <button
              type="button"
              onClick={() => onUnreadOnlyChange(false)}
              className={`h-7 rounded-md px-2.5 text-[10.5px] font-bold transition-all cursor-pointer ${
                !unreadOnly
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-ink-500 hover:text-ink-900"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => onUnreadOnlyChange(true)}
              className={`h-7 rounded-md px-2.5 text-[10.5px] font-bold transition-all cursor-pointer ${
                unreadOnly
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-ink-500 hover:text-ink-900"
              }`}
            >
              Belum Dibaca
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-8 min-w-0 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-[10.5px] font-bold text-ink-600 shadow-sm transition-colors hover:bg-surface-2 hover:text-ink-900"
              title="Filter role user"
            >
              <span className="truncate">{roleLabel}</span>
              <ChevronDown className="h-3 w-3 text-ink-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {(
                [
                  { id: "ALL", label: "Semua Role" },
                  { id: "KLIEN", label: "Klien" },
                  { id: "MAHASISWA", label: "Mahasiswa" },
                ] as const
              ).map((role) => (
                <DropdownMenuItem
                  key={role.id}
                  onClick={() => onRoleFilterChange(role.id)}
                  className={`cursor-pointer text-xs font-semibold ${
                    roleFilter === role.id ? "text-brand-600" : ""
                  }`}
                >
                  {role.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
                onClick={() => handleSessionClick(session)}
                className={`p-3.5 flex gap-3 cursor-pointer hover:bg-surface-2 transition-all relative ${
                  isActive
                    ? "bg-brand-50/70 border-l-[3px] border-brand-500 pl-[11px]"
                    : ""
                }`}
              >
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
  );
}
