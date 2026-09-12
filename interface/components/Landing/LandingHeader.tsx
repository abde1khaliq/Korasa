"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
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

  const headerRef = useRef<HTMLElement>(null);
  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideDesktop = desktopLangRef.current?.contains(target);
      const insideMobile = mobileLangRef.current?.contains(target);
      const insideHeader = headerRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
        setLangDropdownOpen(false);
      }
      if (!insideHeader) {
        setMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLangDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    if (langDropdownOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [langDropdownOpen, mobileMenuOpen]);

  const selectLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full border-b border-rule/70 bg-paper/85 backdrop-blur-md transition-colors"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2 transition-transform duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <span className="font-display text-2xl font-medium tracking-tight text-ink">
            {locale === "ar" ? "كراسة" : "Korasa"}
          </span>
        </Link>

        <div className="hidden items-center gap-2.5 md:flex">
          <div className="relative" ref={desktopLangRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[15px] transition-all duration-150 hover:bg-ink/5 focus:outline-hidden"
              aria-label={t("header.language")}
              aria-expanded={langDropdownOpen}
            >
              <span>{locale === "ar" ? "🇪🇬" : "🇺🇸"}</span>
              <ChevronDown
                className={`size-3 text-ink-faint transition-transform duration-200 ${
                  langDropdownOpen ? "rotate-180 text-ink" : ""
                }`}
                strokeWidth={2.2}
              />
            </button>

            <div
              className={`absolute top-full mt-2 end-0 z-50 w-44 overflow-hidden rounded-2xl bg-paper/95 p-1.5 transition-all duration-200 ease-out ${
                isRtl ? "origin-top-left" : "origin-top-right"
              } ${
                langDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                  : "opacity-0 scale-95 -translate-y-1.5 pointer-events-none invisible"
              }`}
              aria-hidden={!langDropdownOpen}
            >
              <button
                type="button"
                tabIndex={langDropdownOpen ? 0 : -1}
                onClick={() => selectLanguage("en")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors mb-1 ${
                  locale === "en"
                    ? "bg-ink/5 text-ink"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <span>🇺🇸 English (US)</span>
                {locale === "en" && (
                  <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                )}
              </button>

              <button
                type="button"
                tabIndex={langDropdownOpen ? 0 : -1}
                onClick={() => selectLanguage("ar")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                  locale === "ar"
                    ? "bg-ink/5 text-ink"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <span>🇪🇬 Arabic (AR)</span>
                {locale === "ar" && (
                  <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-onyx px-4.5 py-2 text-[13.5px] font-medium text-paper shadow-sm transition-all duration-200 hover:bg-onyx/90 hover:shadow"
          >
            <span>{t("header.startStudying")}</span>
            <ArrowIcon className="size-3.5" strokeWidth={2.2} />
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <div className="relative" ref={mobileLangRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink focus:outline-hidden"
              aria-label={t("header.language")}
              aria-expanded={langDropdownOpen}
            >
              <span style={{ fontSize: "14px"}}>{locale === "ar" ? "🇪🇬" : "🇺🇸"}</span>
              <ChevronDown
                className={`size-2.5 text-ink-faint transition-transform duration-200 ${
                  langDropdownOpen ? "rotate-180 text-ink" : ""
                }`}
              />
            </button>

            <div
              className={`absolute top-full mt-2 end-0 z-50 w-44 overflow-hidden rounded-2xl bg-paper/95 p-1.5 transition-all duration-200 ease-out ${
                isRtl ? "origin-top-left" : "origin-top-right"
              } ${
                langDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                  : "opacity-0 scale-95 -translate-y-1.5 pointer-events-none invisible"
              }`}
              aria-hidden={!langDropdownOpen}
            >
              <button
                type="button"
                tabIndex={langDropdownOpen ? 0 : -1}
                onClick={() => selectLanguage("en")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors mb-1 ${
                  locale === "en"
                    ? "bg-ink/5 text-ink"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <span>🇺🇸 English (US)</span>
                {locale === "en" && (
                  <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                )}
              </button>

              <button
                type="button"
                tabIndex={langDropdownOpen ? 0 : -1}
                onClick={() => selectLanguage("ar")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                  locale === "ar"
                    ? "bg-ink/5 text-ink"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <span>🇪🇬 Arabic (AR)</span>
                {locale === "ar" && (
                  <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
