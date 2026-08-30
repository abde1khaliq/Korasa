"use client";

import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Home,
  Menu,
  Plus,
  User,
  Wifi,
} from "lucide-react";

export function MobileHomeScreenPreview() {
  const subjects = [
    {
      id: "1",
      code: "MTH",
      name: "Mathematics",
      folders: 6,
      questions: 48,
      chipBg: "rgba(168, 112, 63, 0.15)",
      chipText: "#A8703F",
    },
    {
      id: "2",
      code: "PHY",
      name: "Physics",
      folders: 4,
      questions: 32,
      chipBg: "rgba(79, 138, 107, 0.15)",
      chipText: "#4F8A6B",
    },
    {
      id: "3",
      code: "CHM",
      name: "Chemistry",
      folders: 5,
      questions: 37,
      chipBg: "rgba(184, 115, 51, 0.15)",
      chipText: "#B87333",
    },
    {
      id: "4",
      code: "ENG",
      name: "Literature",
      folders: 3,
      questions: 21,
      chipBg: "rgba(110, 100, 150, 0.15)",
      chipText: "#6E6496",
    },
  ];

  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-paper font-sans select-none overflow-hidden">
      {/* Top App Header (K logo + Menu) */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <span className="font-display text-xl font-semibold text-ink">K</span>
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-7 items-center justify-center rounded-full text-ink"
        >
          <Menu className="size-4" strokeWidth={2} />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-20 no-scrollbar">
        {/* Greeting */}
        <div className="pt-2">
          <p className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
            Good morning
          </p>
          <h2 className="font-display text-[26px] leading-tight text-ink">
            Alex
          </h2>
          <p className="text-[12px] text-ink-soft">
            Ready to pick up where you left off?
          </p>
        </div>

        {/* Continue Studying Card */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-rule bg-onyx p-4 shadow-sm">
          {/* Subtle concentric circles watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full border border-paper/10"
          >
            <div className="absolute inset-3 rounded-full border border-paper/10">
              <div className="absolute inset-3 rounded-full border border-paper/10" />
            </div>
          </div>

          <p className="font-mono text-[9px] tracking-widest text-paper/60 uppercase">
            Continue studying
          </p>
          <h3 className="font-display mt-1 text-[19px] leading-snug text-paper">
            Physics
          </h3>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-paper px-3.5 py-1.5 text-[11px] font-medium text-onyx">
            <span>Continue</span>
            <ArrowRight className="size-3" strokeWidth={2} />
          </div>
        </div>

        {/* Subjects Section Title */}
        <div className="pt-5 pb-2">
          <h3 className="font-display text-[18px] text-ink">Subjects</h3>
          <p className="text-[11px] text-ink-soft">4 subjects</p>
        </div>

        {/* 2-Column Subject Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-col justify-between rounded-2xl border border-rule bg-paper-card p-3 shadow-xs transition-transform active:scale-95"
            >
              {/* Card Top: Code Pill + Arrow */}
              <div className="flex items-center justify-between">
                <span
                  className="rounded-lg px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase"
                  style={{ backgroundColor: sub.chipBg, color: sub.chipText }}
                >
                  {sub.code}
                </span>
                <div className="flex size-5 items-center justify-center rounded-full bg-ink-faint/10 text-ink-faint">
                  <ArrowUpRight className="size-2.5" strokeWidth={2} />
                </div>
              </div>

              {/* Subject Title & Stats */}
              <div className="mt-4">
                <h4 className="font-display text-[14px] font-medium leading-tight text-ink truncate">
                  {sub.name}
                </h4>
                <p className="mt-1 text-[10px] text-ink-soft">
                  {sub.folders}f · {sub.questions}qs
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Liquid Glass TabBar + Quick Add Button */}
      <div className="absolute inset-x-4 bottom-3 z-20 flex items-center gap-2">
        {/* Floating Glass Navigation Bar */}
        <div className="flex h-11 flex-1 items-center justify-around rounded-full border border-rule/80 bg-paper/90 px-3 shadow-md backdrop-blur-md">
          {/* Tab: Home (Active) */}
          <div className="flex items-center gap-1.5 rounded-full bg-ink-faint/15 px-2.5 py-1 text-ink">
            <Home className="size-3.5" strokeWidth={2.2} />
            <span className="text-[11px] font-medium">Home</span>
          </div>

          {/* Tab: Exams */}
          <div className="flex items-center text-ink-soft">
            <ClipboardList className="size-3.5" strokeWidth={1.8} />
          </div>

          {/* Tab: Profile */}
          <div className="flex items-center text-ink-soft">
            <User className="size-3.5" strokeWidth={1.8} />
          </div>
        </div>

        {/* Floating Quick Add (+) Button */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-onyx text-paper shadow-md">
          <Plus className="size-5" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
