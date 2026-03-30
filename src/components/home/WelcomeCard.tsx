"use client";

import { Swords, ChevronRight } from "lucide-react";

interface Props {
  onSignUp: () => void;
}

export function WelcomeCard({ onSignUp }: Props) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-3">
        <Swords className="h-4 w-4 text-accent" />
        <span className="font-heading text-xs font-semibold uppercase tracking-wider text-accent">
          Amateur Esports League
        </span>
      </div>
      <h2 className="font-display text-3xl md:text-4xl text-text-bright mb-2">
        Franchise Premier League
      </h2>
      <p className="text-text-secondary text-sm leading-relaxed mb-4">
        Compete in organized, franchise-style matches. Show your skills,
        climb the ranks, and prove yourself on the Rift.
      </p>
      <button
        onClick={onSignUp}
        className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-sm uppercase tracking-wider px-5 py-2 rounded transition-colors cursor-pointer group"
      >
        Sign Up Now
        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
