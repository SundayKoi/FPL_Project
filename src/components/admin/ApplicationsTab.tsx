"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Application {
  id: string;
  discord_username: string;
  opgg_link: string;
  primary_role: string;
  secondary_role?: string;
  current_rank: string;
  peak_rank: string;
  status: string;
  admin_notes?: string;
  created_at: string;
}

export function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [denyNotes, setDenyNotes] = useState("");
  const [denyingId, setDenyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await db("player_applications", { query: "?select=*&order=created_at.desc" });
      setApps(data || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (app: Application) => {
    if (!confirm(`Approve "${app.discord_username}"?`)) return;
    try {
      await db("player_applications", { method: "PATCH", body: { status: "approved" }, query: `?id=eq.${app.id}` });
      setToast({ msg: `${app.discord_username} approved`, type: "success" });
      await load();
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" });
    }
  };

  const handleDeny = async (id: string) => {
    try {
      await db("player_applications", { method: "PATCH", body: { status: "denied", admin_notes: denyNotes || null }, query: `?id=eq.${id}` });
      setToast({ msg: "Application denied", type: "success" });
      setDenyingId(null); setDenyNotes(""); await load();
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" });
    }
  };

  const statusColor = (s: string) => s === "approved" ? "text-green" : s === "denied" ? "text-red" : "text-gold";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-2xl text-text-bright">Player Applications</h2>

      {apps.length === 0 ? (
        <div className="card p-8 text-center text-text-muted text-sm">No applications yet. Players can apply from the &quot;Sign Up&quot; tab on the homepage.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Discord</th>
                  <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Role(s)</th>
                  <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Peak</th>
                  <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">OP.GG</th>
                  <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apps.map(app => (
                  <tr key={app.id} className="hover:bg-bg3/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-bright font-medium">{app.discord_username}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {app.primary_role}
                      {app.secondary_role && ` / ${app.secondary_role}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{app.current_rank}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{app.peak_rank}</td>
                    <td className="px-4 py-3">
                      <a href={app.opgg_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:text-text-bright text-xs transition-colors">
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{formatDate(app.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-heading font-semibold uppercase tracking-wider ${statusColor(app.status)}`}>{app.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {app.status === "pending" && (
                        <div className="flex items-center justify-end gap-1.5">
                          {denyingId === app.id ? (
                            <div className="flex items-center gap-1.5">
                              <input value={denyNotes} onChange={e => setDenyNotes(e.target.value)} placeholder="Reason..." className="w-28 rounded border border-border bg-bg-input px-2 py-1 text-text-bright text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
                              <button onClick={() => handleDeny(app.id)} className="p-1.5 rounded text-red hover:bg-red/10 transition-colors cursor-pointer"><XCircle className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setDenyingId(null)} className="text-text-muted text-[10px] cursor-pointer">Cancel</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handleApprove(app)} className="p-1.5 rounded text-green hover:bg-green/10 transition-colors cursor-pointer" title="Approve"><CheckCircle className="h-4 w-4" /></button>
                              <button onClick={() => setDenyingId(app.id)} className="p-1.5 rounded text-red hover:bg-red/10 transition-colors cursor-pointer" title="Deny"><XCircle className="h-4 w-4" /></button>
                            </>
                          )}
                        </div>
                      )}
                      {app.admin_notes && <p className="text-text-dim text-[10px] mt-1">{app.admin_notes}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
