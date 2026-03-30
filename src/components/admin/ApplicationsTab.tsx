"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

interface Application { id: string; team_name: string; abbreviation: string; color_primary?: string; color_accent?: string; logo_url?: string; captain_discord: string; players: { display_name: string; role?: string; riot_id?: string; opgg_link?: string; is_captain?: boolean }[]; status: string; admin_notes?: string; created_at: string; }

export function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [denyNotes, setDenyNotes] = useState("");
  const [denyingId, setDenyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { const data = await db("team_applications", { query: "?select=*&order=created_at.desc" }); setApps(data || []); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (app: Application) => {
    if (!confirm(`Approve "${app.team_name}"? This will create the team, players, and roster.`)) return;
    try {
      const [team] = await db("teams", { method: "POST", body: { name: app.team_name, abbreviation: app.abbreviation, color_primary: app.color_primary || "#0e3050", color_accent: app.color_accent || "#1a8fc4", logo_url: app.logo_url || null, is_active: true } });
      for (const p of app.players) {
        const [player] = await db("players", { method: "POST", body: { display_name: p.display_name, riot_game_name: p.riot_id?.split("#")[0] || null, riot_tag_line: p.riot_id?.split("#")[1] || null } });
        await db("rosters", { method: "POST", body: { player_id: player.id, team_id: team.id, role: p.role || null, is_starter: true, is_captain: p.is_captain || false } });
      }
      await db("team_applications", { method: "PATCH", body: { status: "approved" }, query: `?id=eq.${app.id}` });
      setToast({ msg: `"${app.team_name}" approved and created`, type: "success" });
      await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Approval failed", type: "error" }); }
  };

  const handleDeny = async (id: string) => {
    try {
      await db("team_applications", { method: "PATCH", body: { status: "denied", admin_notes: denyNotes || null }, query: `?id=eq.${id}` });
      setToast({ msg: "Application denied", type: "success" });
      setDenyingId(null); setDenyNotes(""); await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const statusColor = (s: string) => s === "approved" ? "text-green" : s === "denied" ? "text-red" : "text-gold";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-2xl text-text-bright">Team Applications</h2>

      {apps.length === 0 ? (
        <div className="card p-8 text-center text-text-muted text-sm">No applications yet.</div>
      ) : (
        <div className="space-y-2">
          {apps.map(app => (
            <div key={app.id} className="card overflow-hidden">
              <button onClick={() => setExpanded(expanded === app.id ? null : app.id)} className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-bg3/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-sm font-semibold text-text-bright">{app.team_name}</span>
                  <span className="text-text-muted text-xs">{app.abbreviation}</span>
                  <span className={`text-[10px] font-heading font-semibold uppercase tracking-wider ${statusColor(app.status)}`}>{app.status}</span>
                </div>
                {expanded === app.id ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
              </button>

              {expanded === app.id && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    {app.color_primary && <div className="flex items-center gap-1"><div className="w-4 h-4 rounded" style={{ background: app.color_primary }} /><div className="w-4 h-4 rounded" style={{ background: app.color_accent }} /></div>}
                    <span>Captain Discord: {app.captain_discord}</span>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      <th className="py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Player</th>
                      <th className="py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Role</th>
                      <th className="py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">Riot ID</th>
                      <th className="py-2 text-left text-[10px] font-heading font-semibold uppercase tracking-wider text-text-muted">OP.GG</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {app.players.map((p, i) => (
                        <tr key={i}>
                          <td className="py-2 text-xs text-text-bright">{p.display_name}{p.is_captain && <span className="text-gold ml-1">C</span>}</td>
                          <td className="py-2 text-xs text-text-secondary uppercase">{p.role || "—"}</td>
                          <td className="py-2 text-xs text-text-secondary">{p.riot_id || "—"}</td>
                          <td className="py-2 text-xs">{p.opgg_link ? <a href={p.opgg_link} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-text-bright">View</a> : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {app.admin_notes && <p className="text-text-muted text-xs">Admin notes: {app.admin_notes}</p>}
                  {app.status === "pending" && (
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleApprove(app)} className="bg-green/20 hover:bg-green/30 text-green font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Approve</button>
                      {denyingId === app.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input value={denyNotes} onChange={e => setDenyNotes(e.target.value)} placeholder="Reason (optional)" className="flex-1 rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
                          <button onClick={() => handleDeny(app.id)} className="bg-red/20 hover:bg-red/30 text-red font-heading font-semibold text-xs uppercase tracking-wider px-3 py-2 rounded transition-colors cursor-pointer">Confirm</button>
                          <button onClick={() => setDenyingId(null)} className="text-text-muted text-xs cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDenyingId(app.id)} className="bg-red/20 hover:bg-red/30 text-red font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" /> Deny</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
