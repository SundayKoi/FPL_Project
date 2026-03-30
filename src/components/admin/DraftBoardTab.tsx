"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Listing { id: string; listing_type: string; team_id?: string; player_name?: string; roles_needed?: string[]; preferred_roles?: string[]; rank?: string; description?: string; discord_contact: string; is_active: boolean; expires_at?: string; created_at: string; teams?: { name: string }; }

export function DraftBoardTab() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    try { const data = await db("draft_listings", { query: "?select=*,teams(name)&order=created_at.desc" }); setListings(data || []); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string, current: boolean) => {
    try { await db("draft_listings", { method: "PATCH", body: { is_active: !current }, query: `?id=eq.${id}` }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try { await db("draft_listings", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-2xl text-text-bright">Draft Board Listings</h2>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Type</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Name</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Roles</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Discord</th>
            <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Status</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Posted</th>
            <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {listings.map(l => (
              <tr key={l.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3"><span className={`text-[10px] font-heading font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${l.listing_type === "team_lfp" ? "bg-blue/20 text-blue" : "bg-green/20 text-green"}`}>{l.listing_type === "team_lfp" ? "Team LFP" : "Player LFT"}</span></td>
                <td className="px-4 py-3 text-sm text-text-bright">{l.listing_type === "team_lfp" ? l.teams?.name : l.player_name}</td>
                <td className="px-4 py-3 text-xs text-text-secondary">{(l.roles_needed || l.preferred_roles || []).join(", ")}</td>
                <td className="px-4 py-3 text-xs text-text-secondary">{l.discord_contact}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(l.id, l.is_active)} className="cursor-pointer">{l.is_active ? <ToggleRight className="h-5 w-5 text-green" /> : <ToggleLeft className="h-5 w-5 text-text-muted" />}</button>
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">{timeAgo(l.created_at)}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(l.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {listings.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No listings yet.</div>}
      </div>
    </div>
  );
}
