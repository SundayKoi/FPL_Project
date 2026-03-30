"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Season { id: string; name: string; start_date?: string; end_date?: string; is_active: boolean; }
interface Split { id: string; name: string; season_id: string; start_date?: string; end_date?: string; sort_order: number; is_active: boolean; seasons?: { name: string }; }

export function SeasonsTab() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [showSplitForm, setShowSplitForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Season form
  const [sName, setSName] = useState("");
  const [sStart, setSStart] = useState("");
  const [sEnd, setSEnd] = useState("");
  const [sActive, setSActive] = useState(true);

  // Split form
  const [spName, setSpName] = useState("");
  const [spSeasonId, setSpSeasonId] = useState("");
  const [spStart, setSpStart] = useState("");
  const [spEnd, setSpEnd] = useState("");
  const [spOrder, setSpOrder] = useState(0);

  const load = useCallback(async () => {
    const [se, sp] = await Promise.all([
      db("seasons", { query: "?select=*&order=start_date.desc" }),
      db("splits", { query: "?select=*,seasons(name)&order=start_date" }),
    ]);
    setSeasons(se || []); setSplits(sp || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName) return;
    setSaving(true);
    try {
      await db("seasons", { method: "POST", body: { name: sName, start_date: sStart || null, end_date: sEnd || null, is_active: sActive } });
      setToast({ msg: "Season created", type: "success" }); setSName(""); setSStart(""); setSEnd(""); setShowSeasonForm(false); await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const createSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spName || !spSeasonId) return;
    setSaving(true);
    try {
      await db("splits", { method: "POST", body: { name: spName, season_id: spSeasonId, start_date: spStart || null, end_date: spEnd || null, sort_order: spOrder, is_active: true } });
      setToast({ msg: "Split created", type: "success" }); setSpName(""); setSpStart(""); setSpEnd(""); setShowSplitForm(false); await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const toggleSeasonActive = async (id: string, current: boolean) => {
    try { await db("seasons", { method: "PATCH", body: { is_active: !current }, query: `?id=eq.${id}` }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const deleteSeason = async (id: string) => {
    if (!confirm("Delete this season?")) return;
    try { await db("seasons", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const deleteSplit = async (id: string) => {
    if (!confirm("Delete this split?")) return;
    try { await db("splits", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seasons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-text-bright">Seasons</h2>
            <button onClick={() => setShowSeasonForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
          </div>

          {showSeasonForm && (
            <div className="card p-4">
              <form onSubmit={createSeason} className="space-y-3">
                <div><label className={labelClass}>Name</label><input value={sName} onChange={e => setSName(e.target.value)} className={inputClass} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>Start</label><input type="date" value={sStart} onChange={e => setSStart(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>End</label><input type="date" value={sEnd} onChange={e => setSEnd(e.target.value)} className={inputClass} /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sActive} onChange={e => setSActive(e.target.checked)} className="accent-accent" /><span className="text-xs text-text-secondary">Active</span></label>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors disabled:opacity-50 cursor-pointer">{saving ? "..." : "Create"}</button>
                  <button type="button" onClick={() => setShowSeasonForm(false)} className="text-text-muted text-xs cursor-pointer">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Start</th>
                <th className="px-3 py-2 text-center text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Status</th>
                <th className="px-3 py-2 text-right text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {seasons.map(s => (
                  <tr key={s.id} className="hover:bg-bg3/50 transition-colors">
                    <td className="px-3 py-2 text-xs text-text-bright">{s.name}</td>
                    <td className="px-3 py-2 text-xs text-text-secondary">{s.start_date ? formatDate(s.start_date) : "—"}</td>
                    <td className="px-3 py-2 text-center"><button onClick={() => toggleSeasonActive(s.id, s.is_active)} className="cursor-pointer">{s.is_active ? <ToggleRight className="h-4 w-4 text-green mx-auto" /> : <ToggleLeft className="h-4 w-4 text-text-muted mx-auto" />}</button></td>
                    <td className="px-3 py-2 text-right"><button onClick={() => deleteSeason(s.id)} className="p-1 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3 w-3" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {seasons.length === 0 && <div className="p-6 text-center text-text-muted text-xs">No seasons yet.</div>}
          </div>
        </div>

        {/* Splits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-text-bright">Splits</h2>
            <button onClick={() => setShowSplitForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
          </div>

          {showSplitForm && (
            <div className="card p-4">
              <form onSubmit={createSplit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>Name</label><input value={spName} onChange={e => setSpName(e.target.value)} className={inputClass} required /></div>
                  <div><label className={labelClass}>Season</label><select value={spSeasonId} onChange={e => setSpSeasonId(e.target.value)} className={`${inputClass} appearance-none`} required><option value="">Select...</option>{seasons.map(s => <option key={s.id} value={s.id} className="bg-bg2">{s.name}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelClass}>Start</label><input type="date" value={spStart} onChange={e => setSpStart(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>End</label><input type="date" value={spEnd} onChange={e => setSpEnd(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Order</label><input type="number" value={spOrder} onChange={e => setSpOrder(Number(e.target.value))} className={inputClass} /></div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors disabled:opacity-50 cursor-pointer">{saving ? "..." : "Create"}</button>
                  <button type="button" onClick={() => setShowSplitForm(false)} className="text-text-muted text-xs cursor-pointer">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Season</th>
                <th className="px-3 py-2 text-center text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Order</th>
                <th className="px-3 py-2 text-right text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {splits.map(sp => (
                  <tr key={sp.id} className="hover:bg-bg3/50 transition-colors">
                    <td className="px-3 py-2 text-xs text-text-bright">{sp.name}</td>
                    <td className="px-3 py-2 text-xs text-text-secondary">{sp.seasons?.name || "—"}</td>
                    <td className="px-3 py-2 text-center text-xs text-text-secondary font-mono">{sp.sort_order}</td>
                    <td className="px-3 py-2 text-right"><button onClick={() => deleteSplit(sp.id)} className="p-1 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3 w-3" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {splits.length === 0 && <div className="p-6 text-center text-text-muted text-xs">No splits yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
