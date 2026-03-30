"use client";

import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const TABS = ["Home", "Scores", "Schedule", "Standings", "Stats", "Teams", "Sign Up"] as const;
export type Tab = (typeof TABS)[number];

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  splitName?: string;
}

export function Navbar({ activeTab, onTabChange, splitName }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Season bar */}
      <div className="bg-bg3 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
          <span className="font-heading text-sm font-semibold tracking-wider uppercase text-text-bright">
            ⚔️ {splitName || "FPL Season 1"}
          </span>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-text-bright transition-colors uppercase tracking-wider"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-bg2 border-b-2 border-accent">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-12">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-bright transition-colors cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <button className="flex items-center gap-2 mr-6 cursor-pointer" onClick={() => onTabChange("Home")}>
            <span className="font-display text-2xl tracking-wide text-text-bright">FPL</span>
          </button>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-0 h-full">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={cn(
                  "h-full px-4 text-sm font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-[2px]",
                  activeTab === tab
                    ? "text-text-bright border-b-accent bg-bg-input"
                    : "text-text-secondary hover:text-text-bright border-b-transparent"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile dropdown */}
        <div className={cn("md:hidden overflow-hidden transition-all duration-300 bg-bg2 border-t border-border", menuOpen ? "max-h-96" : "max-h-0")}>
          <div className="px-4 py-2 space-y-0.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { onTabChange(tab); setMenuOpen(false); }}
                className={cn(
                  "block w-full text-left px-3 py-2.5 rounded text-sm font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer",
                  activeTab === tab ? "text-accent bg-bg-input" : "text-text-secondary hover:text-text-bright hover:bg-bg3"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
