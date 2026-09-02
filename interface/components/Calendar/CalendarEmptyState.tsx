"use client";

import { Calendar as CalendarIcon, Plus } from "lucide-react";

interface CalendarEmptyStateProps {
  onAddClick: () => void;
  selectedDateHeading?: string;
}

export function CalendarEmptyState({
  onAddClick,
  selectedDateHeading,
}: CalendarEmptyStateProps) {
  return (
    <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-rule bg-paper-card/60 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-tag text-brand mb-3">
        <CalendarIcon className="size-7 text-brand" strokeWidth={1.5} />
      </div>

      <h3 className="text-[18px] font-semibold text-ink">
        {selectedDateHeading
          ? `No lessons on ${selectedDateHeading}`
          : "No lessons scheduled"}
      </h3>

      <p className="mt-1.5 max-w-sm text-[14px] text-ink-soft leading-relaxed">
        Schedule your upcoming lectures, study groups, and classes to receive
        automatic reminders.
      </p>

      <button
        onClick={onAddClick}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-xs cursor-pointer"
      >
        <Plus className="size-4" strokeWidth={2.2} />
        <span>Add Lesson</span>
      </button>
    </div>
  );
}
