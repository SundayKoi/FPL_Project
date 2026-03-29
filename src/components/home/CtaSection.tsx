import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-fpl-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to <span className="text-fpl-accent">Compete</span>?
        </h2>
        <p className="text-fpl-muted text-lg max-w-xl mx-auto mb-8">
          Sign up now and join the next season of the Franchise Premier League.
          Show us what you&apos;ve got.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-fpl-accent hover:bg-fpl-accent-hover text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-all duration-200 group"
        >
          Player Sign Up
          <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
