import { View, Text } from "react-native";

export type Difficulty = "Easy" | "Medium" | "Hard";

export const difficultyStyles: Record<Difficulty, { dot: string; pillBg: string; pillText: string }> = {
  Easy: { dot: "bg-easy", pillBg: "bg-easy-soft", pillText: "text-easy" },
  Medium: { dot: "bg-medium", pillBg: "bg-medium-soft", pillText: "text-medium" },
  Hard: { dot: "bg-hard", pillBg: "bg-hard-soft", pillText: "text-hard" },
};

// Explicit hex fallback for cases NativeWind's `border-current` won't resolve.
export const difficultyHex: Record<Difficulty, string> = {
  Easy: "#3F7D5C",
  Medium: "#A17A2E",
  Hard: "#A34A34",
};

export function DifficultyPill({ level }: { level: Difficulty }) {
  const s = difficultyStyles[level];
  return (
    <View className={`flex-row items-center rounded-full px-3 py-1 ${s.pillBg}`} style={{ gap: 8 }}>
      <View className={`rounded-full ${s.dot}`} style={{ width: 7, height: 7 }} />
      <Text className={`text-[15px] ${s.pillText}`}>{level}</Text>
    </View>
  );
}