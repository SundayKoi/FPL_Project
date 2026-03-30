"use client";

import { TeamBadge } from "@/components/TeamBadge";
import type { Player } from "@/hooks/useLeagueData";

interface Props {
  players: Player[];
}

export function PlayerLeaders({ players }: Props) {
  const top = [...players].sort((a, b) => parseFloat(b.kda) - parseFloat(a.kda)).slice(0, 5);

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-bright">
          KDA Leaders
        </h3>
      </div>
      {top.length === 0 ? (
        <div className="p-4">
          <p className="text-text-muted text-xs text-center py-4">
            Stats will appear once matches are played.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {top.map((p, i) => (
            <div key={p.id} className="px-4 py-2 flex items-center gap-3">
              <span className={`text-xs font-mono w-4 text-right ${i === 0 ? "text-gold" : i === 1 ? "text-text-secondary" : i === 2 ? "text-[#cd7f32]" : "text-text-dim"}`}>
                {i + 1}
              </span>
              <TeamBadge team={p.team} size={20} />
              <div className="flex-1 min-w-0">
                <span className="text-text-bright text-xs font-medium truncate block">{p.name}</span>
                <span className="text-text-dim text-[10px]">{p.role}</span>
              </div>
              <span className="text-accent text-xs font-mono font-medium">{p.kda}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
