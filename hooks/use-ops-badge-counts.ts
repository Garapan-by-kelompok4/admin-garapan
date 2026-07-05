"use client";

import { useQuery } from "@tanstack/react-query";

import { chatApi } from "@/lib/api/chat";
import { contentApi } from "@/lib/api/content";
import { disputesApi } from "@/lib/api/disputes";
import { ordersApi } from "@/lib/api/orders";

export interface OpsBadgeCounts {
  moderation: number;
  disputes: number;
  chat: number;
  transactions: number;
}

export function useOpsBadgeCounts(): OpsBadgeCounts {
  const { data: moderationRes } = useQuery({
    queryKey: ["sidebarModerationCount"],
    queryFn: () =>
      contentApi
        .list({ page: 1, limit: 1 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 1 })),
    refetchInterval: 30_000,
  });

  const { data: disputesRes } = useQuery({
    queryKey: ["sidebarDisputesCount"],
    queryFn: () =>
      disputesApi
        .list({ page: 1, limit: 1 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 1 })),
    refetchInterval: 30_000,
  });

  const { data: chatSessions = [] } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions().catch(() => []),
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const { data: transactionsRes } = useQuery({
    queryKey: ["sidebarTransactionsCount"],
    queryFn: () =>
      ordersApi
        .list({ page: 1, limit: 1 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 1 })),
    refetchInterval: 60_000,
  });

  const unreadChatCount = chatSessions.reduce(
    (acc, session) => acc + (session.unreadCount || 0),
    0,
  );

  return {
    moderation: moderationRes?.total ?? 0,
    disputes: disputesRes?.total ?? 0,
    chat: unreadChatCount,
    transactions: transactionsRes?.total ?? 0,
  };
}
