"use client";

import { useQuery } from "@tanstack/react-query";

import { useDocumentVisible } from "@/hooks/use-document-visible";
import { chatApi } from "@/lib/api/chat";
import { contentApi } from "@/lib/api/content";
import { disputesApi } from "@/lib/api/disputes";
import { ordersApi } from "@/lib/api/orders";
import {
  CHAT_POLL_INTERVAL_MS,
  OPS_BADGE_POLL_INTERVAL_MS,
  TRANSACTIONS_BADGE_POLL_INTERVAL_MS,
  visibilityAwareInterval,
} from "@/lib/query/polling";

export interface OpsBadgeCounts {
  moderation: number;
  disputes: number;
  chat: number;
  transactions: number;
}

export function useOpsBadgeCounts(): OpsBadgeCounts {
  const isDocumentVisible = useDocumentVisible();

  const { data: moderationRes } = useQuery({
    queryKey: ["sidebarModerationCount"],
    queryFn: () =>
      contentApi
        .list({ page: 1, limit: 1 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 1 })),
    refetchInterval: visibilityAwareInterval(
      OPS_BADGE_POLL_INTERVAL_MS,
      isDocumentVisible,
    ),
  });

  const { data: disputesRes } = useQuery({
    queryKey: ["sidebarDisputesCount"],
    queryFn: () =>
      disputesApi
        .list({ page: 1, limit: 1 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 1 })),
    refetchInterval: visibilityAwareInterval(
      OPS_BADGE_POLL_INTERVAL_MS,
      isDocumentVisible,
    ),
  });

  const { data: chatSessions = [] } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => chatApi.listSessions().catch(() => []),
    refetchInterval: CHAT_POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const { data: transactionsRes } = useQuery({
    queryKey: ["sidebarTransactionsCount"],
    queryFn: () =>
      ordersApi
        .list({ page: 1, limit: 1 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 1 })),
    refetchInterval: visibilityAwareInterval(
      TRANSACTIONS_BADGE_POLL_INTERVAL_MS,
      isDocumentVisible,
    ),
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
