"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Plus, Trash2, Play, Pause } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TeamRow { id: string; name: string; abbreviation: string; }
interface SplitRow { id: string; name: string; }
interface MatchRow { id: string; split_id: string; team_blue_id: string; team_red_id: string; status: string; scheduled_at: string; match_format?: string; season_phase?: string; winner_team_id?: string; score_blue?: number; score_red?: number; team_blue?: TeamRow; team_red?: TeamRow; splits?: { name: string }; }

export function ScheduleTab() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [splits, setSplits] = useState<SplitRow[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [blueId, setBlueId] = useState("");
  const [redId, setRedId] = useState("");
  const [splitId, setSplitId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [format, setFormat] = useState("bo1");
  const [phase, setPhase] = useState("Regular");

  const load = useCallback(async () => {
    const [m, t, s] = await Promise.all([
      db("matches", { query: "?select=*,team_blue:teams!matches_team_blue_id_fkey(id,name,abbreviation),team_red:teams!matches_team_red_id_fkey(id,name,abbreviation),splits(name)&order=scheduled_at.desc.nullslast,created_at.desc&limit=50" }),
      db("teams", { query: "?select=id,name,abbreviation&is_active=eq.true&order=name" }),
      db("splits", { query: "?select=id,name&is_active=eq.true" }),
    ]);
    setMatches(m || []); setTeams(t || []); setSplits(s || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blueId || !redId || !splitId || blueId === redId) return;
    setSaving(true);
    try {
      await db("matches", { method: "POST", body: { team_blue_id: blueId, team_red_id: redId, split_id: splitId, scheduled_at: scheduledAt || null, match_format: format, season_phase: phase, status: "scheduled" } });
      setToast({ msg: "Match scheduled", type: "success" });
      setBlueId(""); setRedId(""); setScheduledAt(""); setShowForm(false);
      await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const setStatus = async (id: string, status: string) => {
    try { await db("matches", { method: "PATCH", body: { status }, query: `?id=eq.${id}` }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try { await db("matches", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Schedule</h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New Match</button>
      </div>

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelClass}>Blue Side</label><select value={blueId} onChange={e => setBlueId(e.target.value)} className={inputClass} required><option value="">Select...</option>{teams.map(t => <option key={t.id} value={t.id} className="bg-bg2">{t.name}</option>)}</select></div>
              <div><label className={labelClass}>Red Side</label><select value={redId} onChange={e => setRedId(e.target.value)} className={inputClass} required><option value="">Select...</option>{teams.filter(t => t.id !== blueId).map(t => <option key={t.id} value={t.id} className="bg-bg2">{t.name}</option>)}</select></div>
              <div><label className={labelClass}>Split</label><select value={splitId} onChange={e => setSplitId(e.target.value)} className={inputClass} required><option value="">Select...</option>{splits.map(s => <option key={s.id} value={s.id} className="bg-bg2">{s.name}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelClass}>Date & Time</label><input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Format</label><select value={format} onChange={e => setFormat(e.target.value)} className={inputClass}><option value="bo1">Bo1</option><option value="bo3">Bo3</option><option value="bo5">Bo5</option></select></div>
              <div><label className={labelClass}>Phase</label><select value={phase} onChange={e => setPhase(e.target.value)} className={inputClass}><option value="Regular">Regular</option><option value="Playoffs">Playoffs</option></select></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer">{saving ? "Saving..." : "Schedule"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-bright text-xs font-heading font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-bg3 transition-colors cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {matches.map(m => (
          <div key={m.id} className="card px-4 py-3 flex items-center gap-3">
            {m.status === "live" && <span className="w-2 h-2 rounded-full bg-red animate-pulse shrink-0" />}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-text-bright">{m.team_blue?.abbreviation || "?"} vs {m.team_red?.abbreviation || "?"}</span>
              <div className="text-text-muted text-[10px]">
                {m.splits?.name} · {m.match_format} · {m.scheduled_at ? formatDate(m.scheduled_at) : "TBD"}
                {m.status === "completed" && m.winner_team_id && <span className="text-green ml-2">Final: {m.score_blue}-{m.score_red}</span>}
              </div>
            </div>
            <span className={`text-[10px] font-heading font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${m.status === "live" ? "bg-red/20 text-red" : m.status === "completed" ? "bg-green/20 text-green" : "bg-bg3 text-text-muted"}`}>{m.status}</span>
            {m.status === "scheduled" && <button onClick={() => setStatus(m.id, "live")} className="p-1.5 rounded text-text-muted hover:text-green hover:bg-green/10 transition-colors cursor-pointer" title="Set Live"><Play className="h-3.5 w-3.5" /></button>}
            {m.status === "live" && <button onClick={() => setStatus(m.id, "scheduled")} className="p-1.5 rounded text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer" title="Revert"><Pause className="h-3.5 w-3.5" /></button>}
            <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {matches.length === 0 && <div className="card p-8 text-center text-text-muted text-sm">No matches yet.</div>}
      </div>
    </div>
  );
}
