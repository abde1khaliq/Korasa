"use client";

import { useState } from "react";
import { Clock, MapPin, Bell, Edit2, Trash2, Repeat } from "lucide-react";
import { Lesson } from "@/types/lesson";
import {
  formatTime24to12,
  getDayName,
  getLessonStatusForDate,
} from "@/app/utils/lessonUtils";

interface LessonCardProps {
  lesson: Lesson;
  targetDate?: Date;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: number) => void;
}

export function LessonCard({
  lesson,
  targetDate = new Date(),
  onEdit,
  onDelete,
}: LessonCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = getLessonStatusForDate(lesson, targetDate);
  const timeFormatted = formatTime24to12(lesson.start_time);

  const statusLabel =
    status === "ongoing"
      ? "In Progress"
      : status === "upcoming"
        ? "Upcoming"
        : "Completed";

  const statusBg =
    status === "ongoing"
      ? "bg-easy-soft text-easy border-easy/30"
      : status === "upcoming"
        ? "bg-brand/10 text-brand border-brand/30"
        : "bg-paper text-ink-faint border-rule";

  const reminderLabel =
    lesson.reminder_minutes >= 1440
      ? `${Math.round(lesson.reminder_minutes / 1440)}d before`
      : lesson.reminder_minutes >= 60
        ? `${Math.round(lesson.reminder_minutes / 60)}h before`
        : `${lesson.reminder_minutes}m before`;

  return (
    <div className="group relative rounded-2xl border border-rule bg-paper-card p-4 transition-all hover:border-brand/50 shadow-xs mb-3">
      {/* Top Row: Badges and Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${statusBg}`}
          >
            {statusLabel}
          </span>

          <span className="flex items-center gap-1.5 rounded-full border border-rule bg-paper px-2.5 py-0.5 text-[11px] font-medium text-ink-soft">
            <Repeat className="size-3 text-ink-faint" />
            <span>Every {getDayName(lesson.day_of_week)}</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(lesson)}
            className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:text-ink hover:bg-tag/50 transition-colors cursor-pointer"
            title="Edit lesson"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex size-8 items-center justify-center rounded-lg text-hard/70 hover:text-hard hover:bg-hard-soft/40 transition-colors cursor-pointer"
            title="Delete lesson"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2.5 text-[17px] font-semibold text-ink truncate">
        {lesson.title}
      </h3>

      {/* Meta Row */}
      <div className="mt-3 flex flex-wrap items-center gap-4 pt-2.5 border-t border-rule/60 text-[13px] text-ink-soft">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-ink-faint" />
          <span>{timeFormatted}</span>
        </div>

        {lesson.location ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="size-3.5 text-ink-faint shrink-0" />
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

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/30 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-rule bg-paper p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display text-xl font-normal text-ink">
              Delete Lesson
            </h3>
            <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
              Are you sure you want to delete &ldquo;{lesson.title}&rdquo; on {getDayName(lesson.day_of_week)}s?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-xl border border-rule text-[13px] text-ink hover:bg-tag/40 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  onDelete(lesson.id);
                }}
                className="px-4 py-2 rounded-xl bg-hard text-[13px] font-medium text-white hover:bg-hard/90 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
