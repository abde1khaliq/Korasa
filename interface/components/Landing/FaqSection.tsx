"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What makes Korasa different from standard flashcard apps?",
    answer:
      "Korasa is designed specifically for full-length problem solving and practice exams. Instead of simple front-and-back flashcards, Korasa stores complete questions, solving approach notes, answers, and difficulty ratings. You can then generate authentic timed exams from your personal collection to test yourself under realistic conditions.",
  },
  {
    question: "How does the question photo capture work?",
    answer:
      "When adding a question on your mobile device or web, you can snap a photo or upload an image of a worksheet, textbook problem, or blackboard note.",
  },
  {
    question: "How does the Exam Generator create custom tests?",
    answer:
      "You choose the scope (an entire subject or a specific topic folder), pick your target difficulty (Easy, Medium, Hard, or mixed), choose between timed simulation and self-paced practice mode, and choose how many questions you want. Korasa instantly pulls from your saved questions to generate a focused exam.",
  },
  {
    question: "Can I organize my questions into subjects and chapter folders?",
    answer:
      "Yes. The core hierarchy is Subject → Folder → Question. For example, create a subject called 'Physics', create folders for 'Kinematics', 'Thermodynamics', and 'Electromagnetism', and organize your questions neatly by chapter or topic.",
  },
  {
    question: "Is Korasa free?",
    answer:
      "Yes! Korasa is completely free.",
  },
  {
    question: "How does revision help me improve over time?",
    answer:
      "After finishing an exam simulation, you can see your score, review the questions you missed, and re-read the solving approach notes you wrote when you first encountered the problem. This targeted review loop turns past mistakes into lasting comprehension.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-28 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            Everything you need to know about Korasa.
          </h2>
          <p className="mt-3 text-[16px] text-ink-soft">
            Have questions about organizing your studies or generating exams? We’ve got answers.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-rule bg-paper transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-paper-card"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-[17px] font-medium text-ink">
                    {item.question}
                  </span>
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border border-rule text-ink-soft transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-paper-card text-ink" : ""
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-rule/60 px-5 pb-5 pt-3">
                    <p className="text-[15px] leading-relaxed text-ink-soft">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support contact info */}
        <div className="mt-10 text-center font-mono text-[13px] text-ink-faint">
          Need more help or have a feature suggestion? Reach out at{" "}
          <a
            href="mailto:support@korasa.study"
            className="text-brand underline underline-offset-4 hover:text-brand/80"
          >
            support@korasa.study
          </a>
        </div>
      </div>
    </section>
  );
}
