"use client";

import { timeAgo } from "@/lib/utils";
import type { Article } from "@/hooks/useLeagueData";

interface Props {
  articles: Article[];
}

export function HeroArticle({ articles }: Props) {
  const hero = articles.find(a => a.article_type === "hero") || articles[0];
  if (!hero) return null;

  return (
    <div className="card overflow-hidden">
      {hero.image_url && (
        <img src={hero.image_url} alt={hero.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        {hero.tag && (
          <span className="text-accent text-[10px] font-heading font-semibold uppercase tracking-wider">
            {hero.tag}
          </span>
        )}
        <h3 className="font-heading text-base font-semibold text-text-bright mt-1 leading-tight">
          {hero.title}
        </h3>
        {hero.subtitle && (
          <p className="text-text-secondary text-xs mt-1 line-clamp-2">{hero.subtitle}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-text-dim text-[10px]">
          {hero.author && <span>{hero.author}</span>}
          {hero.published_at && <span>· {timeAgo(hero.published_at)}</span>}
        </div>
      </div>
    </div>
  );
}
