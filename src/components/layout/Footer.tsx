import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-fpl-dark border-t border-fpl-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-fpl-accent" />
            <span className="font-bold text-sm">
              Franchise Premier League
            </span>
          </div>
          <p className="text-fpl-muted text-sm">
            &copy; {new Date().getFullYear()} FPL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
