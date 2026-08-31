import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Clock, MapPin, Bell, Edit2, Trash2, Repeat } from "lucide-react-native";
import { Lesson } from "@/types/lesson";
import { formatTime24to12, getDayName, getLessonStatusForDate } from "@/lib/lessonUtils";
import { useThemeColor } from "@/hooks/useThemeColor";

interface LessonCardProps {
  lesson: Lesson;
  targetDate?: Date;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: number) => void;
}

export function LessonCard({ lesson, targetDate = new Date(), onEdit, onDelete }: LessonCardProps) {
  const status = getLessonStatusForDate(lesson, targetDate);
  const timeFormatted = formatTime24to12(lesson.start_time);
  const inkFaint = useThemeColor("#9C9086", "#7A7166");

  const handleDelete = () => {
    Alert.alert(
      "Delete Lesson",
      `Are you sure you want to delete "${lesson.title}" on ${getDayName(lesson.day_of_week)}s?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(lesson.id),
        },
      ]
    );
  };

  const statusLabel =
    status === "ongoing"
      ? "In Progress"
      : status === "upcoming"
      ? "Upcoming"
      : "Completed";

  const statusBg =
    status === "ongoing"
      ? "bg-easy-soft"
      : status === "upcoming"
      ? "bg-brand/10"
      : "bg-paper";

  const statusText =
    status === "ongoing"
      ? "text-easy"
      : status === "upcoming"
      ? "text-brand"
      : "text-ink-faint";

  const reminderLabel =
    lesson.reminder_minutes >= 1440
      ? `${Math.round(lesson.reminder_minutes / 1440)}d before`
      : lesson.reminder_minutes >= 60
      ? `${Math.round(lesson.reminder_minutes / 60)}h before`
      : `${lesson.reminder_minutes}m before`;

  return (
    <View className="mb-3 rounded-2xl border border-rule bg-paper-card p-4">
      {/* Top row: Status, Day, Actions */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row flex-wrap items-center" style={{ gap: 6 }}>
          <View className={`rounded-full px-2.5 py-0.5 ${statusBg}`}>
            <Text className={`text-[11px] font-semibold ${statusText}`}>
              {statusLabel}
            </Text>
          </View>

          <View className="flex-row items-center rounded-full bg-paper px-2.5 py-0.5 border border-rule" style={{ gap: 4 }}>
            <Repeat size={10} color="#9C9086" strokeWidth={2} />
            <Text className="text-[11px] font-medium text-ink-soft">
              Every {getDayName(lesson.day_of_week)}
            </Text>
          </View>
        </View>

        {/* Action icons */}
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Pressable
            onPress={() => onEdit(lesson)}
            className="h-8 w-8 items-center justify-center rounded-lg"
            hitSlop={8}
          >
            <Edit2 size={15} color={inkFaint} strokeWidth={1.75} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="h-8 w-8 items-center justify-center rounded-lg"
            hitSlop={8}
          >
            <Trash2 size={15} color="#A34A34" strokeWidth={1.75} />
          </Pressable>
        </View>
      </View>

      {/* Subject Title */}
      <Text className="mt-2.5 text-[18px] font-semibold text-ink" numberOfLines={1}>
        {lesson.title}
      </Text>

      {/* Meta info: Time, Location, Reminder */}
      <View className="mt-3 flex-row flex-wrap items-center pt-2 border-t border-rule" style={{ gap: 14 }}>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Clock size={13} color="#9C9086" strokeWidth={1.75} />
          <Text className="text-[13px] font-medium text-ink-soft">{timeFormatted}</Text>
        </View>

        {lesson.location ? (
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <MapPin size={13} color="#9C9086" strokeWidth={1.75} />
            <Text className="text-[13px] text-ink-soft" numberOfLines={1}>
              {lesson.location}
            </Text>
          </View>
        ) : null}

        {lesson.reminder_minutes > 0 ? (
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Bell size={12} color="#9C9086" strokeWidth={1.75} />
            <Text className="text-[12px] text-ink-faint">
              {reminderLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
