"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TeamBadge } from "@/components/TeamBadge";
import type { Player } from "@/hooks/useLeagueData";

interface Props {
  players: Player[];
  isMobile: boolean;
}

const ROLES = ["All", "Top", "Jungle", "Mid", "ADC", "Support"];

export function PlayersView({ players, isMobile }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.riot_name && `${p.riot_name}#${p.riot_tag}`.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === "All" || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <h2 className="font-display text-3xl text-text-bright mb-4">Players</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded border border-border bg-bg-input text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded border border-border bg-bg-input text-text-bright text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
        >
          {ROLES.map(r => (
            <option key={r} value={r} className="bg-bg2">{r}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-text-muted text-sm">No players found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Player</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Role</th>
                {!isMobile && (
                  <>
                    <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">GP</th>
                    <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">KDA</th>
                    <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Win%</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-bg3/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TeamBadge team={p.team} size={22} />
                      <div>
                        <span className="text-sm font-medium text-text-bright">
                          {p.name}
                          {p.is_captain && <span className="text-gold ml-1 text-xs">C</span>}
                        </span>
                        {p.riot_name && (
                          <span className="block text-text-muted text-[10px]">
                            {p.riot_name}#{p.riot_tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary uppercase">{p.role || "—"}</td>
                  {!isMobile && (
                    <>
                      <td className="px-4 py-3 text-center text-sm font-mono text-text-secondary">{p.gp}</td>
                      <td className="px-4 py-3 text-center text-sm font-mono text-accent">{p.kda}</td>
                      <td className="px-4 py-3 text-center text-sm font-mono text-text-secondary">{p.winRate}%</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
