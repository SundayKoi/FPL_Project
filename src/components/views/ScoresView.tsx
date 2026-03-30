"use client";

import { TeamBadge } from "@/components/TeamBadge";
import { formatDate } from "@/lib/utils";
import type { Match } from "@/hooks/useLeagueData";

interface Props {
  matches: Match[];
  isMobile: boolean;
}

export function ScoresView({ matches, isMobile }: Props) {
  const completed = matches.filter(m => m.status === "completed");

  if (completed.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-text-muted text-sm">No completed matches yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-display text-3xl text-text-bright mb-4">Scores</h2>
      {completed.map(m => (
        <div key={m.id} className="card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            {!isMobile && <span className={`text-sm font-medium truncate ${m.winner_team_id === m.team_blue_id ? "text-text-bright" : "text-text-muted"}`}>{m.team_blue?.name}</span>}
            {isMobile && <span className={`text-xs font-medium ${m.winner_team_id === m.team_blue_id ? "text-text-bright" : "text-text-muted"}`}>{m.team_blue?.abbreviation}</span>}
            <TeamBadge team={m.team_blue} size={28} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`font-mono text-lg font-bold ${m.winner_team_id === m.team_blue_id ? "text-text-bright" : "text-text-muted"}`}>{m.score_blue ?? 0}</span>
            <span className="text-text-dim text-xs">-</span>
            <span className={`font-mono text-lg font-bold ${m.winner_team_id === m.team_red_id ? "text-text-bright" : "text-text-muted"}`}>{m.score_red ?? 0}</span>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TeamBadge team={m.team_red} size={28} />
            {!isMobile && <span className={`text-sm font-medium truncate ${m.winner_team_id === m.team_red_id ? "text-text-bright" : "text-text-muted"}`}>{m.team_red?.name}</span>}
            {isMobile && <span className={`text-xs font-medium ${m.winner_team_id === m.team_red_id ? "text-text-bright" : "text-text-muted"}`}>{m.team_red?.abbreviation}</span>}
          </div>
          <span className="text-text-dim text-[10px] shrink-0 ml-2">{formatDate(m.completed_at || m.scheduled_at)}</span>
        </div>
      ))}
    </div>
  );
}
