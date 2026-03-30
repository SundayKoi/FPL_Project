"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { TeamBadge } from "@/components/TeamBadge";
import { cn } from "@/lib/utils";
import type { Player } from "@/hooks/useLeagueData";

interface Props {
  players: Player[];
  isMobile: boolean;
}

const STAT_TYPES = ["KDA", "Kills/G", "Deaths/G", "Assists/G", "CS/G", "DMG/G", "Gold/G", "Win Rate"] as const;
type StatType = (typeof STAT_TYPES)[number];
const ROLES_FILTER = ["All", "Top", "Jng", "Mid", "ADC", "Sup"];
const ROLE_MAP: Record<string, string> = { Jng: "Jungle", Sup: "Support" };

function getStatValue(p: Player, stat: StatType): number {
  const gp = p.gp || 1;
  switch (stat) {
    case "KDA": return parseFloat(p.kda);
    case "Kills/G": return p.kills / gp;
    case "Deaths/G": return p.deaths / gp;
    case "Assists/G": return p.assists / gp;
    case "CS/G": return p.cs;
    case "DMG/G": return p.damage;
    case "Gold/G": return p.gold;
    case "Win Rate": return p.winRate;
  }
}

function fmtStat(v: number, stat: StatType): string {
  if (stat === "Win Rate") return `${v}%`;
  if (stat === "DMG/G" || stat === "Gold/G") return v.toLocaleString();
  return v.toFixed(1);
}

export function StatsView({ players, isMobile }: Props) {
  const [stat, setStat] = useState<StatType>("KDA");
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<StatType>("KDA");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    return players
      .filter(p => {
        const matchRole = roleFilter === "All" || p.role === (ROLE_MAP[roleFilter] || roleFilter);
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch && p.gp > 0;
      })
      .sort((a, b) => {
        const va = getStatValue(a, sortCol);
        const vb = getStatValue(b, sortCol);
        return sortAsc ? va - vb : vb - va;
      });
  }, [players, roleFilter, search, sortCol, sortAsc]);

  const top10 = filtered.slice(0, 10);
  const maxVal = top10.length > 0 ? getStatValue(top10[0], stat) : 1;

  const handleSort = (col: StatType) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: StatType }) => {
    if (sortCol !== col) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3 inline ml-0.5" /> : <ChevronDown className="h-3 w-3 inline ml-0.5" />;
  };

  return (
    <div>
      <h2 className="font-display text-3xl text-text-bright mb-4">Stats</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STAT_TYPES.map(s => (
          <button
            key={s}
            onClick={() => { setStat(s); setSortCol(s); setSortAsc(false); }}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer",
              stat === s ? "bg-accent text-white" : "bg-bg3 text-text-secondary hover:text-text-bright"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {ROLES_FILTER.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0",
                roleFilter === r ? "bg-bg-input text-text-bright border border-accent" : "bg-bg3 text-text-muted hover:text-text-secondary border border-transparent"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-border bg-bg-input text-text-bright text-xs focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Top 10 leaderboard */}
      {top10.length > 0 && (
        <div className="card p-4 mb-4">
          <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Top 10 — {stat}
          </h3>
          <div className="space-y-2">
            {top10.map((p, i) => {
              const val = getStatValue(p, stat);
              const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <span className={`text-xs font-mono w-5 text-right shrink-0 ${
                    i === 0 ? "text-gold" : i === 1 ? "text-text-secondary" : i === 2 ? "text-[#cd7f32]" : "text-text-dim"
                  }`}>
                    {i + 1}
                  </span>
                  <TeamBadge team={p.team} size={18} />
                  <span className="text-xs text-text-bright w-24 truncate shrink-0">{p.name}</span>
                  <div className="flex-1 h-5 bg-bg3 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${p.team?.color_primary || "var(--clr-accent)"}, ${p.team?.color_accent || "var(--clr-accent)"})`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-accent w-14 text-right shrink-0">
                    {fmtStat(val, stat)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full table */}
      {filtered.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Player</th>
                  {(isMobile ? ["KDA", "GP"] : ["GP", "KDA", "Kills/G", "Deaths/G", "Assists/G", "CS/G", "DMG/G", "Win Rate"]).map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col as StatType)}
                      className="px-2 py-2 text-center text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted cursor-pointer hover:text-text-bright transition-colors"
                    >
                      {col}<SortIcon col={col as StatType} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-bg3/50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <TeamBadge team={p.team} size={18} />
                        <span className="text-xs text-text-bright truncate max-w-[100px]">{p.name}</span>
                      </div>
                    </td>
                    {isMobile ? (
                      <>
                        <td className="px-2 py-2 text-center text-xs font-mono text-accent">{p.kda}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{p.gp}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{p.gp}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-accent">{p.kda}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{(p.kills / (p.gp || 1)).toFixed(1)}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{(p.deaths / (p.gp || 1)).toFixed(1)}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{(p.assists / (p.gp || 1)).toFixed(1)}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{p.cs}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{p.damage.toLocaleString()}</td>
                        <td className="px-2 py-2 text-center text-xs font-mono text-text-secondary">{p.winRate}%</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
