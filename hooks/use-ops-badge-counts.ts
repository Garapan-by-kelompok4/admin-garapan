"use client";

import { useQuery } from "@tanstack/react-query";

import { useDocumentVisible } from "@/hooks/use-document-visible";
import { chatApi } from "@/lib/api/chat";
import { contentApi } from "@/lib/api/content";
import { disputesApi } from "@/lib/api/disputes";
import { ordersApi } from "@/lib/api/orders";
import {
  CHAT_BADGE_POLL_INTERVAL_MS,
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
        .stats()
        .then((stats) => ({
          data: [],
          total: stats.pendingListings,
          page: 1,
          limit: 1,
        }))
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

  const { data: chatUnreadRes } = useQuery({
    queryKey: ["chatUnreadCount"],
    queryFn: () => chatApi.getUnreadCount().catch(() => ({ unreadCount: 0 })),
    refetchInterval: visibilityAwareInterval(
      CHAT_BADGE_POLL_INTERVAL_MS,
      isDocumentVisible,
    ),
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

  return {
    moderation: moderationRes?.total ?? 0,
    disputes: disputesRes?.total ?? 0,
    chat: chatUnreadRes?.unreadCount ?? 0,
    transactions: transactionsRes?.total ?? 0,
  };
}
