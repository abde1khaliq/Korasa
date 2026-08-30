"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-rule bg-paper-card transition-colors">

      {/* Main Footer Links */}
      <div className="border-t border-rule py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand column */}
            <div className="md:col-span-1">
              <span className="font-display text-2xl tracking-tight text-ink">
                Korasa
              </span>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                The quiet study companion and exam generator built for focused students.
              </p>
            </div>

            {/* Navigation links */}
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-wider text-ink uppercase">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
                <li>
                  <a href="#how-it-works" className="hover:text-ink">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#download" className="hover:text-ink">
                    Android App
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] font-semibold tracking-wider text-ink uppercase">
                Quick Access
              </p>
              <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
                <li>
                  <Link href="/login" className="hover:text-ink">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-ink">
                    Create Account
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-ink">
                    FAQ & Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright line */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-rule pt-6 font-mono text-[12px] text-ink-faint sm:flex-row">
            <p>© {new Date().getFullYear()} Korasa. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
