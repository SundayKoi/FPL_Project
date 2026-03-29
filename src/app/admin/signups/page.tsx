"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, ExternalLink, Search } from "lucide-react";
import type { Signup } from "@/types/signup";

export default function AdminSignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSignups();
  }, []);

  const fetchSignups = async () => {
    try {
      const res = await fetch("/api/signups");
      if (res.ok) {
        const data = await res.json();
        setSignups(data);
      }
    } catch {
      // Will be empty until Supabase is connected
    } finally {
      setLoading(false);
    }
  };

  const filteredSignups = signups.filter(
    (s) =>
      s.discordUsername.toLowerCase().includes(search.toLowerCase()) ||
      s.primaryRole.toLowerCase().includes(search.toLowerCase())
  );

  const statusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success" as const;
      case "rejected":
        return "danger" as const;
      default:
        return "warning" as const;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Player Signups</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fpl-muted" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-fpl-border bg-fpl-dark/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-fpl-accent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-fpl-accent animate-spin" />
        </div>
      ) : filteredSignups.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-fpl-muted">
            {signups.length === 0
              ? "No signups yet. They will appear here once players register."
              : "No signups match your search."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-fpl-border text-left">
                <th className="pb-3 text-sm font-medium text-fpl-muted">
                  Discord
                </th>
                <th className="pb-3 text-sm font-medium text-fpl-muted">
                  Role(s)
                </th>
                <th className="pb-3 text-sm font-medium text-fpl-muted">
                  Rank
                </th>
                <th className="pb-3 text-sm font-medium text-fpl-muted">
                  Peak
                </th>
                <th className="pb-3 text-sm font-medium text-fpl-muted">
                  OP.GG
                </th>
                <th className="pb-3 text-sm font-medium text-fpl-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fpl-border">
              {filteredSignups.map((signup) => (
                <tr key={signup.id} className="hover:bg-fpl-primary/20">
                  <td className="py-3 text-sm font-medium">
                    {signup.discordUsername}
                  </td>
                  <td className="py-3 text-sm text-fpl-muted">
                    {signup.primaryRole}
                    {signup.secondaryRole && ` / ${signup.secondaryRole}`}
                  </td>
                  <td className="py-3 text-sm text-fpl-muted">
                    {signup.currentRank}
                  </td>
                  <td className="py-3 text-sm text-fpl-muted">
                    {signup.peakRank}
                  </td>
                  <td className="py-3">
                    <a
                      href={signup.opggLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-fpl-accent hover:text-white text-sm transition-colors"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="py-3">
                    <Badge variant={statusVariant(signup.status)}>
                      {signup.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
