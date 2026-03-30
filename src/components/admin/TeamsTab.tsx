"use client";

import { useState, useEffect, useCallback } from "react";
import { db, uploadFile } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { TeamBadge } from "@/components/TeamBadge";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Team } from "@/hooks/useLeagueData";

interface Division { id: string; name: string; }
interface Season { id: string; name: string; }

export function TeamsTab({ onRefresh }: { onRefresh: () => void }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [colorPrimary, setColorPrimary] = useState("#0e3050");
  const [colorAccent, setColorAccent] = useState("#1a8fc4");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [seasonId, setSeasonId] = useState("");

  const load = useCallback(async () => {
    const [t, d, s] = await Promise.all([
      db("teams", { query: "?select=*,divisions(name)&order=name" }),
      db("divisions", { query: "?select=id,name&order=sort_order" }),
      db("seasons", { query: "?select=id,name&order=start_date.desc" }),
    ]);
    setTeams(t || []);
    setDivisions(d || []);
    setSeasons(s || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setName(""); setAbbr(""); setColorPrimary("#0e3050"); setColorAccent("#1a8fc4");
    setLogoFile(null); setLogoUrl(""); setDivisionId(""); setSeasonId("");
    setEditing(null); setShowForm(false);
  };

  const openEdit = (t: Team) => {
    setEditing(t); setName(t.name); setAbbr(t.abbreviation);
    setColorPrimary(t.color_primary || "#0e3050"); setColorAccent(t.color_accent || "#1a8fc4");
    setLogoUrl(t.logo_url || ""); setDivisionId(t.division_id || ""); setSeasonId(t.season_id || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !abbr) return;
    setSaving(true);
    try {
      let finalLogo = logoUrl;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        finalLogo = await uploadFile("team-logos", `${Date.now()}_${abbr}.${ext}`, logoFile);
      }
      const body: Record<string, unknown> = {
        name, abbreviation: abbr.toUpperCase(),
        color_primary: colorPrimary, color_accent: colorAccent,
        logo_url: finalLogo || null,
        division_id: divisionId || null, season_id: seasonId || null,
        is_active: true,
      };
      if (editing) {
        await db("teams", { method: "PATCH", body, query: `?id=eq.${editing.id}` });
        setToast({ msg: "Team updated", type: "success" });
      } else {
        await db("teams", { method: "POST", body });
        setToast({ msg: "Team created", type: "success" });
      }
      resetForm(); await load(); onRefresh();
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    try {
      await db("teams", { method: "DELETE", query: `?id=eq.${id}` });
      setToast({ msg: "Team deleted", type: "success" });
      await load(); onRefresh();
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" });
    }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Teams</h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Team
        </button>
      </div>

      {showForm && (
        <div className="card p-5">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-bright mb-4">
            {editing ? "Edit Team" : "New Team"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Team Name</label><input value={name} onChange={e => setName(e.target.value)} className={inputClass} required /></div>
              <div><label className={labelClass}>Abbreviation</label><input value={abbr} onChange={e => setAbbr(e.target.value.toUpperCase())} maxLength={5} className={inputClass} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={colorPrimary} onChange={e => setColorPrimary(e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
                  <input value={colorPrimary} onChange={e => setColorPrimary(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={colorAccent} onChange={e => setColorAccent(e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
                  <input value={colorAccent} onChange={e => setColorAccent(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Logo (upload or URL)</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="text-xs text-text-muted" />
                <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Or paste URL..." className={`${inputClass} mt-1`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Division</label>
                  <select value={divisionId} onChange={e => setDivisionId(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">None</option>
                    {divisions.map(d => <option key={d.id} value={d.id} className="bg-bg2">{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Season</label>
                  <select value={seasonId} onChange={e => setSeasonId(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">None</option>
                    {seasons.map(s => <option key={s.id} value={s.id} className="bg-bg2">{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer">
                {saving ? "Saving..." : editing ? "Update" : "Create"} Team
              </button>
              <button type="button" onClick={resetForm} className="text-text-muted hover:text-text-bright text-xs font-heading font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-bg3 transition-colors cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Team</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Abbr</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Division</th>
            <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Colors</th>
            <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {teams.map(t => (
              <tr key={t.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><TeamBadge team={t} size={24} /><span className="text-sm text-text-bright">{t.name}</span></div></td>
                <td className="px-4 py-3 text-sm text-text-secondary">{t.abbreviation}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{t.divisions?.name || "—"}</td>
                <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><div className="w-4 h-4 rounded" style={{ background: t.color_primary }} /><div className="w-4 h-4 rounded" style={{ background: t.color_accent }} /></div></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded text-text-muted hover:text-text-bright hover:bg-bg3 transition-colors cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teams.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No teams yet.</div>}
      </div>
    </div>
  );
}
