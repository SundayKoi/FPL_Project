"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-fpl-dark/90 backdrop-blur-md border-b border-fpl-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Trophy className="h-8 w-8 text-fpl-accent group-hover:text-white transition-colors" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-fpl-accent">F</span>
              <span className="text-white">P</span>
              <span className="text-fpl-accent">L</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-fpl-muted hover:text-white hover:bg-fpl-primary/50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-fpl-accent hover:bg-fpl-accent-hover text-white transition-all duration-200"
            >
              Admin
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-fpl-muted hover:text-white hover:bg-fpl-primary/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <div className="px-4 pb-4 space-y-1 border-t border-fpl-border">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-fpl-muted hover:text-white hover:bg-fpl-primary/50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-fpl-accent hover:bg-fpl-primary/50 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
