import { Pressable, Text } from "react-native";
import { Difficulty, difficultyStyles, difficultyHex } from "@/components/misc/Screen";

export function FilterChip({
  level,
  n,
  active,
  onPress,
}: {
  level: Difficulty;
  n: number;
  active: boolean;
  onPress: () => void;
}) {
  const s = difficultyStyles[level];
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-full border px-3 py-1.5"
      style={{ gap: 6, borderColor: active ? difficultyHex[level] : "#E4DED4" }}
    >
      <Text className={`text-[12px] ${s.pillText}`}>{level}</Text>
      <Text className="text-[12px] text-ink-soft">{n}</Text>
    </Pressable>
  );
}