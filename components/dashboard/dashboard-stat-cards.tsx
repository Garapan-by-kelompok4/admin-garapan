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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((item, index) => (
        <div
          key={item.label}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-white p-3 shadow-sh-1 transition-all hover:shadow-sh-2 sm:p-4 lg:min-h-[138px] lg:p-5"
        >
          <div className="flex items-start justify-between gap-1.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border lg:h-9 lg:w-9 ${item.iconBg}`}
            >
              <item.icon className="h-4 w-4 lg:h-4.5 lg:w-4.5" />
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              {formatDelta(item.delta)}
              {item.delta != null ? (
                <span className="text-[10px] font-medium text-ink-400">
                  vs bln lalu
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-2.5 lg:mt-4">
            <div className="text-[10.5px] font-semibold leading-snug text-ink-450 sm:text-[12.5px]">
              {item.label}
            </div>
            <div className="mt-1 font-heading text-base font-extrabold leading-tight tracking-tight text-ink-900 tabular-nums sm:mt-1.5 sm:text-xl lg:text-2xl">
              {item.val}
            </div>
            {item.delta != null ? (
              <div className="mt-1.5 sm:hidden">{formatDelta(item.delta)}</div>
            ) : null}
          </div>
          {item.spark.length >= 2 ? (
            <div className="mt-auto hidden pt-3 sm:block lg:pt-4">
              <StatSparkline
                points={item.spark}
                color={item.color}
                delayMs={index * 80}
                className="aspect-[100/32] w-full"
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
