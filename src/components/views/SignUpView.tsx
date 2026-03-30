"use client";

import { useState } from "react";
import { db } from "@/lib/supabase";
import { CheckCircle, Loader2 } from "lucide-react";

const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"];
const RANKS = [
  "Platinum 4", "Platinum 3", "Platinum 2", "Platinum 1",
  "Emerald 4", "Emerald 3", "Emerald 2", "Emerald 1",
  "Diamond 4", "Diamond 3", "Diamond 2", "Diamond 1",
];

export function SignUpView() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [discord, setDiscord] = useState("");
  const [opgg, setOpgg] = useState("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [secondaryRole, setSecondaryRole] = useState("");
  const [currentRank, setCurrentRank] = useState("");
  const [peakRank, setPeakRank] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!discord || !opgg || !primaryRole || !currentRank || !peakRank) {
      setError("Please fill out all required fields.");
      return;
    }
    if (secondaryRole && secondaryRole === primaryRole) {
      setError("Secondary role must be different from primary role.");
      return;
    }
    if (!opgg.includes("op.gg")) {
      setError("Please enter a valid op.gg link.");
      return;
    }

    setSubmitting(true);
    try {
      await db("player_applications", {
        method: "POST",
        body: {
          discord_username: discord,
          opgg_link: opgg,
          primary_role: primaryRole,
          secondary_role: secondaryRole || null,
          current_rank: currentRank,
          peak_rank: peakRank,
          status: "pending",
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="card max-w-lg mx-auto text-center p-10">
        <CheckCircle className="h-14 w-14 text-green mx-auto mb-4" />
        <h2 className="font-display text-2xl text-text-bright mb-2">You&apos;re In!</h2>
        <p className="text-text-secondary text-sm">
          Your application has been submitted. We&apos;ll reach out on Discord with next steps.
        </p>
      </div>
    );
  }

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-text-bright mb-2">Player Sign Up</h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto">
          Fill out the form below to apply for the next FPL season. All fields are required unless marked optional.
        </p>
      </div>

      <div className="card max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="discord" className={labelClass}>Discord Username</label>
            <input id="discord" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="username" className={inputClass} required />
          </div>

          <div>
            <label htmlFor="opgg" className={labelClass}>OP.GG Link</label>
            <input id="opgg" value={opgg} onChange={e => setOpgg(e.target.value)} placeholder="https://www.op.gg/summoners/na/YourName-TAG" className={inputClass} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="primary-role" className={labelClass}>Primary Role</label>
              <select id="primary-role" value={primaryRole} onChange={e => setPrimaryRole(e.target.value)} className={selectClass} required>
                <option value="">Select role...</option>
                {ROLES.map(r => <option key={r} value={r} className="bg-bg2">{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="secondary-role" className={labelClass}>Secondary Role (Optional)</label>
              <select id="secondary-role" value={secondaryRole} onChange={e => setSecondaryRole(e.target.value)} className={selectClass}>
                <option value="">Select role...</option>
                {ROLES.map(r => <option key={r} value={r} className="bg-bg2">{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="current-rank" className={labelClass}>Current Rank</label>
              <select id="current-rank" value={currentRank} onChange={e => setCurrentRank(e.target.value)} className={selectClass} required>
                <option value="">Select rank...</option>
                {RANKS.map(r => <option key={r} value={r} className="bg-bg2">{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="peak-rank" className={labelClass}>Peak Rank (Past 2 Splits)</label>
              <select id="peak-rank" value={peakRank} onChange={e => setPeakRank(e.target.value)} className={selectClass} required>
                <option value="">Select rank...</option>
                {RANKS.map(r => <option key={r} value={r} className="bg-bg2">{r}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-red text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-sm uppercase tracking-wider py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
