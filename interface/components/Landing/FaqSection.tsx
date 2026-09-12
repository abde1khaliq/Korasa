"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

interface FaqConfig {
  qKey: TranslationKey;
  aKey: TranslationKey;
}

const FAQ_CONFIG: FaqConfig[] = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
];

export function FaqSection() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      ref={ref}
      className={`py-20 md:py-28 px-6 border-t border-rule/60 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-[16px] text-ink-soft">{t("faq.subtitle")}</p>
        </div>

        <div className="mt-12 space-y-3">
          {FAQ_CONFIG.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl bg-paper-card/60 ring-1 ring-ink/[0.04] transition-all duration-200 hover:bg-paper-card hover:ring-ink/[0.08]"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-[16.5px] sm:text-[17px] font-normal text-ink">
                    {t(item.qKey)}
                  </span>
                  <ChevronDown
                    className={`size-4.5 shrink-0 text-ink-soft transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-ink" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-rule/40 px-6 pt-3 pb-5">
                      <p className="text-[14.5px] sm:text-[15px] leading-relaxed text-ink-soft">
                        {t(item.aKey)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-[13.5px] text-ink-faint">
          <span>{t("faq.supportPrompt")} </span>
          <a
            href="mailto:support@korasa.study"
            className="text-brand font-medium hover:underline underline-offset-4 transition-colors"
          >
            support@korasa.study
          </a>
        </div>
      </div>
    </section>
  );
}
