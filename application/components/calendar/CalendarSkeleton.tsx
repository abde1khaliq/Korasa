import React from "react";
import { View } from "react-native";

export function CalendarSkeleton() {
  return (
    <View className="flex-1 bg-paper px-5 pt-6">
      <View className="h-10 w-44 rounded-xl bg-paper-card" />
      <View className="mt-2 h-4 w-32 rounded-lg bg-paper-card" />
      <View className="mt-5 h-12 w-full rounded-2xl bg-paper-card" />
      <View className="mt-4 h-64 w-full rounded-2xl bg-paper-card" />
      <View className="mt-6" style={{ gap: 12 }}>
        <View className="h-24 w-full rounded-2xl bg-paper-card" />
        <View className="h-24 w-full rounded-2xl bg-paper-card" />
      </View>
    </View>
  );
}
