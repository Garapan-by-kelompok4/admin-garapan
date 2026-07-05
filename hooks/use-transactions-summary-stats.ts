"use client";

import { useQuery } from "@tanstack/react-query";

import { EscrowStatus, ordersApi, OrderTransaction } from "@/lib/api/orders";
import { fetchAllPaginated } from "@/lib/query/pagination";

export interface TransactionsSummaryStats {
  totalVolume: number;
  heldVolume: number;
  releasedVolume: number;
  refundVolume: number;
}

function sumByEscrow(
  orders: OrderTransaction[],
  status: EscrowStatus,
): number {
  return orders
    .filter((order) => order.escrowStatus === status)
    .reduce((sum, order) => sum + (order.amount ?? 0), 0);
}

async function fetchTransactionsSummaryStats(): Promise<TransactionsSummaryStats> {
  const orders = await fetchAllPaginated((page, limit) =>
    ordersApi.list({ page, limit }),
  );

  return {
    totalVolume: orders.reduce((sum, order) => sum + (order.amount ?? 0), 0),
    heldVolume: sumByEscrow(orders, "Ditahan"),
    releasedVolume: sumByEscrow(orders, "Dicairkan"),
    refundVolume: sumByEscrow(orders, "Refund"),
  };
}

export function useTransactionsSummaryStats() {
  return useQuery({
    queryKey: ["transactions", "summary-stats"],
    queryFn: fetchTransactionsSummaryStats,
    staleTime: 60_000,
  });
}
