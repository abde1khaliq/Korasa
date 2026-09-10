"use client";

import { I18nProvider } from "@/lib/i18n";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { FaqSection } from "./FaqSection";
import { LandingFooter } from "./LandingFooter";
import { CookieConsentBanner } from "@/components/CookieConsent/CookieConsentBanner";

export function LandingPage() {
  return (
    <I18nProvider>
      <div className="min-h-screen bg-paper text-ink transition-colors selection:bg-brand/20 selection:text-brand">
        <LandingHeader />
        <main>
          <HeroSection />
          <HowItWorksSection />
          <FaqSection />
        </main>
        <LandingFooter />
        <CookieConsentBanner />
      </div>
    </I18nProvider>
  );
}
