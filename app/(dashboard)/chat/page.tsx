"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/chat";
import { ChatRoom } from "@/components/chat/chat-room";
import {
  ChatSessionList,
  RoleFilter,
} from "@/components/chat/chat-session-list";

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [showSessionList] = useState(true);

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions(),
    refetchInterval: 5000,
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

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
      <ChatSessionList
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
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
