"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Film,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Signups", href: "/admin/signups", icon: Users },
  { label: "VODs", href: "/admin/vods", icon: Film },
  { label: "Master Sheet", href: "/admin/sheets", icon: FileSpreadsheet },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();
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
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <Trophy className="h-10 w-10 text-fpl-accent mx-auto mb-3" />
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="text-fpl-muted text-sm mt-1">
              Sign in to manage FPL
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fpl-light mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-fpl-border bg-fpl-dark/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-fpl-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fpl-light mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-fpl-border bg-fpl-dark/50 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-fpl-accent"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-fpl-accent hover:bg-fpl-accent-hover text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-fpl-dark border-r border-fpl-border pt-20 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:pt-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-fpl-border lg:block hidden">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-fpl-accent" />
            <span className="font-bold">FPL Admin</span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-fpl-accent/10 text-fpl-accent"
                  : "text-fpl-muted hover:text-white hover:bg-fpl-primary/50"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fpl-muted hover:text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-fpl-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-fpl-muted hover:text-white hover:bg-fpl-primary/50 cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">FPL Admin</span>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
