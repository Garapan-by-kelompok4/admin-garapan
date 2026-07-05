"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { ChartPeriodToggle } from "@/components/charts/chart-period-toggle";
import {
  CHART_AXIS_STROKE,
  CHART_BRAND_STROKE,
  chartTooltipStyle,
  TRANSACTION_AREA_GRADIENT_ID,
} from "@/components/charts/chart-tokens";
import { getTransactionChartSummary } from "@/components/charts/transaction-chart-summary";
import type { ChartPeriod } from "@/components/charts/types";
import type { AnalyticsResponse } from "@/lib/api/dashboard";
import { formatCurrency } from "@/lib/utils";

export type { ChartPeriod } from "@/components/charts/types";

interface TransactionAreaChartProps {
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  analytics?: AnalyticsResponse;
  isLoading: boolean;
}

export function TransactionAreaChart({
  period,
  onPeriodChange,
  analytics,
  isLoading,
}: TransactionAreaChartProps) {
  const summary = getTransactionChartSummary(analytics);

  return (
    <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div>
          <h3 className="font-heading font-bold text-sm text-ink-900">
            Nilai Transaksi Harian
          </h3>
          <p className="text-[11px] text-ink-400 font-medium mt-0.5">
            Perkembangan total volume pembayaran yang diproses.
          </p>
        </div>

        <ChartPeriodToggle period={period} onPeriodChange={onPeriodChange} />
      </div>

      <div className="grid grid-cols-3 gap-4 py-1 select-none">
        {summary.map((agg) => (
          <div
            key={agg.label}
            className="border-r border-border last:border-r-0"
          >
            <div className="text-[11px] text-ink-400 font-semibold">
              {agg.label}
            </div>
            <div className="text-lg font-extrabold text-ink-900 mt-1 font-heading">
              {agg.val}
            </div>
          </div>
        ))}
      </div>

      <div className="h-[230px] w-full pt-2 select-none">
        {isLoading ? (
          <div className="h-full w-full bg-surface-2 animate-pulse rounded-lg flex items-center justify-center text-xs text-ink-400">
            Memuat data chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={analytics?.ordersLine || []}
              margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={TRANSACTION_AREA_GRADIENT_ID}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={CHART_BRAND_STROKE}
                    stopOpacity={0.16}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_BRAND_STROKE}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke={CHART_AXIS_STROKE}
                fontSize={10}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke={CHART_AXIS_STROKE}
                fontSize={10}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Rp ${val / 1000000}M`}
                dx={-5}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Nilai Transaksi",
                ]}
                contentStyle={chartTooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_BRAND_STROKE}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${TRANSACTION_AREA_GRADIENT_ID})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
