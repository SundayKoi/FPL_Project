import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { StreamSection } from "@/components/home/StreamSection";
import { VodGrid } from "@/components/home/VodGrid";
import { CtaSection } from "@/components/home/CtaSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <StreamSection />
      <VodGrid />
      <CtaSection />
    </>
  );
}
