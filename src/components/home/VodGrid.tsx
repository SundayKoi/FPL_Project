import { Play, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate, getYouTubeThumbnail } from "@/lib/utils";
import type { Vod } from "@/types/vod";

// Placeholder data until Supabase is connected
const placeholderVods: Vod[] = [
  {
    id: "1",
    title: "FPL Season 1 - Week 1 Highlights",
    url: "https://youtube.com/watch?v=example1",
    matchDate: "2026-03-15",
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    title: "FPL Draft Day Recap",
    url: "https://youtube.com/watch?v=example2",
    matchDate: "2026-03-10",
    createdAt: "2026-03-10",
  },
  {
    id: "3",
    title: "Championship Preview Show",
    url: "https://youtube.com/watch?v=example3",
    matchDate: "2026-03-08",
    createdAt: "2026-03-08",
  },
];

interface VodGridProps {
  vods?: Vod[];
}

export function VodGrid({ vods = placeholderVods }: VodGridProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Recent <span className="text-fpl-accent">VODs</span>
          </h2>
          <p className="text-fpl-muted text-lg">
            Watch past matches and highlights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vods.map((vod) => {
            const thumbnail =
              vod.thumbnailUrl || getYouTubeThumbnail(vod.url);

            return (
              <a
                key={vod.id}
                href={vod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card hover className="p-0 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-fpl-primary flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={vod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Play className="h-12 w-12 text-fpl-accent" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-fpl-accent transition-colors">
                      {vod.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-fpl-muted text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(vod.matchDate)}</span>
                    </div>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
