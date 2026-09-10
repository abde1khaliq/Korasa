"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  Languages,
  ChevronDown,
  Check,
} from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";

export function LandingHeader() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale, isRtl } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideDesktop = desktopLangRef.current?.contains(target);
      const insideMobile = mobileLangRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
        setLangDropdownOpen(false);
      }
    }

    if (langDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langDropdownOpen]);

  const selectLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule/70 bg-paper/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 transition-transform duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <span className="font-display text-2xl font-medium tracking-tight text-ink">
            {locale === "ar" ? "كراسة" : "Korasa"}
          </span>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          {/* Language Selection Dropdown */}
          <div className="relative" ref={desktopLangRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-all duration-150 hover:bg-ink/5 hover:text-ink focus:outline-hidden"
              aria-label={t("header.language")}
              aria-expanded={langDropdownOpen}
            >
              <Languages className="size-3.5 text-ink-soft" strokeWidth={2} />
              <span>{locale === "ar" ? "العربية" : "English"}</span>
              <ChevronDown
                className={`size-3 text-ink-faint transition-transform duration-200 ${
                  langDropdownOpen ? "rotate-180 text-ink" : ""
                }`}
                strokeWidth={2.2}
              />
            </button>

            {/* Dropdown Menu */}
            {langDropdownOpen && (
              <div className="absolute top-full mt-2 end-0 z-50 w-44 overflow-hidden rounded-2xl bg-paper/95 p-1.5 shadow-xl shadow-ink/10 backdrop-blur-md ring-1 ring-ink/10 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => selectLanguage("en")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                    locale === "en"
                      ? "bg-ink/5 text-ink"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <span>English</span>
                  {locale === "en" && (
                    <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => selectLanguage("ar")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                    locale === "ar"
                      ? "bg-ink/5 text-ink"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <span>Arabic</span>
                  {locale === "ar" && (
                    <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={t("header.toggleTheme")}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-all duration-150 hover:bg-ink/5 hover:text-ink"
          >
            {theme === "dark" ? (
              <Sun className="size-4" strokeWidth={1.75} />
            ) : (
              <Moon className="size-4" strokeWidth={1.75} />
            )}
          </button>

          {/* Primary CTA ("Start Studying") */}
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-onyx px-4.5 py-2 text-[13.5px] font-medium text-paper shadow-sm transition-all duration-200 hover:bg-onyx/90 hover:shadow hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t("header.startStudying")}</span>
            <ArrowIcon className="size-3.5" strokeWidth={2.2} />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          {/* Mobile Language Button / Dropdown trigger */}
          <div className="relative" ref={mobileLangRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label={t("header.language")}
            >
              <Languages className="size-3.5" />
              <span>{locale === "ar" ? "عربي" : "EN"}</span>
              <ChevronDown className="size-2.5 text-ink-faint" />
            </button>

            {/* Mobile Language Dropdown */}
            {langDropdownOpen && (
              <div className="absolute top-full mt-2 end-0 z-50 w-40 overflow-hidden rounded-2xl bg-paper/95 p-1.5 shadow-xl shadow-ink/10 backdrop-blur-md ring-1 ring-ink/10 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => selectLanguage("en")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-medium transition-colors ${
                    locale === "en"
                      ? "bg-ink/5 text-ink"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <span>English</span>
                  {locale === "en" && (
                    <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => selectLanguage("ar")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-medium transition-colors ${
                    locale === "ar"
                      ? "bg-ink/5 text-ink"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <span>Arabic</span>
                  {locale === "ar" && (
                    <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={t("header.toggleTheme")}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5"
          >
            {theme === "dark" ? (
              <Sun className="size-4" strokeWidth={1.75} />
            ) : (
              <Moon className="size-4" strokeWidth={1.75} />
            )}
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("header.toggleMenu")}
            className="flex size-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
          >
            {mobileMenuOpen ? (
              <X className="size-4.5" strokeWidth={2} />
            ) : (
              <Menu className="size-4.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-b border-rule/70 bg-paper/95 px-6 py-4 backdrop-blur-md md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-onyx py-3 text-[14px] font-medium text-paper shadow-sm transition-transform active:scale-[0.98]"
            >
              <span>{t("header.startStudying")}</span>
              <ArrowIcon className="size-4" strokeWidth={2} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
