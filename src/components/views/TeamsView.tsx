"use client";

import { TeamBadge } from "@/components/TeamBadge";
import type { Team, Roster, Standing } from "@/hooks/useLeagueData";

interface Props {
  teams: Team[];
  rosters: Roster[];
  standings: Standing[];
  isMobile: boolean;
}

export function TeamsView({ teams, rosters, standings, isMobile }: Props) {
  if (teams.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-text-muted text-sm">No teams registered yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl text-text-bright mb-4">Teams</h2>
      <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
        {teams.map(team => {
          const teamRoster = rosters.filter(r => r.team_id === team.id && !r.left_at);
          const record = standings.find(s => s.team_id === team.id);

          return (
            <div key={team.id} className="card overflow-hidden">
              {/* Gradient header */}
              <div
                className="px-4 py-4 flex items-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${team.color_primary || "#0e3050"}, ${team.color_accent || "#1a8fc4"})`,
                }}
              >
                <TeamBadge team={team} size={40} />
                <div>
                  <h3 className="font-heading text-base font-semibold text-white">{team.name}</h3>
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <span>{team.abbreviation}</span>
                    {team.divisions?.name && <span>· {team.divisions.name}</span>}
                    {record && <span>· {record.wins}W {record.losses}L</span>}
                  </div>
                </div>
              </div>
              {/* Roster */}
              {teamRoster.length > 0 ? (
                <table className="w-full">
                  <tbody className="divide-y divide-border">
                    {teamRoster.map(r => (
                      <tr key={r.id} className="hover:bg-bg3/30 transition-colors">
                        <td className="px-4 py-2 text-xs text-text-bright">
                          {r.players?.display_name || "—"}
                          {r.is_captain && <span className="text-gold ml-1">C</span>}
                        </td>
                        <td className="px-4 py-2 text-xs text-text-muted uppercase">{r.role || "—"}</td>
                        <td className="px-4 py-2 text-xs text-right">
                          <span className={r.is_starter ? "text-green" : "text-text-muted"}>
                            {r.is_starter ? "Starter" : "Sub"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4">
                  <p className="text-text-muted text-xs text-center">No roster assigned.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
