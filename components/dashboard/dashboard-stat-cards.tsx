import {
  Users,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react";

import { SPARKLINE_COLORS } from "@/components/charts/chart-tokens";
import { StatSparkline } from "@/components/charts/stat-sparkline";
import type { DashboardStats } from "@/lib/api/dashboard";
import { formatCurrency, formatNumber } from "@/lib/utils";

function formatDelta(val: number | null | undefined) {
  if (val == null) return null;
  const abs = Math.abs(val);
  const isPositive = val >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
        isPositive
          ? "bg-success-50 text-success-700"
          : "bg-danger-50 text-danger-700"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {abs}%
    </span>
  );
}

interface DashboardStatCardsProps {
  stats?: DashboardStats;
}

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  const cards = [
    {
      label: "Total User Aktif",
      val:
        stats?.activeUsers != null
          ? formatNumber(stats.activeUsers)
          : "-",
      delta: stats?.activeUsersDelta ?? null,
      spark: stats?.activeUsersSparkline ?? [],
      color: SPARKLINE_COLORS.brand,
      icon: Users,
      iconBg: "bg-brand-50 text-brand-500 border-brand-100",
    },
    {
      label: "Transaksi Bulan Ini",
      val:
        stats?.transactionsCount != null
          ? formatNumber(stats.transactionsCount)
          : "-",
      delta: stats?.transactionsDelta ?? null,
      spark: stats?.transactionsSparkline ?? [],
      color: SPARKLINE_COLORS.success,
      icon: CheckCircle,
      iconBg: "bg-success-50 text-success-500 border-success-100",
    },
    {
      label: "Total Pendapatan Selesai",
      val: stats?.revenue ? formatCurrency(stats.revenue) : "-",
      delta: stats?.revenueDelta ?? null,
      spark: stats?.revenueSparkline ?? [],
      color: SPARKLINE_COLORS.warn,
      icon: Wallet,
      iconBg: "bg-warn-50 text-warn-500 border-warn-100",
    },
    {
      label: "Laporan Pending",
      val: stats?.pendingReports ?? "-",
      delta: stats?.pendingReportsDelta ?? null,
      spark: stats?.pendingReportsSparkline ?? [],
      color: SPARKLINE_COLORS.danger,
      icon: AlertTriangle,
      iconBg: "bg-danger-50 text-danger-500 border-danger-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item) => (
        <div
          key={item.label}
          className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1 hover:shadow-sh-2 transition-all overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center border ${item.iconBg} flex-shrink-0`}
            >
              <item.icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              {formatDelta(item.delta)}
              {item.delta != null ? (
                <span className="text-[10px] text-ink-400 font-medium">
                  vs bln lalu
                </span>
              ) : null}
            </div>
          </div>
          <div>
            <div className="text-[12.5px] text-ink-450 font-semibold">
              {item.label}
            </div>
            <div className="flex items-end justify-between gap-2 mt-1.5 min-w-0">
              <div className="min-w-0 flex-1 text-xl lg:text-2xl font-extrabold text-ink-900 leading-none tracking-tight font-heading">
                {item.val}
              </div>
              <div className="h-7 w-[68px] shrink-0 overflow-hidden">
                <StatSparkline points={item.spark} color={item.color} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
