"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Plus, Trash2 } from "lucide-react";

interface Division { id: string; name: string; season_id?: string; sort_order: number; seasons?: { name: string }; }
interface Season { id: string; name: string; }

export function DivisionsTab({ onRefresh }: { onRefresh: () => void }) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const load = useCallback(async () => {
    const [d, s] = await Promise.all([
      db("divisions", { query: "?select=*,seasons(name)&order=sort_order" }),
      db("seasons", { query: "?select=id,name&order=start_date.desc" }),
    ]);
    setDivisions(d || []); setSeasons(s || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !seasonId) return;
    setSaving(true);
    try {
      await db("divisions", { method: "POST", body: { name, season_id: seasonId, sort_order: sortOrder } });
      setToast({ msg: "Division created", type: "success" }); setName(""); setSortOrder(0); setShowForm(false); await load(); onRefresh();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await db("divisions", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); onRefresh(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Divisions</h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add</button>
      </div>

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelClass}>Name</label><input value={name} onChange={e => setName(e.target.value)} className={inputClass} required /></div>
              <div><label className={labelClass}>Season</label><select value={seasonId} onChange={e => setSeasonId(e.target.value)} className={`${inputClass} appearance-none`} required><option value="">Select...</option>{seasons.map(s => <option key={s.id} value={s.id} className="bg-bg2">{s.name}</option>)}</select></div>
              <div><label className={labelClass}>Sort Order</label><input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} className={inputClass} /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer">{saving ? "Saving..." : "Create"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-bright text-xs font-heading font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-bg3 transition-colors cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Name</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Season</th>
            <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Order</th>
            <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {divisions.map(d => (
              <tr key={d.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3 text-sm text-text-bright">{d.name}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{d.seasons?.name || "—"}</td>
                <td className="px-4 py-3 text-center text-sm text-text-secondary font-mono">{d.sort_order}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(d.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {divisions.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No divisions yet.</div>}
      </div>
    </div>
  );
}
