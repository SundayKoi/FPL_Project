import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-bg2 border-t border-border py-6 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          <span className="font-heading text-sm font-semibold tracking-wider uppercase text-text-bright">
            Franchise Premier League
          </span>
        </div>
        <p className="text-text-muted text-xs">
          &copy; {new Date().getFullYear()} FPL. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
