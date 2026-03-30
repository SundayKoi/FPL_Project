"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Plus, Trash2 } from "lucide-react";

interface PlayerRow { id: string; display_name: string; }
interface TeamRow { id: string; name: string; abbreviation: string; }
interface SplitRow { id: string; name: string; }
interface RosterRow { id: string; player_id: string; team_id: string; split_id: string; role?: string; is_captain: boolean; is_starter: boolean; players?: { display_name: string }; teams?: { name: string; abbreviation: string }; splits?: { name: string }; }

const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support", "Fill", "Sub"];

export function RostersTab() {
  const [rosters, setRosters] = useState<RosterRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [splits, setSplits] = useState<SplitRow[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [playerId, setPlayerId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [splitId, setSplitId] = useState("");
  const [role, setRole] = useState("");
  const [isStarter, setIsStarter] = useState(true);
  const [isCaptain, setIsCaptain] = useState(false);

  const load = useCallback(async () => {
    const [r, p, t, s] = await Promise.all([
      db("rosters", { query: "?select=*,players(display_name),teams(name,abbreviation),splits(name)&order=created_at.desc" }),
      db("players", { query: "?select=id,display_name&order=display_name" }),
      db("teams", { query: "?select=id,name,abbreviation&is_active=eq.true&order=name" }),
      db("splits", { query: "?select=id,name&is_active=eq.true" }),
    ]);
    setRosters(r || []); setPlayers(p || []); setTeams(t || []); setSplits(s || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !teamId) return;
    setSaving(true);
    try {
      await db("rosters", { method: "POST", body: { player_id: playerId, team_id: teamId, split_id: splitId || null, role: role || null, is_starter: isStarter, is_captain: isCaptain } });
      setToast({ msg: "Roster entry created", type: "success" });
      setPlayerId(""); setTeamId(""); setRole(""); setIsStarter(true); setIsCaptain(false); setShowForm(false);
      await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this roster entry?")) return;
    try { await db("rosters", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Removed", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Rosters <span className="text-text-muted text-base">({rosters.length})</span></h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add</button>
      </div>

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelClass}>Player</label><select value={playerId} onChange={e => setPlayerId(e.target.value)} className={inputClass} required><option value="">Select...</option>{players.map(p => <option key={p.id} value={p.id} className="bg-bg2">{p.display_name}</option>)}</select></div>
              <div><label className={labelClass}>Team</label><select value={teamId} onChange={e => setTeamId(e.target.value)} className={inputClass} required><option value="">Select...</option>{teams.map(t => <option key={t.id} value={t.id} className="bg-bg2">{t.name}</option>)}</select></div>
              <div><label className={labelClass}>Split</label><select value={splitId} onChange={e => setSplitId(e.target.value)} className={inputClass}><option value="">None</option>{splits.map(s => <option key={s.id} value={s.id} className="bg-bg2">{s.name}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div><label className={labelClass}>Role</label><select value={role} onChange={e => setRole(e.target.value)} className={inputClass}><option value="">None</option>{ROLES.map(r => <option key={r} value={r} className="bg-bg2">{r}</option>)}</select></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isStarter} onChange={e => setIsStarter(e.target.checked)} className="accent-accent" /><span className="text-xs text-text-secondary">Starter</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isCaptain} onChange={e => setIsCaptain(e.target.checked)} className="accent-accent" /><span className="text-xs text-text-secondary">Captain</span></label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer">{saving ? "Saving..." : "Add"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-bright text-xs font-heading font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-bg3 transition-colors cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Player</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Team</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Split</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Role</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Status</th>
            <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {rosters.map(r => (
              <tr key={r.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3 text-sm text-text-bright">{r.players?.display_name || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{r.teams?.abbreviation || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{r.splits?.name || "—"}</td>
                <td className="px-4 py-3 text-sm text-text-secondary uppercase">{r.role || "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {r.is_captain && <span className="text-gold mr-1">Captain</span>}
                  <span className={r.is_starter ? "text-green" : "text-text-muted"}>{r.is_starter ? "Starter" : "Sub"}</span>
                </td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(r.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rosters.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No roster entries yet.</div>}
      </div>
    </div>
  );
}
