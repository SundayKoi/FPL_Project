"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Users, Shield, ClipboardList, Calendar,
  FileCheck, Tv, Layers, Trophy,
} from "lucide-react";

import { TeamsTab } from "@/components/admin/TeamsTab";
import { PlayersTab } from "@/components/admin/PlayersTab";
import { RostersTab } from "@/components/admin/RostersTab";
import { ScheduleTab } from "@/components/admin/ScheduleTab";
import { ApplicationsTab } from "@/components/admin/ApplicationsTab";
import { TwitchTab } from "@/components/admin/TwitchTab";
import { DivisionsTab } from "@/components/admin/DivisionsTab";
import { SeasonsTab } from "@/components/admin/SeasonsTab";

const ADMIN_TABS = [
  { label: "Teams", icon: Shield },
  { label: "Players", icon: Users },
  { label: "Rosters", icon: ClipboardList },
  { label: "Schedule", icon: Calendar },
  { label: "Player Applications", icon: FileCheck },
  { label: "Twitch", icon: Tv },
  { label: "Divisions", icon: Layers },
  { label: "Seasons", icon: Trophy },
] as const;

type AdminTab = (typeof ADMIN_TABS)[number]["label"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("Teams");
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  const renderTab = () => {
    switch (activeTab) {
      case "Teams": return <TeamsTab key={refreshKey} onRefresh={refresh} />;
      case "Players": return <PlayersTab key={refreshKey} />;
      case "Rosters": return <RostersTab key={refreshKey} />;
      case "Schedule": return <ScheduleTab key={refreshKey} />;
      case "Player Applications": return <ApplicationsTab key={refreshKey} />;
      case "Twitch": return <TwitchTab key={refreshKey} />;
      case "Divisions": return <DivisionsTab key={refreshKey} onRefresh={refresh} />;
      case "Seasons": return <SeasonsTab key={refreshKey} />;
    }
  };

  return (
    <div>
      {/* Horizontal tab bar */}
      <div className="bg-bg2 border-b-2 border-accent overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {ADMIN_TABS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-3 text-xs font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-[2px] whitespace-nowrap",
                activeTab === label
                  ? "text-text-bright border-b-accent bg-bg-input"
                  : "text-text-secondary hover:text-text-bright border-b-transparent"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 py-6">{renderTab()}</div>
    </div>
  );
}
