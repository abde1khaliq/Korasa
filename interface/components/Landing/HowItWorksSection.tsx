"use client";

import {
  FolderPlus,
  Camera,
  Layers,
  Target,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: FolderPlus,
      title: "Create & Organize",
      subtitle: "Subjects & Topic Folders",
      desc: "Create subjects (like Math, Chemistry, or Literature) and organize questions into folders based on chapters, topics, or study sessions.",
      tag: "STRUCTURE",
      highlights: [
        "Group by subject, chapter, or exam unit",
        "Infinite topic folders for clean categorization",
        "Instant search and filter across all folders",
      ],
    },
    {
      num: "02",
      icon: Camera,
      title: "Save Questions",
      subtitle: "Photo, Answers, & Notes",
      desc: "Upload or take a picture of a tricky question with your camera, then record its answer, difficulty level (Easy/Medium/Hard), and a note explaining your solving approach.",
      tag: "CAPTURE",
      highlights: [
        "Capture the question using your camera",
        "Tag difficulty: Easy, Medium, or Hard",
        "Add solving approach notes & step-by-step logic",
      ],
    },
    {
      num: "03",
      icon: Layers,
      title: "Build Your Question Bank",
      subtitle: "Your Personal Knowledge Base",
      desc: "Over time, KORASA becomes your personal collection of real questions you've encountered while studying, practicing, or attending class.",
      tag: "RETENTION",
      highlights: [
        "Never lose a difficult problem you spent hours solving",
        "Review your question bank anytime, anywhere",
        "Track difficulty distribution across subjects",
      ],
    },
    {
      num: "04",
      icon: Target,
      title: "Generate Exams",
      subtitle: "Custom Practice Simulation",
      desc: "Choose a subject or folder, select the difficulty, exam mode, and number of questions, then generate a tailored exam drawn directly from your saved questions.",
      tag: "TESTING",
      highlights: [
        "Select specific chapters or test entire subjects",
        "Filter by difficulty or mix all tiers",
        "Timed exam mode or untimed practice session",
      ],
    },
    {
      num: "05",
      icon: RotateCcw,
      title: "Revise & Repeat",
      subtitle: "Target Weaknesses & Master",
      desc: "Take the exam, identify what you struggle with, and revisit those specific questions whenever you need until the concept becomes second nature.",
      tag: "MASTERY",
      highlights: [
        "Detailed attempt score & review breakdown",
        "Flag questions you got wrong for instant revisit",
        "Re-attempt exams to measure improvement",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <h2 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Designed around how students actually study and learn.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            From the moment you stumble across a difficult question in class to
            the day before your final exam, Korasa keeps you organized and
            prepared.
          </p>
        </div>

        {/* 5 Steps Vertical Timeline Cards */}
        <div className="mt-16 space-y-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="group relative rounded-3xl border border-rule bg-paper-card p-6 transition-all hover:border-brand/40 hover:bg-paper sm:p-8"
              >
                <div className="grid gap-6 md:grid-cols-12 md:items-center">
                  {/* Left Column: Number & Icon */}
                  <div className="flex items-center gap-4 md:col-span-4 lg:col-span-3">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-rule bg-paper font-mono text-lg font-bold text-ink shadow-sm ">
                      {s.num}
                    </div>
                    <div>
                      <span className="font-mono text-[10.5px] font-semibold tracking-wider text-brand uppercase">
                        {s.tag}
                      </span>
                      <h3 className="font-display text-xl font-medium text-ink">
                        {s.title}
                      </h3>
                      <p className="text-[13px] text-ink-faint">{s.subtitle}</p>
                    </div>
                  </div>

                  {/* Middle Column: Detailed Description */}
                  <div className="md:col-span-5 lg:col-span-5">
                    <p className="text-[15px] leading-relaxed text-ink-soft">
                      {s.desc}
                    </p>
                  </div>

                  {/* Right Column: Key Highlights */}
                  <div className="space-y-2 border-t border-rule/60 pt-4 md:col-span-3 md:border-t-0 md:border-l md:pl-6 md:pt-0 lg:col-span-4">
                    {s.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[13px] text-ink">
                        <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-easy" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
