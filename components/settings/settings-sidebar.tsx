"use client";

import { User, Lock, Database, Activity, LucideIcon } from "lucide-react";

export type SettingsTabId = "profile" | "security" | "master" | "audit";

const sidebarItems: {
  id: SettingsTabId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "profile", label: "Informasi Profil", icon: User },
  { id: "security", label: "Keamanan & Akses", icon: Lock },
  { id: "master", label: "Master Data Kompetensi", icon: Database },
  { id: "audit", label: "Log Aktivitas", icon: Activity },
];

export interface SettingsSidebarProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <div className="w-full md:w-[240px] bg-white border border-border rounded-xl p-2.5 flex-shrink-0 shadow-sh-1">
      <nav className="flex flex-col gap-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-brand-50 text-brand-600 font-extrabold"
                  : "text-ink-700 hover:bg-surface-3 hover:text-ink-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-brand-500" : "text-ink-400"}`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
