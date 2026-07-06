import { DollarSign, TrendingUp, Undo2, Wallet } from "lucide-react";

import {
  PageSummaryStatCards,
  type PageSummaryStatCard,
} from "@/components/ui/page-summary-stat-cards";
import { TransactionsSummaryStats } from "@/hooks/use-transactions-summary-stats";
import { formatCurrency } from "@/lib/utils";

interface TransactionsSummaryCardsProps {
  stats: TransactionsSummaryStats | undefined;
}

export function TransactionsSummaryCards({
  stats,
}: TransactionsSummaryCardsProps) {
  const cards: PageSummaryStatCard[] = [
    {
      label: "Volume Transaksi (GTV)",
      value: formatCurrency(stats?.totalVolume ?? 0),
      icon: TrendingUp,
      iconClassName: "bg-success-50 text-success-500 border-success-100",
    },
    {
      label: "Escrow Ditahan",
      value: formatCurrency(stats?.heldVolume ?? 0),
      icon: Wallet,
      iconClassName: "bg-warn-50 text-warn-500 border-warn-100",
    },
    {
      label: "Dana Dicairkan",
      value: formatCurrency(stats?.releasedVolume ?? 0),
      icon: DollarSign,
      iconClassName: "bg-brand-50 text-brand-500 border-brand-100",
    },
    {
      label: "Total Pengembalian (Refund)",
      value: formatCurrency(stats?.refundVolume ?? 0),
      icon: Undo2,
      iconClassName: "bg-danger-50 text-danger-500 border-danger-100",
    },
  ];

  return <PageSummaryStatCards cards={cards} />;
}
