"use client";

import { Home, Trophy, BarChart3, Users, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "./Navbar";

const tabs: { label: Tab; icon: typeof Home }[] = [
  { label: "Home", icon: Home },
  { label: "Scores", icon: Trophy },
  { label: "Standings", icon: BarChart3 },
  { label: "Stats", icon: BarChart3 },
  { label: "Teams", icon: Users },
  { label: "Draft Board", icon: FileEdit },
];

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function MobileBottomBar({ activeTab, onTabChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-bg2 border-t border-border">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onTabChange(label)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors cursor-pointer",
              activeTab === label ? "text-accent" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[9px] font-heading font-semibold uppercase tracking-wider leading-none">
              {label === "Draft Board" ? "Draft" : label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
