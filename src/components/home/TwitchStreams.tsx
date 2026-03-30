"use client";

import { Tv } from "lucide-react";
import type { TwitchEmbed } from "@/hooks/useLeagueData";

interface Props {
  embeds: TwitchEmbed[];
}

export function TwitchStreams({ embeds }: Props) {
  if (embeds.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Tv className="h-8 w-8 text-accent mx-auto mb-2" />
        <p className="text-text-muted text-xs">No streams configured yet.</p>
      </div>
    );
  }

  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

  return (
    <div className="space-y-3">
      {embeds.map(e => {
        if (e.embed_type === "channel" && e.channel_name) {
          return (
            <div key={e.id} className="card overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={`https://player.twitch.tv/?channel=${e.channel_name}&parent=${hostname}`}
                  width="100%" height="100%" allowFullScreen
                  className="w-full h-full"
                />
              </div>
              {e.title && (
                <div className="px-3 py-2 text-text-secondary text-xs">{e.title}</div>
              )}
            </div>
          );
        }
        if (e.embed_type === "youtube" && e.clip_url) {
          const match = e.clip_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
          const vid = match?.[1];
          if (!vid) return null;
          return (
            <div key={e.id} className="card overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${vid}`}
                  width="100%" height="100%" allowFullScreen
                  className="w-full h-full"
                />
              </div>
              {e.title && (
                <div className="px-3 py-2 text-text-secondary text-xs">{e.title}</div>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
