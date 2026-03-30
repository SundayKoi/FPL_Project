"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Shield, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem("fpl-admin-auth");
    if (auth === "true") setAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      sessionStorage.setItem("fpl-admin-auth", "true");
      setAuthenticated(true);
    } else {
      setError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fpl-admin-auth");
    setAuthenticated(false);
    router.push("/");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="h-8 w-8 text-accent" />
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <h1 className="font-display text-2xl text-text-bright">Admin Login</h1>
            <p className="text-text-muted text-xs mt-1">Sign in to manage FPL</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-border bg-bg-input px-3 py-2.5 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            {error && <p className="text-red text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-sm uppercase tracking-wider py-2.5 rounded transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Admin top bar */}
      <header className="bg-bg2 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-text-muted hover:text-text-bright transition-colors text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="font-display text-xl text-text-bright">FPL</span>
              <span className="bg-accent/20 text-accent text-[10px] font-heading font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-text-muted hover:text-red text-xs transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}
