import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import {
  CalendarDayCell,
  getDaysInMonthGrid,
  isSameDay,
} from "@/lib/lessonUtils";
import { Lesson } from "@/types/lesson";

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
  const cells = getDaysInMonthGrid(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  // Group lessons by day_of_week (0..6)
  const lessonsByDayOfWeek = useMemo(() => {
    const map: Record<number, number> = {};
    for (const l of lessons) {
      map[l.day_of_week] = (map[l.day_of_week] || 0) + 1;
    }
    return map;
  }, [lessons]);

  return (
    <View className="mx-5 mt-3 rounded-2xl border border-rule bg-paper-card p-3">
      {/* Weekday headers */}
      <View className="flex-row items-center justify-between pb-2 border-b border-rule">
        {WEEKDAYS.map((day) => (
          <View key={day} className="flex-1 items-center justify-center">
            <Text className="text-[12px] text-ink-faint" style={{ fontWeight: "500" }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid rows */}
      <View className="mt-2" style={{ gap: 4 }}>
        {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, rowIndex) => {
          const rowCells = cells.slice(rowIndex * 7, rowIndex * 7 + 7);
          return (
            <View key={rowIndex} className="flex-row items-center justify-between">
              {rowCells.map((cell: CalendarDayCell) => {
                const isSelected = isSameDay(cell.date, selectedDate);
                const lessonCount = lessonsByDayOfWeek[cell.dayOfWeek] || 0;
                const hasLessons = lessonCount > 0;

                return (
                  <Pressable
                    key={cell.dateKey}
                    onPress={() => onSelectDate(cell.date)}
                    className="flex-1 items-center justify-center py-2"
                  >
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        isSelected
                          ? "bg-onyx"
                          : cell.isToday
                          ? "border border-brand bg-paper"
                          : "bg-transparent"
                      }`}
                    >
                      <Text
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
                      </Text>
                    </View>

                    {/* Recurring lesson indicator dots */}
                    <View className="h-1.5 flex-row items-center justify-center mt-0.5" style={{ gap: 2 }}>
                      {hasLessons ? (
                        Array.from({ length: Math.min(lessonCount, 3) }).map((_, dotIndex) => (
                          <View
                            key={dotIndex}
                            className={`h-1 w-1 rounded-full ${
                              isSelected ? "bg-brand" : "bg-brand"
                            }`}
                          />
                        ))
                      ) : (
                        <View className="h-1 w-1 opacity-0" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
}
