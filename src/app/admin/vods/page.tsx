"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Play,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Vod } from "@/types/vod";

export default function AdminVodsPage() {
  const [vods, setVods] = useState<Vod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vod | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVods();
  }, []);

  const fetchVods = async () => {
    try {
      const res = await fetch("/api/vods");
      if (res.ok) {
        const data = await res.json();
        setVods(data);
      }
    } catch {
      // Will be empty until Supabase is connected
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setThumbnailUrl("");
    setMatchDate("");
    setFormError("");
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (vod: Vod) => {
    setEditing(vod);
    setTitle(vod.title);
    setUrl(vod.url);
    setThumbnailUrl(vod.thumbnailUrl || "");
    setMatchDate(vod.matchDate);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const body = { title, url, thumbnailUrl, matchDate };
      const res = await fetch("/api/vods", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...body, id: editing.id } : body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save VOD");
      }

      await fetchVods();
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this VOD?")) return;

    try {
      await fetch("/api/vods", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchVods();
    } catch {
      // Handle error
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">VOD Manager</h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add VOD
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editing ? "Edit VOD" : "Add New VOD"}
            </h2>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg text-fpl-muted hover:text-white hover:bg-fpl-primary/50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="vod-title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="FPL Week 1 - Team A vs Team B"
              required
            />
            <Input
              id="vod-url"
              label="Video URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
            <Input
              id="vod-thumbnail"
              label="Thumbnail URL (optional, auto-derived for YouTube)"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
            />
            <Input
              id="vod-date"
              label="Match Date"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              required
            />
            {formError && (
              <p className="text-red-400 text-sm">{formError}</p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : null}
                {editing ? "Update" : "Add"} VOD
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* VOD list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-fpl-accent animate-spin" />
        </div>
      ) : vods.length === 0 ? (
        <Card className="text-center py-12">
          <Play className="h-12 w-12 text-fpl-accent mx-auto mb-3" />
          <p className="text-fpl-muted">
            No VODs yet. Click &quot;Add VOD&quot; to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {vods.map((vod) => (
            <Card key={vod.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{vod.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-fpl-muted text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(vod.matchDate)}
                  </span>
                  <a
                    href={vod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fpl-accent text-xs hover:text-white transition-colors"
                  >
                    Watch
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(vod)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(vod.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
