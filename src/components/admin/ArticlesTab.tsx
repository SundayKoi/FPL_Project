"use client";

import { useState, useEffect, useCallback } from "react";
import { db, uploadFile } from "@/lib/supabase";
import { Toast } from "@/components/Toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Article { id: string; title: string; subtitle?: string; body?: string; tag?: string; article_type?: string; author?: string; published_at?: string; is_published?: boolean; image_url?: string; }

export function ArticlesTab() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const [author, setAuthor] = useState("");
  const [articleType, setArticleType] = useState("news");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const load = useCallback(async () => {
    const data = await db("articles", { query: "?select=*&order=created_at.desc" });
    setArticles(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setTitle(""); setSubtitle(""); setBody(""); setTag(""); setAuthor(""); setArticleType("news"); setImageFile(null); setImageUrl(""); setEditing(null); setShowForm(false); };

  const openEdit = (a: Article) => {
    setEditing(a); setTitle(a.title); setSubtitle(a.subtitle || ""); setBody(a.body || ""); setTag(a.tag || ""); setAuthor(a.author || ""); setArticleType(a.article_type || "news"); setImageUrl(a.image_url || ""); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      let finalImage = imageUrl;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        finalImage = await uploadFile("articles_images", `${Date.now()}_${title.replace(/\s+/g, "-").toLowerCase()}.${ext}`, imageFile);
      }
      const data: Record<string, unknown> = { title, subtitle: subtitle || null, body: body || null, tag: tag || null, author: author || null, article_type: articleType, image_url: finalImage || null };
      if (editing) {
        await db("articles", { method: "PATCH", body: data, query: `?id=eq.${editing.id}` });
        setToast({ msg: "Article updated", type: "success" });
      } else {
        await db("articles", { method: "POST", body: data });
        setToast({ msg: "Article created", type: "success" });
      }
      resetForm(); await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const togglePublish = async (a: Article) => {
    const isPublished = !a.is_published;
    try {
      await db("articles", { method: "PATCH", body: { is_published: isPublished, published_at: isPublished ? new Date().toISOString() : null }, query: `?id=eq.${a.id}` });
      await load();
    } catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try { await db("articles", { method: "DELETE", query: `?id=eq.${id}` }); setToast({ msg: "Deleted", type: "success" }); await load(); }
    catch (err) { setToast({ msg: err instanceof Error ? err.message : "Failed", type: "error" }); }
  };

  const inputClass = "w-full rounded border border-border bg-bg-input px-3 py-2 text-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const labelClass = "block text-xs font-heading font-semibold uppercase tracking-wider text-text-secondary mb-1.5";
  const typeColor = (t?: string) => t === "hero" ? "bg-purple-500/20 text-purple-400" : t === "feature" ? "bg-blue/20 text-blue" : "bg-bg3 text-text-muted";

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-text-bright">Articles</h2>
        <button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New Article</button>
      </div>

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={labelClass}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Subtitle</label><input value={subtitle} onChange={e => setSubtitle(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Body</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className={`${inputClass} resize-none`} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelClass}>Tag</label><input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. ROSTER MOVES" className={inputClass} /></div>
              <div><label className={labelClass}>Author</label><input value={author} onChange={e => setAuthor(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Type</label><select value={articleType} onChange={e => setArticleType(e.target.value)} className={`${inputClass} appearance-none`}><option value="news">News</option><option value="feature">Feature</option><option value="hero">Hero</option></select></div>
            </div>
            <div><label className={labelClass}>Image</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-xs text-text-muted" /><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Or paste URL..." className={`${inputClass} mt-1`} /></div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors disabled:opacity-50 cursor-pointer">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              <button type="button" onClick={resetForm} className="text-text-muted hover:text-text-bright text-xs font-heading font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-bg3 transition-colors cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Title</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Type</th>
            <th className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Author</th>
            <th className="px-4 py-3 text-center text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Published</th>
            <th className="px-4 py-3 text-right text-xs font-heading font-semibold uppercase tracking-wider text-text-muted">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {articles.map(a => (
              <tr key={a.id} className="hover:bg-bg3/50 transition-colors">
                <td className="px-4 py-3 text-sm text-text-bright max-w-[200px] truncate">{a.title}</td>
                <td className="px-4 py-3"><span className={`text-[10px] font-heading font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeColor(a.article_type)}`}>{a.article_type}</span></td>
                <td className="px-4 py-3 text-xs text-text-secondary">{a.author || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => togglePublish(a)} className="cursor-pointer">{a.is_published ? <Eye className="h-4 w-4 text-green mx-auto" /> : <EyeOff className="h-4 w-4 text-text-muted mx-auto" />}</button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded text-text-muted hover:text-text-bright hover:bg-bg3 transition-colors cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors cursor-pointer ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && <div className="p-8 text-center text-text-muted text-sm">No articles yet.</div>}
      </div>
    </div>
  );
}
