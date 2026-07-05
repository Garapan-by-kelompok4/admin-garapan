"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import type { AnalyticsResponse } from "@/lib/api/dashboard";

const donutColors = ["#2047C9", "#4A68E0", "#7E95F0", "#B6C3F9", "#DCE4FD"];

interface CategoryDonutChartProps {
  analytics?: AnalyticsResponse;
  isLoading: boolean;
}

export function CategoryDonutChart({
  analytics,
  isLoading,
}: CategoryDonutChartProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1 flex flex-col justify-between">
      <div className="border-b border-border pb-3 flex-shrink-0">
        <h3 className="font-heading font-bold text-sm text-ink-900">
          Kategori Jasa Teraktif
        </h3>
        <p className="text-[11px] text-ink-400 font-medium mt-0.5">
          Distribusi penawaran jasa oleh mahasiswa.
        </p>
      </div>

      <div className="flex-1 flex flex-row items-center justify-between gap-4 py-2 min-h-[170px] select-none">
        {isLoading ? (
          <div className="h-[150px] w-full bg-surface-2 animate-pulse rounded-full" />
        ) : (
          <>
            <div className="relative w-[150px] h-[150px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.categoriesDonut || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(analytics?.categoriesDonut || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={donutColors[index % donutColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[20px] font-extrabold text-ink-900 leading-none tracking-tight font-heading">
                  {analytics?.categoriesDonut?.reduce(
                    (s, c) => s + c.value,
                    0,
                  ) ?? "-"}
                </span>
                <span className="text-[10px] text-ink-400 font-semibold uppercase mt-0.5">
                  total jasa
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 max-w-[130px]">
              {(analytics?.categoriesDonut || []).map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                      style={{
                        backgroundColor:
                          donutColors[index % donutColors.length],
                      }}
                    />
                    <span className="text-ink-600 font-semibold truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-ink-400 pl-1">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
