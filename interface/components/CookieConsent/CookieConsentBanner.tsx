"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CONSENT_KEY = "korasa-cookie-consent";

export function CookieConsentBanner() {
  const { t, isRtl } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        // Short delay for a smoother entrance after page loads
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may not be available
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 pointer-events-none"
    >
      <div className="mx-auto max-w-4xl pointer-events-auto rounded-3xl bg-paper/95 p-4 sm:p-5 shadow-2xl shadow-ink/15 ring-1 ring-ink/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Message & Icon */}
          <div className="flex items-start gap-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand mt-0.5">
              <Cookie className="size-4.5" strokeWidth={1.8} />
            </div>
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-ink-soft">
              {t("cookie.message")}{" "}
              <Link
                href="/cookies"
                className="text-brand font-medium hover:underline underline-offset-4 whitespace-nowrap"
              >
                {t("cookie.learnMore")}
              </Link>
            </p>
          </div>

          {/* Accept Button */}
          <div className={`flex items-center shrink-0 ${isRtl ? "sm:mr-4" : "sm:ml-4"}`}>
            <button
              type="button"
              onClick={handleAccept}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-onyx px-5 py-2.5 text-[13px] font-medium text-paper shadow-sm transition-all duration-150 hover:bg-onyx/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("cookie.accept")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
