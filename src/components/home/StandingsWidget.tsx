"use client";

import { ChevronRight } from "lucide-react";
import { TeamBadge } from "@/components/TeamBadge";
import type { Standing } from "@/hooks/useLeagueData";

interface Props {
  standings: Standing[];
  onViewStandings: () => void;
}

export function StandingsWidget({ standings, onViewStandings }: Props) {
  const top = standings.slice(0, 8);

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-bright">
          Standings
        </h3>
        <button
          onClick={onViewStandings}
          className="text-accent text-xs hover:text-text-bright transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          Full <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      {top.length === 0 ? (
        <div className="p-4">
          <p className="text-text-muted text-xs text-center py-4">
            Standings will appear once the season begins.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {top.map((s, i) => (
            <div key={s.id} className="px-4 py-2 flex items-center gap-3 hover:bg-bg3/50 transition-colors">
              <span className="text-text-dim text-xs font-mono w-4 text-right">{i + 1}</span>
              <TeamBadge team={s.teams} size={22} />
              <span className="text-text-bright text-xs font-medium flex-1 truncate">
                {s.teams?.abbreviation || s.teams?.name || "?"}
              </span>
              <span className="text-green text-xs font-mono">{s.wins}W</span>
              <span className="text-red text-xs font-mono">{s.losses}L</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
