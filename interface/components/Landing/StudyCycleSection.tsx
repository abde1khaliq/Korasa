"use client";

import {
  BookOpen,
  Camera,
  FolderTree,
  Target,
  RotateCcw,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export function StudyCycleSection() {
  const steps = [
    {
      label: "Study",
      desc: "Work through your lectures, textbooks, & homework",
      icon: BookOpen,
      color: "text-brand",
      bgColor: "bg-brand/10",
    },
    {
      label: "Save",
      desc: "Snap a photo or type tricky questions with notes",
      icon: Camera,
      color: "text-medium",
      bgColor: "bg-medium-soft",
    },
    {
      label: "Organize",
      desc: "Sort questions into custom subjects & topic folders",
      icon: FolderTree,
      color: "text-easy",
      bgColor: "bg-easy-soft",
    },
    {
      label: "Generate Exams",
      desc: "Set count, difficulty & mode for instant practice",
      icon: Target,
      color: "text-brand",
      bgColor: "bg-brand/10",
    },
    {
      label: "Revise",
      desc: "Solve under simulated conditions & spot weaknesses",
      icon: RotateCcw,
      color: "text-hard",
      bgColor: "bg-hard-soft",
    },
    {
      label: "Improve",
      desc: "Target struggling topics until concepts stick",
      icon: TrendingUp,
      color: "text-easy",
      bgColor: "bg-easy-soft",
    },
  ];

  return (
    <section className="border-y border-rule bg-paper-card py-12 transition-colors">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-ink sm:text-3xl">
              Study → Save → Organize → Generate Exams → Revise → Improve
            </h2>
          </div>
        </div>

        {/* Step cards grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="group relative flex flex-col justify-between rounded-2xl border border-rule bg-paper p-4 transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-8 items-center justify-center rounded-lg ${step.bgColor} ${step.color}`}
                    >
                      <Icon className="size-4" strokeWidth={2} />
                    </div>
                    <span className="font-mono text-[11px] text-ink-faint">
                      0{idx + 1}
                    </span>
                  </div>

                  <p className="mt-3 text-[14px] font-semibold text-ink">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-ink-soft">
                    {step.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="mt-3 hidden items-center justify-end text-ink-faint lg:flex">
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
