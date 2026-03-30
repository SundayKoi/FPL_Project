"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar, type Tab } from "@/components/layout/Navbar";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { Footer } from "@/components/layout/Footer";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useLeagueData } from "@/hooks/useLeagueData";

// Home tab widgets
import { ScoreboardTicker } from "@/components/home/ScoreboardTicker";
import { WelcomeCard } from "@/components/home/WelcomeCard";
import { StandingsWidget } from "@/components/home/StandingsWidget";
import { PlayerLeaders } from "@/components/home/PlayerLeaders";
import { UpcomingSchedule } from "@/components/home/UpcomingSchedule";
import { TwitchStreams } from "@/components/home/TwitchStreams";

// View components
import { ScoresView } from "@/components/views/ScoresView";
import { ScheduleView } from "@/components/views/ScheduleView";
import { StandingsView } from "@/components/views/StandingsView";
import { StatsView } from "@/components/views/StatsView";
import { TeamsView } from "@/components/views/TeamsView";
import { PlayersView } from "@/components/views/PlayersView";
import { SignUpView } from "@/components/views/SignUpView";

import { Loader2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const { isMobile, isDesktop } = useWindowSize();
  const data = useLeagueData();
  const refreshRef = useRef<ReturnType<typeof setInterval>>(null);

  // Auto-refresh when live matches exist
  useEffect(() => {
    const hasLive = data.matches.some(m => m.status === "live");
    if (hasLive) {
      refreshRef.current = setInterval(data.refresh, 30000);
    }
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [data.matches, data.refresh]);

  const splitName = data.splits[0]
    ? `${data.splits[0].seasons?.name || "FPL"} — ${data.splits[0].name}`
    : undefined;

  if (data.loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} splitName={splitName} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Scores":
        return <ScoresView matches={data.matches} isMobile={isMobile} />;
      case "Schedule":
        return <ScheduleView matches={data.matches} isMobile={isMobile} />;
      case "Standings":
        return <StandingsView standings={data.standings} isMobile={isMobile} />;
      case "Stats":
        return <StatsView />;
      case "Teams":
        return <TeamsView teams={data.teams} rosters={data.rosters} standings={data.standings} isMobile={isMobile} />;
      case "Sign Up":
        return <SignUpView />;
      default:
        return renderHomeTab();
    }
  };

  const renderHomeTab = () => {
    if (isDesktop) {
      return (
        <div className="grid grid-cols-[280px_1fr_280px] gap-5">
          {/* Left column */}
          <div className="space-y-4">
            <WelcomeCard onSignUp={() => setActiveTab("Sign Up")} />
          </div>

          {/* Center column */}
          <div className="space-y-4">
            <TwitchStreams embeds={data.twitchEmbeds} />
            <UpcomingSchedule matches={data.matches} />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <StandingsWidget standings={data.standings} onViewStandings={() => setActiveTab("Standings")} />
            <PlayerLeaders players={data.players} />
          </div>
        </div>
      );
    }

    // Single column for tablet/mobile
    return (
      <div className="space-y-4">
        <WelcomeCard onSignUp={() => setActiveTab("Sign Up")} />
        <StandingsWidget standings={data.standings} onViewStandings={() => setActiveTab("Standings")} />
        <TwitchStreams embeds={data.twitchEmbeds} />
        <UpcomingSchedule matches={data.matches} />
        <PlayerLeaders players={data.players} />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} splitName={splitName} />
      <ScoreboardTicker matches={data.matches} isMobile={isMobile} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {renderContent()}
        </div>
      </main>

      <Footer />
      {isMobile && <MobileBottomBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
