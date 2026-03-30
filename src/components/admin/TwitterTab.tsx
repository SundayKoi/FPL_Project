"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Feed { id: string; feed_type: "timeline" | "tweet"; handle?: string; tweet_url?: string; title?: string; is_active: boolean; sort_order: number; }

export function TwitterTab() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedType, setFeedType] = useState<"timeline" | "tweet">("timeline");
  const [handle, setHandle] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const data = await db("twitter_feeds", { query: "?select=*&order=sort_order,created_at.desc" }); setFeeds(data || []); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = { feed_type: feedType, is_active: true, sort_order: feeds.length };
      if (feedType === "timeline") { body.handle = handle.replace("@", ""); } else { body.tweet_url = tweetUrl; body.title = title || "Pinned Tweet"; }
      await db("twitter_feeds", { method: "POST", body });
      setToast({ msg: "Feed added", type: "success" }); setHandle(""); setTweetUrl(""); setTitle(""); setShowForm(false); await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try { await db("twitter_feeds", { method: "PATCH", body: { is_active: !current }, query: `?id=eq.${id}` }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await db("twitter_feeds", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Twitter / X Feeds</h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Feed</button>
      </div>

      {showForm && (
        <div className="card p-5">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setFeedType("timeline")} className={`px-3 py-1 rounded text-xs font-heading font-semibold uppercase tracking-wider cursor-pointer ${feedType === "timeline" ? "bg-accent text-white" : "bg-bg3 text-text-secondary"}`}>Timeline</button>
            <button onClick={() => setFeedType("tweet")} className={`px-3 py-1 rounded text-xs font-heading font-semibold uppercase tracking-wider cursor-pointer ${feedType === "tweet" ? "bg-accent text-white" : "bg-bg3 text-text-secondary"}`}>Tweet</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {feedType === "timeline" ? (
              <div><label className={labelClass}>X Handle</label><input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@handle" className={inputClass} required /></div>
            ) : (
              <>
                <div><label className={labelClass}>Tweet URL</label><input value={tweetUrl} onChange={e => setTweetUrl(e.target.value)} placeholder="https://x.com/.../status/..." className={inputClass} required /></div>
                <div><label className={labelClass}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Pinned Tweet" className={inputClass} /></div>
              </>
            )}
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
            {feeds.map(f => (
              <tr key={f.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3"><span className={`text-[10px] font-heading font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${f.feed_type === "timeline" ? "bg-blue/20 text-blue" : "bg-purple-500/20 text-purple-400"}`}>{f.feed_type}</span></td>
                <td className="px-4 py-3 text-sm text-text-secondary">{f.feed_type === "timeline" ? `@${f.handle}` : <a href={f.tweet_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-text-bright">{f.title || "Tweet"}</a>}</td>
                <td className="px-4 py-3 text-center"><button onClick={() => toggleActive(f.id, f.is_active)} className="cursor-pointer">{f.is_active ? <ToggleRight className="h-5 w-5 text-green mx-auto" /> : <ToggleLeft className="h-5 w-5 text-text-muted mx-auto" />}</button></td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(f.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {feeds.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No feeds yet.</div>}
      </div>
    </div>
  );
}
