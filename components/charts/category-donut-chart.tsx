"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { DONUT_COLORS } from "@/components/charts/chart-tokens";
import type { AnalyticsResponse } from "@/lib/api/dashboard";

interface CategoryDonutChartProps {
  analytics?: AnalyticsResponse;
  isLoading: boolean;
}

export function CategoryDonutChart({
  analytics,
  isLoading,
}: CategoryDonutChartProps) {
  const categories = analytics?.categoriesDonut || [];
  const totalServices = categories.reduce((sum, category) => sum + category.value, 0);

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

      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2 min-h-[170px] select-none sm:flex-row sm:gap-5">
        {isLoading ? (
          <div className="h-[150px] w-full bg-surface-2 animate-pulse rounded-full" />
        ) : (
          <>
            <div className="relative w-[150px] h-[150px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[20px] font-extrabold text-ink-900 leading-none tracking-tight font-heading">
                  {categories.length > 0 ? totalServices : "-"}
                </span>
                <span className="text-[10px] text-ink-400 font-semibold uppercase mt-0.5">
                  total jasa
                </span>
              </div>
            </div>

            <div className="w-full min-w-0 space-y-2 sm:flex-1">
              {categories.map((cat, index) => (
                <div
                  key={`${cat.name}-${index}`}
                  className="flex items-center gap-2 text-xs min-w-0"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor:
                        DONUT_COLORS[index % DONUT_COLORS.length],
                    }}
                  />
                  <span className="text-ink-600 font-semibold truncate min-w-0 flex-1">
                    {cat.name}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-ink-400 tabular-nums flex-shrink-0">
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
