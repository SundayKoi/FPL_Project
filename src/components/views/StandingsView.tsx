"use client";

import { useState } from "react";
import { TeamBadge } from "@/components/TeamBadge";
import { cn } from "@/lib/utils";
import type { Standing } from "@/hooks/useLeagueData";

interface Props {
  standings: Standing[];
  isMobile: boolean;
}

export function StandingsView({ standings, isMobile }: Props) {
  const divisions = [...new Set(standings.map(s => s.teams?.divisions?.name).filter(Boolean))] as string[];
  const [activeDivision, setActiveDivision] = useState<string | "all">("all");

  const filtered = activeDivision === "all"
    ? standings
    : standings.filter(s => s.teams?.divisions?.name === activeDivision);

  const sorted = [...filtered].sort((a, b) => {
    const winPctA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
    const winPctB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
    return winPctB - winPctA;
  });

  return (
    <div>
      <h2 className="font-display text-3xl text-text-bright mb-4">Standings</h2>

      {divisions.length > 1 && (
        <div className="flex gap-1 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveDivision("all")}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0",
              activeDivision === "all" ? "bg-accent text-white" : "bg-bg3 text-text-secondary hover:text-text-bright"
            )}
          >
            All
          </button>
          {divisions.map(d => (
            <button
              key={d}
              onClick={() => setActiveDivision(d)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0",
                activeDivision === d ? "bg-accent text-white" : "bg-bg3 text-text-secondary hover:text-text-bright"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-text-muted text-sm">No standings data available yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Team</th>
                <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">W</th>
                <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">L</th>
                <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Win%</th>
                {!isMobile && (
                  <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Streak</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((s, i) => {
                const total = s.wins + s.losses;
                const winPct = total > 0 ? Math.round((s.wins / total) * 100) : 0;
                return (
                  <tr key={s.id} className="hover:bg-bg3/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-text-dim">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TeamBadge team={s.teams} size={24} />
                        <span className="text-sm font-medium text-text-bright">
                          {isMobile ? s.teams?.abbreviation : s.teams?.name}
                        </span>
                        {!isMobile && s.teams?.divisions?.name && (
                          <span className="text-text-dim text-[10px]">({s.teams.divisions.name})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-mono text-green">{s.wins}</td>
                    <td className="px-4 py-3 text-center text-sm font-mono text-red">{s.losses}</td>
                    <td className="px-4 py-3 text-center text-sm font-mono text-text-bright">{winPct}%</td>
                    {!isMobile && (
                      <td className="px-4 py-3 text-center text-sm font-mono text-text-secondary">{s.streak || "-"}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
