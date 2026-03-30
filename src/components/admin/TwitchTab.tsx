"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Embed { id: string; embed_type: "channel" | "clip" | "youtube"; channel_name?: string; clip_url?: string; title?: string; is_active: boolean; sort_order: number; }

export function TwitchTab() {
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [embedType, setEmbedType] = useState<"channel" | "clip" | "youtube">("channel");
  const [channelName, setChannelName] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const data = await db("twitch_embeds", { query: "?select=*&order=sort_order,created_at.desc" }); setEmbeds(data || []); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = { embed_type: embedType, is_active: true, sort_order: embeds.length, title: title || null };
      if (embedType === "channel") { body.channel_name = channelName.toLowerCase(); } else { body.clip_url = clipUrl; }
      await db("twitch_embeds", { method: "POST", body });
      setToast({ msg: "Embed added", type: "success" }); setChannelName(""); setClipUrl(""); setTitle(""); setShowForm(false); await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try { await db("twitch_embeds", { method: "PATCH", body: { is_active: !current }, query: `?id=eq.${id}` }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await db("twitch_embeds", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";
  const typeColor = (t: string) => t === "channel" ? "bg-purple-500/20 text-purple-400" : t === "youtube" ? "bg-red/20 text-red" : "bg-blue/20 text-blue";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Twitch / YouTube Embeds</h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Embed</button>
      </div>

      {showForm && (
        <div className="card p-5">
          <div className="flex gap-2 mb-4">
            {(["channel", "clip", "youtube"] as const).map(t => (
              <button key={t} onClick={() => setEmbedType(t)} className={`px-3 py-1 rounded text-xs font-heading font-semibold uppercase tracking-wider cursor-pointer ${embedType === t ? "bg-accent text-white" : "bg-bg3 text-text-secondary"}`}>{t}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {embedType === "channel" ? (
              <div><label className={labelClass}>Channel Name</label><input value={channelName} onChange={e => setChannelName(e.target.value)} className={inputClass} required /></div>
            ) : (
              <div><label className={labelClass}>{embedType === "youtube" ? "YouTube URL" : "Clip/VOD URL"}</label><input value={clipUrl} onChange={e => setClipUrl(e.target.value)} className={inputClass} required /></div>
            )}
            <div><label className={labelClass}>Title (optional)</label><input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} /></div>
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
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Type</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Details</th>
            <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Active</th>
            <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {embeds.map(e => (
              <tr key={e.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3"><span className={`text-[10px] font-heading font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeColor(e.embed_type)}`}>{e.embed_type}</span></td>
                <td className="px-4 py-3 text-sm text-text-secondary">{e.embed_type === "channel" ? e.channel_name : <a href={e.clip_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-text-bright">{e.title || e.clip_url}</a>}</td>
                <td className="px-4 py-3 text-center"><button onClick={() => toggleActive(e.id, e.is_active)} className="cursor-pointer">{e.is_active ? <ToggleRight className="h-5 w-5 text-green mx-auto" /> : <ToggleLeft className="h-5 w-5 text-text-muted mx-auto" />}</button></td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(e.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {embeds.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No embeds yet.</div>}
      </div>
    </div>
  );
}
