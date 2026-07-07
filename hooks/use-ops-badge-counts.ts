"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const schedule =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 150);

    const id = schedule(() => setEnabled(true));

    return () => {
      if (typeof requestIdleCallback === "function" && typeof id === "number") {
        cancelIdleCallback(id);
      } else {
        clearTimeout(id as number);
      }
    };
  }, []);

  const { data: moderationRes } = useQuery({
    queryKey: ["sidebarModerationCount"],
    enabled,
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
    enabled,
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
    enabled,
    queryFn: () => chatApi.getUnreadCount().catch(() => ({ unreadCount: 0 })),
    refetchInterval: visibilityAwareInterval(
      CHAT_BADGE_POLL_INTERVAL_MS,
      isDocumentVisible,
    ),
    refetchOnWindowFocus: true,
  });

  const { data: transactionsRes } = useQuery({
    queryKey: ["sidebarTransactionsCount"],
    enabled,
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
