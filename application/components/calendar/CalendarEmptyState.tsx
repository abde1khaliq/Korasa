import React from "react";
import { View, Text, Pressable } from "react-native";
import { Calendar, Plus } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CalendarEmptyStateProps {
  onAddClick: () => void;
  selectedDateHeading?: string;
}

export function CalendarEmptyState({
  onAddClick,
  selectedDateHeading,
}: CalendarEmptyStateProps) {
  const ink = useThemeColor("#F1EFEC", "#2B2724");

  return (
    <View className="my-8 items-center justify-center rounded-2xl border border-dashed border-rule bg-paper-card/60 p-8 text-center">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-tag">
        <Calendar size={26} color="#A8703F" strokeWidth={1.75} />
      </View>

      <Text className="mt-4 text-[18px] font-semibold text-ink">
        {selectedDateHeading
          ? `No lessons on ${selectedDateHeading}`
          : "No lessons scheduled"}
      </Text>

      <Text className="mt-1.5 max-w-[280px] text-center text-[14px] text-ink-soft">
        Schedule your upcoming lectures, study groups, and classes to receive automatic reminders.
      </Text>

      <Pressable
        onPress={onAddClick}
        className="mt-5 flex-row items-center rounded-full bg-onyx px-5 py-2.5 shadow-sm"
        style={{ gap: 6 }}
      >
        <Plus size={16} color={ink} strokeWidth={2} />
        <Text className="text-[14px] font-semibold text-paper">
          Add lesson
        </Text>
      </Pressable>
    </View>
  );
}
