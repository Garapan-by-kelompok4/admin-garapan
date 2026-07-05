"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import type { AnalyticsResponse } from "@/lib/api/dashboard";
import { formatCurrency, formatNumber } from "@/lib/utils";

export type ChartPeriod = "7H" | "30H" | "90H" | "1T";

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

        <div className="flex bg-surface-3 p-0.5 rounded-lg border border-border/40 select-none">
          {(["7H", "30H", "90H", "1T"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onPeriodChange(t)}
              className={`px-2 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                period === t
                  ? "bg-white text-ink-900 shadow-sm font-extrabold"
                  : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-1 select-none">
        {[
          {
            label: "Total Pesanan",
            val: analytics?.timeSeries
              ? formatNumber(
                  analytics.timeSeries.reduce((s, p) => s + p.orderCount, 0),
                )
              : "-",
          },
          {
            label: "Nilai Transaksi",
            val: analytics?.timeSeries
              ? formatCurrency(
                  analytics.timeSeries.reduce((s, p) => s + p.revenue, 0),
                )
              : "-",
          },
          {
            label: "Rata-rata Harian",
            val: analytics?.timeSeries?.length
              ? formatCurrency(
                  Math.round(
                    analytics.timeSeries.reduce((s, p) => s + p.revenue, 0) /
                      analytics.timeSeries.length,
                  ),
                )
              : "-",
          },
        ].map((agg, idx) => (
          <div key={idx} className="border-r border-border last:border-r-0">
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
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2047C9" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#2047C9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#94A3B8"
                fontSize={10}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94A3B8"
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
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E9F0",
                  fontSize: "12px",
                  fontFamily: "Inter",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2047C9"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
