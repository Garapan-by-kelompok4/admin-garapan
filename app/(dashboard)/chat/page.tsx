"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/chat";
import { ChatRoom } from "@/components/chat/chat-room";
import {
  ChatSessionList,
  RoleFilter,
} from "@/components/chat/chat-session-list";
import { useDocumentVisible } from "@/hooks/use-document-visible";
import {
  CHAT_POLL_INTERVAL_MS,
  visibilityAwareInterval,
} from "@/lib/query/polling";

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showSessionList] = useState(true);
  const isDocumentVisible = useDocumentVisible();

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions(),
    refetchInterval: visibilityAwareInterval(
      CHAT_POLL_INTERVAL_MS,
      isDocumentVisible,
    ),
    refetchOnWindowFocus: true,
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const filteredSessions = useMemo(() => {
    const query = search.toLowerCase();
    return sessions.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (unreadOnly && s.unreadCount <= 0) return false;
      if (roleFilter === "KLIEN") return s.role === "KLIEN";
      if (roleFilter === "MAHASISWA") return s.role === "MAHASISWA";

      return true;
    });
  }, [sessions, search, roleFilter, unreadOnly]);

  return (
    <div className="flex h-[calc(100vh-140px)] border border-border rounded-xl bg-white shadow-sh-2 overflow-hidden select-none">
      <ChatSessionList
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        unreadOnly={unreadOnly}
        onUnreadOnlyChange={setUnreadOnly}
        showSessionList={showSessionList}
        filteredSessions={filteredSessions}
        isLoadingSessions={isLoadingSessions}
      />

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
