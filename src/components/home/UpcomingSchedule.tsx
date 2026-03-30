"use client";

import { Calendar } from "lucide-react";
import { TeamBadge } from "@/components/TeamBadge";
import { fmtTime } from "@/lib/utils";
import type { Match } from "@/hooks/useLeagueData";

interface Props {
  matches: Match[];
}

export function UpcomingSchedule({ matches }: Props) {
  const upcoming = matches
    .filter(m => m.status === "scheduled")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Calendar className="h-4 w-4 text-accent" />
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-bright">
          Upcoming
        </h3>
      </div>
      {upcoming.length === 0 ? (
        <div className="p-4">
          <p className="text-text-muted text-xs text-center py-4">
            No upcoming matches scheduled.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {upcoming.map(m => (
            <div key={m.id} className="px-4 py-2.5 flex items-center gap-2">
              <TeamBadge team={m.team_blue} size={20} />
              <span className="text-text-bright text-xs font-medium truncate">
                {m.team_blue?.abbreviation || "?"}
              </span>
              <span className="text-text-dim text-[10px] mx-1">vs</span>
              <span className="text-text-bright text-xs font-medium truncate">
                {m.team_red?.abbreviation || "?"}
              </span>
              <TeamBadge team={m.team_red} size={20} />
              <span className="text-text-muted text-[10px] ml-auto shrink-0">
                {fmtTime(m.scheduled_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
