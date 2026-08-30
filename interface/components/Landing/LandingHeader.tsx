"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ArrowRight, Smartphone } from "lucide-react";

export function LandingHeader() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-2xl tracking-tight text-ink">
            Korasa
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex size-9 items-center justify-center rounded-full border border-rule text-ink-soft transition-colors hover:bg-paper-card hover:text-ink"
          >
            {theme === "dark" ? (
              <Sun className="size-4" strokeWidth={1.75} />
            ) : (
              <Moon className="size-4" strokeWidth={1.75} />
            )}
          </button>

          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:text-brand"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-onyx px-5 py-2 text-[14px] font-medium text-paper transition-opacity hover:opacity-90"
          >
            Start Studying
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex size-9 items-center justify-center rounded-full border border-rule text-ink-soft"
          >
            {theme === "dark" ? (
              <Sun className="size-4" strokeWidth={1.75} />
            ) : (
              <Moon className="size-4" strokeWidth={1.75} />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex size-9 items-center justify-center rounded-full border border-rule text-ink"
          >
            {mobileMenuOpen ? (
              <X className="size-5" strokeWidth={1.75} />
            ) : (
              <Menu className="size-5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-b border-rule bg-paper px-6 py-5 md:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3">
            <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-rule">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-rule py-2.5 text-[14px] font-medium text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-onyx py-2.5 text-[14px] font-medium text-paper"
              >
                Start Studying
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
              <a
                href="#download"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand/10 py-2.5 text-[14px] font-medium text-brand"
              >
                <Smartphone className="size-4" strokeWidth={1.75} />
                Get Android APK
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
