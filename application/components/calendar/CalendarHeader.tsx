import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react-native";
import { formatMonthYear, isSameDay } from "@/lib/lessonUtils";
import { useThemeColor } from "@/hooks/useThemeColor";

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
  const ink = useThemeColor("#2B2724", "#F1EFEC");
  const inkSoft = useThemeColor("#6E655C", "#B3AA9F");
  const isCurrentMonth = isSameDay(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  return (
    <View className="px-5 pt-6 pb-2">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-display text-[38px] leading-[42px] text-ink">
            Calendar
          </Text>
          <Text className="mt-1 text-[15px] text-ink-soft">
            {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"} scheduled
          </Text>
        </View>

        {!isCurrentMonth && (
          <Pressable
            onPress={onToday}
            className="flex-row items-center rounded-full border border-rule bg-paper-card px-3.5 py-1.5"
            style={{ gap: 5 }}
          >
            <CalendarDays size={14} color={inkSoft} strokeWidth={1.75} />
            <Text
              className="text-[13px] text-ink"
              style={{ fontWeight: "500" }}
            >
              Today
            </Text>
          </Pressable>
        )}
      </View>

      <View className="mt-5 flex-row items-center justify-between rounded-2xl border border-rule bg-paper-card px-3 py-2.5">
        <Pressable
          onPress={onPrevMonth}
          className="h-9 w-9 items-center justify-center rounded-xl"
          hitSlop={8}
        >
          <ChevronLeft size={20} color={ink} strokeWidth={2} />
        </Pressable>

        <Text className="text-[17px] text-ink" style={{ fontWeight: "600" }}>
          {formatMonthYear(currentDate)}
        </Text>

        <Pressable
          onPress={onNextMonth}
          className="h-9 w-9 items-center justify-center rounded-xl"
          hitSlop={8}
        >
          <ChevronRight size={20} color={ink} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}
