"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { TeamBadge } from "@/components/TeamBadge";
import { Search, Plus, X, ExternalLink } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import type { Team } from "@/hooks/useLeagueData";

interface Listing {
  id: string;
  listing_type: "team_lfp" | "player_lft";
  team_id?: string;
  player_name?: string;
  roles_needed?: string[];
  preferred_roles?: string[];
  rank?: string;
  description?: string;
  discord_contact: string;
  opgg_url?: string;
  riot_id?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  teams?: Team;
}

const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"];
const RANKS = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"];

interface Props {
  teams: Team[];
}

export function DraftBoard({ teams }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"team_lfp" | "player_lft">("player_lft");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "team_lfp" | "player_lft">("all");

  // Form state
  const [teamId, setTeamId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [rank, setRank] = useState("");
  const [description, setDescription] = useState("");
  const [discord, setDiscord] = useState("");
  const [opgg, setOpgg] = useState("");
  const [riotId, setRiotId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await db("draft_listings", {
        query: "?select=*,teams(id,name,abbreviation,color_primary,color_accent,logo_url)&order=created_at.desc",
      });
      setListings(data || []);
    } catch {
      // table may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRole = (r: string) => {
    setSelectedRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const resetForm = () => {
    setTeamId(""); setPlayerName(""); setSelectedRoles([]); setRank("");
    setDescription(""); setDiscord(""); setOpgg(""); setRiotId("");
    setError(""); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (selectedRoles.length === 0) { setError("Select at least one role"); return; }
    if (!discord) { setError("Discord contact is required"); return; }
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        listing_type: mode,
        discord_contact: discord,
        description: description || null,
        is_active: true,
        expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      };
      if (mode === "team_lfp") {
        if (!teamId) { setError("Select a team"); setSubmitting(false); return; }
        body.team_id = teamId;
        body.roles_needed = selectedRoles;
      } else {
        if (!playerName) { setError("Enter your name"); setSubmitting(false); return; }
        body.player_name = playerName;
        body.preferred_roles = selectedRoles;
        body.rank = rank || null;
        body.opgg_url = opgg || null;
        body.riot_id = riotId || null;
      }

      await db("draft_listings", { method: "POST", body });
      await load();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = listings.filter(l => {
    if (typeFilter !== "all" && l.listing_type !== typeFilter) return false;
    if (!l.is_active) return false;
    if (l.expires_at && new Date(l.expires_at) < new Date()) return false;
    if (search) {
      const s = search.toLowerCase();
      return (l.player_name?.toLowerCase().includes(s)) ||
        (l.teams?.name.toLowerCase().includes(s)) ||
        (l.discord_contact.toLowerCase().includes(s));
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-3xl text-text-bright">Draft Board</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Post Listing
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button onClick={() => setMode("player_lft")} className={cn("px-3 py-1 rounded text-xs font-heading font-semibold uppercase tracking-wider cursor-pointer", mode === "player_lft" ? "bg-accent text-white" : "bg-bg3 text-text-secondary")}>
                Player LFT
              </button>
              <button onClick={() => setMode("team_lfp")} className={cn("px-3 py-1 rounded text-xs font-heading font-semibold uppercase tracking-wider cursor-pointer", mode === "team_lfp" ? "bg-accent text-white" : "bg-bg3 text-text-secondary")}>
                Team LFP
              </button>
            </div>
            <button onClick={resetForm} className="text-text-muted hover:text-text-bright cursor-pointer"><X className="h-5 w-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "team_lfp" ? (
              <div>
                <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Team</label>
                <select value={teamId} onChange={e => setTeamId(e.target.value)} className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                  <option value="">Select team...</option>
                  {teams.map(t => <option key={t.id} value={t.id} className="bg-bg2">{t.name}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Player Name</label>
                  <input value={playerName} onChange={e => setPlayerName(e.target.value)} className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Riot ID</label>
                    <input value={riotId} onChange={e => setRiotId(e.target.value)} placeholder="Name#TAG" className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Rank</label>
                    <select value={rank} onChange={e => setRank(e.target.value)} className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                      <option value="">Select rank...</option>
                      {RANKS.map(r => <option key={r} value={r} className="bg-bg2">{r}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">OP.GG URL</label>
                  <input value={opgg} onChange={e => setOpgg(e.target.value)} placeholder="https://op.gg/..." className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                {mode === "team_lfp" ? "Roles Needed" : "Preferred Roles"}
              </label>
              <div className="flex gap-2 flex-wrap">
                {ROLES.map(r => (
                  <button key={r} type="button" onClick={() => toggleRole(r)} className={cn(
                    "px-3 py-1 rounded text-xs font-heading font-semibold uppercase tracking-wider cursor-pointer transition-colors",
                    selectedRoles.includes(r) ? "bg-accent text-white" : "bg-bg3 text-text-muted hover:text-text-secondary"
                  )}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Discord</label>
              <input value={discord} onChange={e => setDiscord(e.target.value)} placeholder="username#1234" className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent" required />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Description (optional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
            </div>

            {error && <p className="text-red text-xs">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer">
                {submitting ? "Posting..." : "Post Listing"}
              </button>
              <button type="button" onClick={resetForm} className="text-text-muted hover:text-text-bright text-xs font-heading font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-bg3 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1">
          {(["all", "player_lft", "team_lfp"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn(
              "px-3 py-1.5 rounded text-xs font-heading font-semibold uppercase tracking-wider cursor-pointer transition-colors",
              typeFilter === t ? "bg-accent text-white" : "bg-bg3 text-text-secondary hover:text-text-bright"
            )}>
              {t === "all" ? "All" : t === "player_lft" ? "Players LFT" : "Teams LFP"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-border bg-bg-input text-text-bright text-xs focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="card p-10 text-center"><p className="text-text-muted text-sm">Loading...</p></div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center"><p className="text-text-muted text-sm">No active listings. Be the first to post!</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(l => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start gap-3 mb-2">
                {l.listing_type === "team_lfp" && l.teams ? (
                  <TeamBadge team={l.teams} size={32} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                    {(l.player_name || "?").charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-semibold text-text-bright truncate">
                      {l.listing_type === "team_lfp" ? l.teams?.name : l.player_name}
                    </span>
                    <span className={cn("text-[10px] font-heading font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                      l.listing_type === "team_lfp" ? "bg-blue/20 text-blue" : "bg-green/20 text-green"
                    )}>
                      {l.listing_type === "team_lfp" ? "LFP" : "LFT"}
                    </span>
                  </div>
                  {l.rank && <span className="text-text-muted text-[10px]">{l.rank}</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {(l.listing_type === "team_lfp" ? l.roles_needed : l.preferred_roles)?.map(r => (
                  <span key={r} className="bg-bg3 text-text-secondary text-[10px] font-heading font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                    {r}
                  </span>
                ))}
              </div>

              {l.description && <p className="text-text-secondary text-xs mb-2 line-clamp-2">{l.description}</p>}

              <div className="flex items-center gap-3 text-[10px] text-text-muted">
                <span>Discord: <span className="text-text-secondary">{l.discord_contact}</span></span>
                {l.opgg_url && (
                  <a href={l.opgg_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-text-bright flex items-center gap-0.5">
                    OP.GG <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                <span className="ml-auto">{timeAgo(l.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
