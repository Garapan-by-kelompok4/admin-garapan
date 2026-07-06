import { AlertTriangle, CheckCircle, Flag, Trash2 } from "lucide-react";

import {
  PageSummaryStatCards,
  type PageSummaryStatCard,
} from "@/components/ui/page-summary-stat-cards";
import type { ModerationSummaryStats } from "@/hooks/use-moderation-summary-stats";

interface ModerationSummaryCardsProps {
  stats: ModerationSummaryStats | undefined;
}

export function ModerationSummaryCards({ stats }: ModerationSummaryCardsProps) {
  const cards: PageSummaryStatCard[] = [
    {
      label: "Perlu Ditinjau",
      value: stats?.pendingListings ?? 0,
      icon: AlertTriangle,
      iconClassName: "bg-warn-50 text-warn-500 border-warn-100",
    },
    {
      label: "Laporan Pending",
      value: stats?.pendingReports ?? 0,
      icon: Flag,
      iconClassName: "bg-brand-50 text-brand-500 border-brand-100",
    },
    {
      label: "Ditandai Aman",
      value: stats?.dismissedReports ?? 0,
      icon: CheckCircle,
      iconClassName: "bg-success-50 text-success-500 border-success-100",
    },
    {
      label: "Dihapus / Ditindak",
      value: stats?.actionTakenReports ?? 0,
      icon: Trash2,
      iconClassName: "bg-danger-50 text-danger-500 border-danger-100",
    },
  ];

  return <PageSummaryStatCards cards={cards} />;
}
