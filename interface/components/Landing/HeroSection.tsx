"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, Camera, Layers, Download } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";
import { MobileHomeScreenPreview } from "./MobileHomeScreenPreview";
import { useI18n } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { APK_DOWNLOAD_URL } from "@/app/utils/data";

export function HeroSection() {
  const { t, isRtl } = useI18n();
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.05 });

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden px-6 pt-12 pb-18 md:pt-20 md:pb-28 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.53_0.09_65/0.12),transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h1 className="font-display text-4xl leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {t("hero.headline")}{" "}
              <span className="italic text-brand">
                {t("hero.headlineHighlight")}
              </span>
              {t("hero.headlineSuffix")}
            </h1>

            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-ink-soft sm:text-[18px]">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-onyx px-6 py-3.5 text-[15px] font-medium text-paper shadow-sm transition-all duration-200 hover:bg-onyx/90 hover:shadow-md"
              >
                <span>{t("hero.ctaPrimary")}</span>
                <ArrowIcon
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  strokeWidth={2.2}
                />
              </Link>

              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink/[0.04] px-5 py-3.5 text-[14.5px] font-medium text-ink transition-all duration-200 hover:bg-ink/[0.08] hover:text-ink active:scale-[0.98]"
              >
                <Download className="size-4 text-ink-soft" strokeWidth={2} />
                <span>{t("hero.ctaSecondary")}</span>
              </a>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:col-span-5">
            <div
              className={`pointer-events-none absolute top-10 z-20 hidden rounded-2xl border border-rule bg-paper p-3 ring-1 ring-ink/5 sm:flex sm:items-center sm:gap-2.5 ${
                isRtl ? "-right-4 rotate-6" : "-left-4 -rotate-6"
              }`}
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Camera className="size-3.5" />
              </div>
              <div>
                <p className="font-mono text-[9.5px] font-semibold text-brand uppercase tracking-wider">
                  {t("hero.badgeCapture")}
                </p>
                <p className="text-[11.5px] font-medium text-ink">
                  {t("hero.badgeCaptureSub")}
                </p>
              </div>
            </div>

            <div
              className={`pointer-events-none absolute bottom-12 z-20 hidden rounded-2xl border border-rule bg-paper p-3 ring-1 ring-ink/5 sm:flex sm:items-center sm:gap-2.5 ${
                isRtl ? "-left-4 -rotate-6" : "-right-4 rotate-6"
              }`}
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-easy/10 text-easy">
                <Layers className="size-3.5" />
              </div>
              <div>
                <p className="font-mono text-[9.5px] font-semibold text-easy uppercase tracking-wider">
                  {t("hero.badgeExam")}
                </p>
                <p className="text-[11.5px] font-medium text-ink">
                  {t("hero.badgeExamSub")}
                </p>
              </div>
            </div>

            <PhoneMockup>
              <MobileHomeScreenPreview />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}
