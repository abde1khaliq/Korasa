"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { APK_DOWNLOAD_URL } from "@/app/utils/data";

export function LandingFooter() {
  const { t, locale } = useI18n();

  return (
    <footer className="border-t border-rule/60 bg-paper-card/40 transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="font-display text-2xl font-medium tracking-tight text-ink">
              {locale === "ar" ? "كراسة" : "Korasa"}
            </span>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
              {t("footer.brandTagline")}
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold tracking-wider text-ink uppercase">
              {t("footer.navProduct")}
            </p>
            <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
              <li>
                <a
                  href="#how-it-works"
                  className="transition-colors hover:text-ink"
                >
                  {t("footer.howItWorks")}
                </a>
              </li>
              <li>
                <a
                  href={APK_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  {t("footer.androidApp")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold tracking-wider text-ink uppercase">
              {t("footer.navQuickAccess")}
            </p>
            <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-ink"
                >
                  {t("footer.createAccount")}
                </Link>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-ink">
                  {t("footer.faq")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold tracking-wider text-ink uppercase">
              {t("footer.navLegal")}
            </p>
            <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-ink"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-ink"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="transition-colors hover:text-ink"
                >
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-rule/50 pt-6 text-[13px] text-ink-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} {locale === "ar" ? "كراسة" : "Korasa"}.{" "}
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
