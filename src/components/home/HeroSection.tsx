import Link from "next/link";
import { ChevronRight, Swords } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-fpl-primary via-fpl-dark to-fpl-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(26,143,196,0.15),_transparent_60%)]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Swords className="h-5 w-5 text-fpl-accent" />
            <span className="text-fpl-accent font-semibold text-sm uppercase tracking-wider">
              Amateur Esports League
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Franchise</span>
            <br />
            <span className="text-fpl-accent">Premier League</span>
          </h1>

          <p className="text-lg md:text-xl text-fpl-muted max-w-xl mb-10 leading-relaxed">
            Compete in organized, franchise-style matches. Show your skills,
            climb the ranks, and prove yourself on the Rift.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-fpl-accent hover:bg-fpl-accent-hover text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-all duration-200 group"
            >
              Sign Up Now
              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 border-2 border-fpl-border hover:border-fpl-accent text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-all duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
