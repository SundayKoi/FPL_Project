"use client";

import { Tv, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StreamSectionProps {
  twitchChannel?: string;
}

export function StreamSection({ twitchChannel = "" }: StreamSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-fpl-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-fpl-accent">Live</span> Broadcast
          </h2>
          <p className="text-fpl-muted text-lg">
            Catch all FPL matches live on Twitch
          </p>
        </div>

        {twitchChannel ? (
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden border border-fpl-border">
              <iframe
                src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`}
                height="100%"
                width="100%"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          <Card className="max-w-xl mx-auto text-center py-12">
            <Tv className="h-16 w-16 text-fpl-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Stream Coming Soon</h3>
            <p className="text-fpl-muted mb-6">
              Our Twitch channel will be linked here once set up. Stay tuned for
              live FPL matches!
            </p>
            <a
              href="https://twitch.tv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-fpl-accent hover:text-white transition-colors"
            >
              Visit Twitch <ExternalLink className="h-4 w-4" />
            </a>
          </Card>
        )}
      </div>
    </section>
  );
}
