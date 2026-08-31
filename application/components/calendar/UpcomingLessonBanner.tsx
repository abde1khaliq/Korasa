import React from "react";
import { View, Text, Pressable } from "react-native";
import { Clock, MapPin, Bell, Calendar as CalendarIcon } from "lucide-react-native";
import { Lesson } from "@/types/lesson";
import { formatTimeRange, getCountdownText, getDayName } from "@/lib/lessonUtils";

interface UpcomingLessonBannerProps {
  lesson: Lesson;
  onPress: (lesson: Lesson) => void;
}

export function UpcomingLessonBanner({ lesson, onPress }: UpcomingLessonBannerProps) {
  const countdown = getCountdownText(lesson);
  const timeRange = formatTimeRange(lesson.start_time, lesson.end_time);

  return (
    <Pressable
      onPress={() => onPress(lesson)}
      className="mx-5 mt-4 overflow-hidden rounded-2xl border border-brand bg-paper-card p-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <CalendarIcon size={14} color="#A8703F" strokeWidth={2} />
          <Text className="text-[12px] font-semibold uppercase tracking-wider text-brand">
            Next Lesson · {getDayName(lesson.day_of_week)}
          </Text>
        </View>
      </View>

      <Text className="mt-2.5 text-[18px] font-semibold text-ink" numberOfLines={1}>
        {lesson.title}
      </Text>

      <View className="mt-2.5 flex-row flex-wrap items-center" style={{ gap: 12 }}>
        {lesson.subject_name && (
          <View className="rounded-full bg-tag px-2.5 py-0.5">
            <Text className="text-[12px] font-medium text-ink">
              {lesson.subject_name}
            </Text>
          </View>
        )}

        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Clock size={13} color="#9C9086" strokeWidth={1.75} />
          <Text className="text-[13px] text-ink-soft">{timeRange}</Text>
        </View>

        {lesson.location ? (
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <MapPin size={13} color="#9C9086" strokeWidth={1.75} />
            <Text className="text-[13px] text-ink-soft" numberOfLines={1}>
              {lesson.location}
            </Text>
          </View>
        ) : null}

        {lesson.reminder_minutes > 0 && (
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Bell size={12} color="#9C9086" strokeWidth={1.75} />
            <Text className="text-[12px] text-ink-faint">
              {lesson.reminder_minutes >= 1440
                ? `${Math.round(lesson.reminder_minutes / 1440)}d reminder`
                : lesson.reminder_minutes >= 60
                ? `${Math.round(lesson.reminder_minutes / 60)}h reminder`
                : `${lesson.reminder_minutes}m reminder`}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
