import { AlertTriangle, CheckCircle, Clock, Flag } from "lucide-react";

import {
  PageSummaryStatCards,
  type PageSummaryStatCard,
} from "@/components/ui/page-summary-stat-cards";

interface DisputesSummaryCardsProps {
  openCount: number;
  processingCount: number;
  totalCount: number;
  resolvedCount: number;
}

export function DisputesSummaryCards({
  openCount,
  processingCount,
  totalCount,
  resolvedCount,
}: DisputesSummaryCardsProps) {
  const cards: PageSummaryStatCard[] = [
    {
      label: "Laporan Terbuka",
      value: openCount,
      icon: Flag,
      iconClassName: "bg-danger-50 text-danger-500 border-danger-100",
    },
    {
      label: "Sedang Diproses",
      value: processingCount,
      icon: Clock,
      iconClassName: "bg-warn-50 text-warn-500 border-warn-100",
    },
    {
      label: "Total Laporan",
      value: totalCount,
      icon: CheckCircle,
      iconClassName: "bg-success-50 text-success-500 border-success-100",
    },
    {
      label: "Selesai Diselesaikan",
      value: resolvedCount,
      icon: AlertTriangle,
      iconClassName: "bg-brand-50 text-brand-500 border-brand-100",
    },
  ];

  return <PageSummaryStatCards cards={cards} />;
}
