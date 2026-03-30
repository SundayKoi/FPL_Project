"use client";

import { TeamBadge } from "@/components/TeamBadge";
import { fmtTime } from "@/lib/utils";
import type { Match } from "@/hooks/useLeagueData";

interface Props {
  matches: Match[];
  isMobile: boolean;
}

export function ScheduleView({ matches, isMobile }: Props) {
  const scheduled = matches
    .filter(m => m.status === "scheduled")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  if (scheduled.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-text-muted text-sm">No upcoming matches scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="font-display text-3xl text-text-bright mb-4">Schedule</h2>
      {scheduled.map(m => (
        <div key={m.id} className="card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className={`text-sm font-medium truncate text-text-bright ${isMobile ? "text-xs" : ""}`}>
              {isMobile ? m.team_blue?.abbreviation : m.team_blue?.name}
            </span>
            <TeamBadge team={m.team_blue} size={28} />
          </div>
          <span className="text-text-dim text-xs font-heading uppercase shrink-0">VS</span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TeamBadge team={m.team_red} size={28} />
            <span className={`text-sm font-medium truncate text-text-bright ${isMobile ? "text-xs" : ""}`}>
              {isMobile ? m.team_red?.abbreviation : m.team_red?.name}
            </span>
          </div>
          <span className="text-text-muted text-[10px] shrink-0 ml-2">{fmtTime(m.scheduled_at)}</span>
        </div>
      ))}
    </div>
  );
}
