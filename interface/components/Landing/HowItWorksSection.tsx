"use client";

import {
  FolderPlus,
  Camera,
  Target,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

export function HowItWorksSection() {
  const { t } = useI18n();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  const steps = [
    {
      num: "01",
      icon: FolderPlus,
      tagKey: "howItWorks.step1Tag" as const,
      titleKey: "howItWorks.step1Title" as const,
      descKey: "howItWorks.step1Desc" as const,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      num: "02",
      icon: Camera,
      tagKey: "howItWorks.step2Tag" as const,
      titleKey: "howItWorks.step2Title" as const,
      descKey: "howItWorks.step2Desc" as const,
      color: "text-medium",
      bg: "bg-medium-soft",
    },
    {
      num: "03",
      icon: Target,
      tagKey: "howItWorks.step3Tag" as const,
      titleKey: "howItWorks.step3Title" as const,
      descKey: "howItWorks.step3Desc" as const,
      color: "text-easy",
      bg: "bg-easy-soft",
    },
    {
      num: "04",
      icon: RotateCcw,
      tagKey: "howItWorks.step4Tag" as const,
      titleKey: "howItWorks.step4Title" as const,
      descKey: "howItWorks.step4Desc" as const,
      color: "text-hard",
      bg: "bg-hard-soft",
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className={`py-18 md:py-24 px-6 border-t border-rule/60 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-brand uppercase">
            {t("howItWorks.badge")}
          </span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* 4 Sleek Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group relative flex flex-col justify-between rounded-3xl bg-paper-card/70 p-6 ring-1 ring-ink/[0.04] transition-all duration-300 hover:-translate-y-1 hover:bg-paper-card hover:shadow-lg hover:shadow-ink/[0.03] hover:ring-brand/20 sm:p-7"
                style={{
                  transitionDelay: `${idx * 75}ms`,
                }}
              >
                <div>
                  {/* Top Bar: Icon + Step Index */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-11 items-center justify-center rounded-2xl ${step.bg} ${step.color} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon className="size-5" strokeWidth={1.8} />
                    </div>
                    <span className="font-mono text-[11px] font-semibold tracking-wider text-ink-faint">
                      {step.num}
                    </span>
                  </div>

                  {/* Step Category & Title */}
                  <div className="mt-5">
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-brand uppercase">
                      {t(step.tagKey)}
                    </span>
                    <h3 className="mt-1 font-display text-[19px] leading-snug text-ink">
                      {t(step.titleKey)}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
