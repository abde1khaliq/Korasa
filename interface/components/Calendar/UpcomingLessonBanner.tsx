"use client";

import { Clock, MapPin, Bell, Calendar as CalendarIcon } from "lucide-react";
import { Lesson } from "@/types/lesson";
import {
  formatTime24to12,
  getCountdownText,
  getDayName,
} from "@/app/utils/lessonUtils";

interface UpcomingLessonBannerProps {
  lesson: Lesson;
  onPress: (lesson: Lesson) => void;
}

export function UpcomingLessonBanner({
  lesson,
  onPress,
}: UpcomingLessonBannerProps) {
  const countdown = getCountdownText(lesson);
  const timeFormatted = formatTime24to12(lesson.start_time);

  const reminderLabel =
    lesson.reminder_minutes >= 1440
      ? `${Math.round(lesson.reminder_minutes / 1440)}d reminder`
      : lesson.reminder_minutes >= 60
        ? `${Math.round(lesson.reminder_minutes / 60)}h reminder`
        : `${lesson.reminder_minutes}m reminder`;

  return (
    <button
      type="button"
      onClick={() => onPress(lesson)}
      className="group w-full text-left overflow-hidden rounded-2xl border border-brand/60 bg-paper-card p-4 shadow-xs transition-all hover:border-brand hover:shadow-sm cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-brand" strokeWidth={2} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand">
            Next Lesson · {getDayName(lesson.day_of_week)}
          </span>
        </div>

        <div className="rounded-full bg-brand/10 px-2.5 py-0.5">
          <span className="font-mono text-[11px] font-semibold text-brand">
            {countdown}
          </span>
        </div>
      </div>

      <h3 className="mt-2.5 text-[18px] font-semibold text-ink group-hover:text-brand transition-colors truncate">
        {lesson.title}
      </h3>

      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[13px] text-ink-soft font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-ink-faint" />
          <span>{timeFormatted}</span>
        </div>

        {lesson.location ? (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-ink-faint" />
            <span className="truncate">{lesson.location}</span>
          </div>
        ) : null}

        {lesson.reminder_minutes > 0 ? (
          <div className="flex items-center gap-1.5">
            <Bell className="size-3 text-ink-faint" />
            <span className="text-[12px] text-ink-faint">{reminderLabel}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}
