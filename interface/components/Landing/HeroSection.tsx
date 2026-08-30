"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Folder,
  Layers,
  Sparkles,
  Smartphone,
} from "lucide-react";

export function HeroSection() {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <section className="relative overflow-hidden px-6 pt-12 pb-20 md:pt-20 md:pb-28">
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
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-onyx px-6 py-3.5 text-[15px] font-medium text-paper shadow-sm transition-all hover:bg-onyx/90 hover:shadow"
              >
                Get Started Free
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>

              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rule bg-paper-card px-5 py-3.5 text-[14px] font-medium text-ink transition-colors hover:border-brand/40 hover:bg-paper"
              >
                <Smartphone className="size-4 text-brand" />
                Download Android App
              </a>
            </div>
          </div>

          {/* Right Column: Realistic Interactive App Preview Card */}
          <div className="relative lg:col-span-5">
            {/* Ambient blur glow behind preview */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-brand/10 via-medium-soft/30 to-easy-soft/20 blur-xl opacity-70" />

            <div className="relative rounded-3xl border border-rule bg-paper p-5 shadow-2xl transition-all">
              {/* Card Top Bar: Subject Header */}
              <div className="flex items-center justify-between border-b border-rule pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Folder className="size-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                      Subject / Folder
                    </p>
                    <p className="text-[14px] font-medium text-ink">
                      Physics · Mechanics & Waves
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-paper-card border border-rule px-2.5 py-0.5 font-mono text-[11px] text-ink-soft">
                  18 saved
                </span>
              </div>

              {/* Sample Question Preview */}
              <div className="mt-4 rounded-2xl border border-rule bg-paper-card p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-medium-soft px-2.5 py-0.5 text-[12px] font-medium text-medium">
                      <span className="size-1.5 rounded-full bg-medium" />
                      Medium
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      #kinematics
                    </span>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                    <Camera className="size-3 text-ink-soft" />
                    OCR Scanned
                  </span>
                </div>

                <p className="mt-3 font-display text-[17px] leading-snug text-ink">
                  A projectile is launched at 30° with an initial velocity of 40 m/s. What is the maximum height reached?
                </p>

                {/* Solving Note */}
                <div className="mt-3 rounded-xl border border-rule/60 bg-paper/60 p-2.5 text-[12.5px] text-ink-soft">
                  <span className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-brand">
                    Solving Note:
                  </span>{" "}
                  Remember v_y = 0 at the peak. Use v_y² = u_y² - 2gh.
                </div>

                {/* Answer reveal button */}
                <div className="mt-3 border-t border-rule/60 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[13px] font-medium text-brand hover:bg-brand/5 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      {showAnswer ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                      {showAnswer ? "Hide Answer" : "Reveal Answer"}
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {showAnswer ? "▲" : "▼"}
                    </span>
                  </button>

                  {showAnswer && (
                    <div className="mt-2 rounded-xl bg-easy-soft/40 p-3 text-[13px] text-easy font-mono">
                      h_max = (40 × sin(30°))² / (2 × 9.8) ≈ 20.41 m
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Exam Generator Bar */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-onyx/5 p-3 text-[12.5px]">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-brand" />
                  <span className="font-medium text-ink">
                    Generate 10-Question Exam
                  </span>
                </div>
                <span className="font-mono text-[11px] font-medium text-brand">
                  Ready to test →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
