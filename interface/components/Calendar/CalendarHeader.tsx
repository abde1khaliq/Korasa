"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { formatMonthYear, isSameDay } from "@/app/utils/lessonUtils";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  totalLessons: number;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  totalLessons,
}: CalendarHeaderProps) {
  const isCurrentMonth = isSameDay(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  return (
    <div className="space-y-4">
      {/* Title & Today Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[34px] sm:text-[40px] font-normal leading-tight text-ink">
            Calendar
          </h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"} scheduled
          </p>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={onToday}
            className="flex items-center gap-1.5 rounded-full border border-rule bg-paper-card px-3.5 py-1.5 text-[13px] font-medium text-ink hover:bg-tag/50 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <CalendarDays className="size-3.5 text-ink-soft" />
            <span>Today</span>
          </button>
        )}
      </div>

      {/* Month Navigator Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-rule bg-paper-card px-3 py-2.5">
        <button
          onClick={onPrevMonth}
          className="flex size-9 items-center justify-center rounded-xl text-ink-soft hover:text-ink hover:bg-tag/50 transition-colors cursor-pointer"
          title="Previous month"
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>

        <span className="text-[17px] font-semibold text-ink">
          {formatMonthYear(currentDate)}
        </span>

        <button
          onClick={onNextMonth}
          className="flex size-9 items-center justify-center rounded-xl text-ink-soft hover:text-ink hover:bg-tag/50 transition-colors cursor-pointer"
          title="Next month"
        >
          <ChevronRight className="size-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
