import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Calendar as CalendarIcon, ListFilter } from "lucide-react-native";
import { useLessons } from "@/hooks/useLessons";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { CalendarHeader } from "./CalendarHeader";
import { MonthGrid } from "./MonthGrid";
import { UpcomingLessonBanner } from "./UpcomingLessonBanner";
import { LessonCard } from "./LessonCard";
import { CreateLessonModal } from "./CreateLessonModal";
import { CalendarSkeleton } from "./CalendarSkeleton";
import { CalendarEmptyState } from "./CalendarEmptyState";
import { Lesson, LessonInput, DAYS_OF_WEEK } from "@/types/lesson";
import { formatDateHeading, getDayName } from "@/lib/lessonUtils";
import { useThemeColor } from "@/hooks/useThemeColor";

type CalendarViewMode = "month" | "timetable";

export function CalendarView() {
  const insets = useSafeAreaInsets();
  const ink = useThemeColor("#F1EFEC", "#2B2724");

  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const {
    lessons,
    upcomingLessons,
    isLoading,
    isRefreshing,
    onRefresh,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useLessons();

  const { notification, showNotification } = useNotification();

  const tabBarHeight = 64;
  const tabBarBottom = Math.max(insets.bottom, 14);
  const buttonBottom = tabBarBottom + tabBarHeight + 16;

  // Filter lessons for the selected day's day_of_week
  const selectedDayLessons = useMemo(() => {
    const targetDayOfWeek = selectedDate.getDay();
    return lessons
      .filter((l) => l.day_of_week === targetDayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [lessons, selectedDate]);

  // Lessons grouped by day of week for the Timetable view
  const lessonsByDayOfWeek = useMemo(() => {
    const map: Record<number, Lesson[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] };
    for (const l of lessons) {
      if (map[l.day_of_week]) {
        map[l.day_of_week].push(l);
      }
    }
    // Sort each day's lessons by start_time
    for (const d of Object.keys(map)) {
      map[Number(d)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [lessons]);

  // Next upcoming lesson
  const nextLesson = upcomingLessons[0] ?? null;

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
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
    let daysUntil = (lesson.day_of_week - now.getDay() + 7) % 7;
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
          : `"${input.title}" scheduled`
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
    <View className="flex-1 bg-paper">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: buttonBottom + 64,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={ink}
          />
        }
      >
        {/* Header */}
        <CalendarHeader
          currentDate={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          totalLessons={lessons.length}
        />

        {/* View Switcher: Month Calendar vs Weekly Timetable */}
        <View className="mx-5 mt-2 flex-row" style={{ gap: 8 }}>
          <Pressable
            onPress={() => setViewMode("month")}
            className={`flex-1 flex-row items-center justify-center rounded-xl py-2 border ${
              viewMode === "month"
                ? "bg-onyx border-onyx"
                : "bg-paper-card border-rule"
            }`}
            style={{ gap: 6 }}
          >
            <CalendarIcon
              size={15}
              color={viewMode === "month" ? "#F7F5F1" : "#6E655C"}
              strokeWidth={2}
            />
            <Text
              className={`text-[13px] font-medium ${
                viewMode === "month" ? "text-paper" : "text-ink-soft"
              }`}
            >
              Month View
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode("timetable")}
            className={`flex-1 flex-row items-center justify-center rounded-xl py-2 border ${
              viewMode === "timetable"
                ? "bg-onyx border-onyx"
                : "bg-paper-card border-rule"
            }`}
            style={{ gap: 6 }}
          >
            <ListFilter
              size={15}
              color={viewMode === "timetable" ? "#F7F5F1" : "#6E655C"}
              strokeWidth={2}
            />
            <Text
              className={`text-[13px] font-medium ${
                viewMode === "timetable" ? "text-paper" : "text-ink-soft"
              }`}
            >
              Weekly Schedule
            </Text>
          </Pressable>
        </View>

        {/* Highlight Banner for Next Upcoming Lesson */}
        {nextLesson && (
          <UpcomingLessonBanner
            lesson={nextLesson}
            onPress={handleBannerPress}
          />
        )}

        {viewMode === "month" ? (
          <>
            {/* Interactive Month Grid */}
            <MonthGrid
              currentDate={currentMonth}
              selectedDate={selectedDate}
              lessons={lessons}
              onSelectDate={handleSelectDate}
            />

            {/* Selected Day Agenda Section */}
            <View className="mx-5 mt-6">
              <View className="flex-row items-center justify-between pb-3">
                <View>
                  <Text className="text-[20px] font-semibold text-ink">
                    {formatDateHeading(selectedDate)}
                  </Text>
                  <Text className="mt-0.5 text-[13px] text-ink-faint">
                    Recurring on every {getDayName(selectedDate.getDay())}
                  </Text>
                </View>
                <Text className="text-[14px] text-ink-soft">
                  {selectedDayLessons.length}{" "}
                  {selectedDayLessons.length === 1 ? "lesson" : "lessons"}
                </Text>
              </View>

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
            </View>
          </>
        ) : (
          /* Weekly Timetable View (Mon -> Sun) */
          <View className="mx-5 mt-5" style={{ gap: 18 }}>
            {DAYS_OF_WEEK.map((dayOption) => {
              const dayLessons = lessonsByDayOfWeek[dayOption.value] || [];
              const isTodayDay = dayOption.value === todayDayOfWeek;

              return (
                <View key={dayOption.value} className="rounded-2xl border border-rule bg-paper-card/70 p-4">
                  <View className="flex-row items-center justify-between pb-2.5 border-b border-rule">
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <Text className="text-[17px] font-semibold text-ink">
                        {dayOption.label}
                      </Text>
                      {isTodayDay && (
                        <View className="rounded-full bg-brand/10 px-2.5 py-0.5">
                          <Text className="text-[11px] font-semibold text-brand">
                            Today
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-[13px] text-ink-faint">
                      {dayLessons.length} {dayLessons.length === 1 ? "lesson" : "lessons"}
                    </Text>
                  </View>

                  <View className="mt-3">
                    {dayLessons.length === 0 ? (
                      <Text className="py-2 text-[14px] text-ink-faint italic">
                        No lessons scheduled on {dayOption.label}s
                      </Text>
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
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating "+ New lesson" Button */}
      <Pressable
        onPress={() => {
          setEditingLesson(null);
          setShowCreateModal(true);
        }}
        className="absolute self-center flex-row items-center rounded-full bg-onyx"
        style={{
          bottom: buttonBottom,
          gap: 8,
          paddingHorizontal: 24,
          paddingVertical: 14,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <Plus size={20} color={ink} strokeWidth={2} />
        <Text className="text-[16px] font-semibold text-paper">New lesson</Text>
      </Pressable>

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

      {/* Toast Notification */}
      <Notification message={notification} />
    </View>
  );
}
