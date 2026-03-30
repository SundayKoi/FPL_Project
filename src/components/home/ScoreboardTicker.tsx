"use client";

import { TeamBadge } from "@/components/TeamBadge";
import type { Match } from "@/hooks/useLeagueData";

interface Props {
  matches: Match[];
  isMobile: boolean;
}

export function ScoreboardTicker({ matches, isMobile }: Props) {
  const recent = matches
    .filter(m => m.status === "completed" || m.status === "live")
    .slice(0, 8);

  if (recent.length === 0) return null;

  return (
    <div className="bg-bg3 border-b border-border overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-12">
        {recent.map(m => {
          const isLive = m.status === "live";
          return (
            <div key={m.id} className="flex items-center gap-2 shrink-0 text-xs">
              {isLive && <span className="w-2 h-2 rounded-full bg-red animate-pulse" />}
              <TeamBadge team={m.team_blue} size={20} />
              <span className={`font-mono font-medium ${m.winner_team_id === m.team_blue_id ? "text-text-bright" : "text-text-muted"}`}>
                {m.score_blue ?? 0}
              </span>
              <span className="text-text-dim">-</span>
              <span className={`font-mono font-medium ${m.winner_team_id === m.team_red_id ? "text-text-bright" : "text-text-muted"}`}>
                {m.score_red ?? 0}
              </span>
              <TeamBadge team={m.team_red} size={20} />
              {!isMobile && (
                <span className="text-text-dim ml-1">
                  {isLive ? "LIVE" : (m.team_blue?.abbreviation || "?") + " vs " + (m.team_red?.abbreviation || "?")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
