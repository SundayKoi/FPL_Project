import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function teamInitial(name?: string): string {
  return (name || "?").charAt(0).toUpperCase();
}

export function timeAgo(d?: string): string {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function fmtTime(d?: string): string {
  if (!d) return "";
  const dt = new Date(d);
  const t = dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const diff = Math.floor((dt.getTime() - Date.now()) / 86400000);
  if (diff === 0) return `Today · ${t}`;
  if (diff === 1) return `Tomorrow · ${t}`;
  return dt.toLocaleDateString([], { month: "short", day: "numeric" }) + ` · ${t}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}
