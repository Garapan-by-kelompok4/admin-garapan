"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-9 w-9 rounded-lg bg-surface-3" />
              <div className="h-4 w-12 bg-surface-3 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-surface-3 rounded w-1/2" />
              <div className="h-7 bg-surface-3 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div className="space-y-1.5 w-1/3">
              <div className="h-4 bg-surface-3 rounded" />
              <div className="h-2.5 bg-surface-3 rounded w-3/4" />
            </div>
            <div className="h-7 bg-surface-3 rounded w-24" />
          </div>
          <div className="h-[230px] bg-surface-2 rounded-lg" />
        </div>

        <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="border-b border-border pb-3 space-y-1.5">
            <div className="h-4 bg-surface-3 rounded w-1/2" />
            <div className="h-2.5 bg-surface-3 rounded w-3/4" />
          </div>
          <div className="h-[150px] bg-surface-2 rounded-full mx-auto w-[150px]" />
        </div>
      </div>

      {/* Bottom Table Skeleton */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-2">
          <div className="h-4 bg-surface-3 rounded w-1/4" />
          <div className="h-7 bg-surface-3 rounded w-20" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-10 bg-surface-2 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
