"use client";

import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { StudyCycleSection } from "./StudyCycleSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { DownloadAppSection } from "./DownloadAppSection";
import { FaqSection } from "./FaqSection";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink transition-colors selection:bg-brand/20 selection:text-brand">
      <LandingHeader />
      <main>
        <HeroSection />
        <StudyCycleSection />
        <HowItWorksSection />
        <DownloadAppSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
