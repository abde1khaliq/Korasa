"use client";

import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ListFilter, Plus } from "lucide-react";
import { useLessons } from "@/app/hooks/useLessons";
import { useNotification } from "@/app/hooks/useNotification";
import { CalendarHeader } from "./CalendarHeader";
import { MonthGrid } from "./MonthGrid";
import { UpcomingLessonBanner } from "./UpcomingLessonBanner";
import { LessonCard } from "./LessonCard";
import { CreateLessonModal } from "./CreateLessonModal";
import { CalendarSkeleton } from "./CalendarSkeleton";
import { CalendarEmptyState } from "./CalendarEmptyState";
import { Lesson, LessonInput, DAYS_OF_WEEK } from "@/types/lesson";
import { formatDateHeading, getDayName } from "@/app/utils/lessonUtils";

type CalendarViewMode = "month" | "timetable";

export function CalendarView() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const {
    lessons,
    upcomingLessons,
    isLoading,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useLessons();

  const { showNotification } = useNotification();

  const selectedDayLessons = useMemo(() => {
    const targetDayOfWeek = selectedDate.getDay();
    return lessons
      .filter((l) => l.day_of_week === targetDayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [lessons, selectedDate]);

  const lessonsByDayOfWeek = useMemo(() => {
    const map: Record<number, Lesson[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      0: [],
    };
    for (const l of lessons) {
      if (map[l.day_of_week]) {
        map[l.day_of_week].push(l);
      }
    }
    for (const d of Object.keys(map)) {
      map[Number(d)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [lessons]);

  const nextLesson = upcomingLessons[0] ?? null;

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleBannerPress = (lesson: Lesson) => {
    const now = new Date();
    const daysUntil = (lesson.day_of_week - now.getDay() + 7) % 7;
    const target = new Date(now);
    target.setDate(now.getDate() + daysUntil);
    setSelectedDate(target);
    setCurrentMonth(new Date(target.getFullYear(), target.getMonth(), 1));
    setViewMode("month");
  };

  const handleSaveLesson = async (input: LessonInput, lessonId?: number) => {
    if (lessonId) {
      await updateLesson(lessonId, input);
      showNotification(`"${input.title}" updated`);
    } else {
      const res = await createLesson(input);
      const count = Array.isArray(res) ? res.length : 1;
      showNotification(
        count > 1
          ? `${count} recurring lessons scheduled`
          : `"${input.title}" scheduled`,
      );
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await deleteLesson(lessonId);
      showNotification("Lesson deleted");
    } catch {
      showNotification("Failed to delete lesson");
    }
  };

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  const todayDayOfWeek = new Date().getDay();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <CalendarHeader
        currentDate={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        totalLessons={lessons.length}
      />

      {/* Mode Switcher & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-2xl border border-rule bg-paper-card p-1">
          <button
            onClick={() => setViewMode("month")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[13px] transition-all cursor-pointer ${
              viewMode === "month"
                ? "bg-onyx text-paper font-semibold shadow-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <CalendarIcon className="size-4" />
            <span>Month View</span>
          </button>

          <button
            onClick={() => setViewMode("timetable")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[13px] transition-all cursor-pointer ${
              viewMode === "timetable"
                ? "bg-onyx text-paper font-semibold shadow-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <ListFilter className="size-4" />
            <span>Weekly Schedule</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingLesson(null);
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          <span>New Lesson</span>
        </button>
      </div>

      {/* Next Upcoming Banner */}
      {nextLesson && (
        <UpcomingLessonBanner
          lesson={nextLesson}
          onPress={handleBannerPress}
        />
      )}

      {/* Views */}
      {viewMode === "month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Month grid on left */}
          <div className="lg:col-span-7">
            <MonthGrid
              currentDate={currentMonth}
              selectedDate={selectedDate}
              lessons={lessons}
              onSelectDate={handleSelectDate}
            />
          </div>

          {/* Selected day lessons on right */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rule/60">
              <div>
                <h3 className="text-[20px] font-semibold text-ink">
                  {formatDateHeading(selectedDate)}
                </h3>
                <p className="mt-0.5 text-[13px] text-ink-faint">
                  Recurring on every {getDayName(selectedDate.getDay())}
                </p>
              </div>
              <span className="text-[14px] text-ink-soft">
                {selectedDayLessons.length}{" "}
                {selectedDayLessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>

            {selectedDayLessons.length === 0 ? (
              <CalendarEmptyState
                onAddClick={() => {
                  setEditingLesson(null);
                  setShowCreateModal(true);
                }}
                selectedDateHeading={getDayName(selectedDate.getDay())}
              />
            ) : (
              selectedDayLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  targetDate={selectedDate}
                  onEdit={(l) => {
                    setEditingLesson(l);
                    setShowCreateModal(true);
                  }}
                  onDelete={handleDeleteLesson}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Weekly Timetable View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS_OF_WEEK.map((dayOption) => {
            const dayLessons = lessonsByDayOfWeek[dayOption.value] || [];
            const isTodayDay = dayOption.value === todayDayOfWeek;

            return (
              <div
                key={dayOption.value}
                className={`rounded-2xl border p-4 transition-all shadow-xs ${
                  isTodayDay
                    ? "border-brand/60 bg-paper-card"
                    : "border-rule bg-paper-card/70"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-rule/60">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[17px] font-semibold text-ink">
                      {dayOption.label}
                    </h4>
                    {isTodayDay && (
                      <span className="rounded-full bg-brand/10 text-brand px-2.5 py-0.5 text-[11px] font-semibold">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] text-ink-faint">
                    {dayLessons.length}{" "}
                    {dayLessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {dayLessons.length === 0 ? (
                    <p className="py-3 text-[14px] text-ink-faint italic text-center">
                      No lessons scheduled on {dayOption.label}s
                    </p>
                  ) : (
                    dayLessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        onEdit={(l) => {
                          setEditingLesson(l);
                          setShowCreateModal(true);
                        }}
                        onDelete={handleDeleteLesson}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <CreateLessonModal
          initialDayOfWeek={selectedDate.getDay()}
          initialLesson={editingLesson}
          onClose={() => {
            setShowCreateModal(false);
            setEditingLesson(null);
          }}
          onSubmit={handleSaveLesson}
        />
      )}
    </div>
  );
}
