"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Layers,
  Smartphone,
} from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";
import { MobileHomeScreenPreview } from "./MobileHomeScreenPreview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-12 pb-20 md:pt-18 md:pb-28">
      {/* Subtle paper-like background radial glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.53_0.09_65/0.12),transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Editorial & Value Proposition */}
          <div className="lg:col-span-7">

            {/* Main Headline */}
            <h1 className="mt-6 font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              The questions worth{" "}
              <span className="italic text-brand">remembering</span>, ready for
              your next exam.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft sm:text-[18px]">
              Snap or type tricky questions you encounter while studying,
              organize them by subject and folder, then generate custom practice
              exams from your own question bank.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/register"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-onyx px-6 py-3.5 text-[15px] font-medium text-paper shadow-sm transition-all hover:bg-onyx/90 hover:shadow"
              >
                Open Korasa in your browser
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>

              <a
                href="#download"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-rule bg-paper-card px-5 py-3.5 text-[14px] font-medium text-ink transition-colors hover:border-brand/40 hover:bg-paper"
              >
                Download the Android App
              </a>
            </div>
          </div>

          {/* Right Column: Realistic Phone Mockup with Actual Application UI */}
          <div className="relative flex items-center justify-center lg:col-span-5">
            {/* Soft backdrop halo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-gradient-to-tr from-brand/15 via-medium-soft/20 to-easy-soft/20 blur-2xl"
            />

            {/* Floating Fragment Card 1: Camera OCR (Top Left) */}
            <div className="pointer-events-none absolute -left-4 top-10 z-20 hidden -rotate-6 rounded-2xl border border-rule bg-paper/95 p-3 shadow-lg backdrop-blur-md sm:flex sm:items-center sm:gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Camera className="size-3.5" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold text-brand uppercase">
                  Capture Question
                </p>
                <p className="text-[11.5px] font-medium text-ink">
                  Snap & Save
                </p>
              </div>
            </div>

            {/* Floating Fragment Card 2: Exam Generator (Bottom Right) */}
            <div className="pointer-events-none absolute -right-4 bottom-12 z-20 hidden rotate-6 rounded-2xl border border-rule bg-paper/95 p-3 shadow-lg backdrop-blur-md sm:flex sm:items-center sm:gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-easy/10 text-easy">
                <Layers className="size-3.5" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold text-easy uppercase">
                  Exam Mode
                </p>
                <p className="text-[11.5px] font-medium text-ink">
                  Instant Mock Tests
                </p>
              </div>
            </div>

            {/* Authentic Mobile Phone Mockup */}
            <PhoneMockup>
              <MobileHomeScreenPreview />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}
