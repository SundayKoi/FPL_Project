"use client";

import { timeAgo } from "@/lib/utils";
import type { Article } from "@/hooks/useLeagueData";

interface Props {
  articles: Article[];
}

export function NewsFeed({ articles }: Props) {
  const news = articles.filter(a => a.article_type !== "hero").slice(0, 5);
  if (news.length === 0) return null;

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-bright">
          Top Stories
        </h3>
      </div>
      <div className="divide-y divide-border">
        {news.map(a => (
          <div key={a.id} className="px-4 py-3 hover:bg-bg3/50 transition-colors">
            {a.tag && (
              <span className="text-accent text-[10px] font-heading font-semibold uppercase tracking-wider">
                {a.tag}
              </span>
            )}
            <h4 className="text-xs font-medium text-text-bright mt-0.5 leading-snug">
              {a.title}
            </h4>
            <span className="text-text-dim text-[10px]">
              {a.author && `${a.author} · `}{timeAgo(a.published_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
