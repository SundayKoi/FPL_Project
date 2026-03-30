"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Pencil, Trash2, Plus } from "lucide-react";

interface PlayerRow { id: string; display_name: string; riot_game_name?: string; riot_tag_line?: string; riot_puuid?: string; }

export function PlayersTab() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlayerRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [riotName, setRiotName] = useState("");
  const [riotTag, setRiotTag] = useState("");

  const load = useCallback(async () => {
    const data = await db("players", { query: "?select=*&order=display_name" });
    setPlayers(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setDisplayName(""); setRiotName(""); setRiotTag(""); setEditing(null); setShowForm(false); };

  const openEdit = (p: PlayerRow) => {
    setEditing(p); setDisplayName(p.display_name); setRiotName(p.riot_game_name || ""); setRiotTag(p.riot_tag_line || ""); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { display_name: displayName, riot_game_name: riotName || null, riot_tag_line: riotTag || null };
      if (editing) {
        await db("players", { method: "PATCH", body, query: `?id=eq.${editing.id}` });
        setToast({ msg: "Player updated", type: "success" });
      } else {
        await db("players", { method: "POST", body });
        setToast({ msg: "Player created", type: "success" });
      }
      resetForm(); await load();
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    try { await db("players", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Players</h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Player</button>
      </div>

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelClass}>Display Name</label><input value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputClass} required /></div>
              <div><label className={labelClass}>Riot Game Name</label><input value={riotName} onChange={e => setRiotName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Riot Tag</label><input value={riotTag} onChange={e => setRiotTag(e.target.value)} className={inputClass} /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              <button type="button" onClick={resetForm} className="text-text-muted hover:text-text-bright text-xs font-heading font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-bg3 transition-colors cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Name</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Riot ID</th>
            <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {players.map(p => (
              <tr key={p.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3 text-sm text-text-bright">{p.display_name}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{p.riot_game_name ? `${p.riot_game_name}#${p.riot_tag_line || ""}` : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded text-text-muted hover:text-text-bright hover:bg-bg3 transition-colors cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {players.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No players yet.</div>}
      </div>
    </div>
  );
}
