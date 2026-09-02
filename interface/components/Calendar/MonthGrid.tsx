"use client";

import { useMemo } from "react";
import { Lesson } from "@/types/lesson";
import {
  CalendarDayCell,
  getDaysInMonthGrid,
  isSameDay,
} from "@/app/utils/lessonUtils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthGridProps {
  currentDate: Date;
  selectedDate: Date;
  lessons: Lesson[];
  onSelectDate: (date: Date) => void;
}

export function MonthGrid({
  currentDate,
  selectedDate,
  lessons,
  onSelectDate,
}: MonthGridProps) {
  const cells = useMemo(
    () => getDaysInMonthGrid(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate],
  );

  const lessonsByDayOfWeek = useMemo(() => {
    const map: Record<number, number> = {};
    for (const l of lessons) {
      map[l.day_of_week] = (map[l.day_of_week] || 0) + 1;
    }
    return map;
  }, [lessons]);

  return (
    <div className="rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 shadow-xs">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[12px] text-ink-faint pb-3 border-b border-rule/60">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-3">
        {cells.map((cell: CalendarDayCell) => {
          const isSelected = isSameDay(cell.date, selectedDate);
          const lessonCount = lessonsByDayOfWeek[cell.dayOfWeek] || 0;
          const hasLessons = lessonCount > 0;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className="flex flex-col items-center justify-center py-2 transition-all cursor-pointer group"
            >
              <div
                className={`flex size-9 sm:size-10 items-center justify-center rounded-full transition-all ${
                  isSelected
                    ? "bg-onyx text-paper font-semibold shadow-xs scale-105"
                    : cell.isToday
                      ? "border border-brand bg-paper text-brand font-semibold"
                      : "bg-transparent group-hover:bg-tag/50"
                }`}
              >
                <span
                  className={`text-[14px] ${
                    isSelected
                      ? "text-paper font-semibold"
                      : cell.isToday
                        ? "text-brand font-semibold"
                        : cell.isCurrentMonth
                          ? "text-ink"
                          : "text-ink-faint opacity-40"
                  }`}
                >
                  {cell.dayNumber}
                </span>
              </div>

              {/* Lesson indicator dots */}
              <div className="h-1.5 flex items-center justify-center gap-1 mt-1">
                {hasLessons ? (
                  Array.from({ length: Math.min(lessonCount, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className="size-1 rounded-full bg-brand"
                    />
                  ))
                ) : (
                  <span className="size-1 opacity-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
