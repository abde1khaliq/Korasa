import { Text, View, Pressable } from "react-native";
import { ClipboardList, Plus } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export function ExamsEmptyState({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  return (
    <View className="flex-1">
      <View className="px-6 pt-8">
        <Text className="font-display text-[48px] leading-[52px] text-ink">
          Exams
        </Text>
        <Text className="mt-3 text-[17px] text-ink-soft">
          Test yourself on what you've saved.
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6 pb-16">
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 96,
            height: 96,
            backgroundColor: "rgba(156,144,134,0.1)",
          }}
        >
          <ClipboardList size={40} color="#9C9086" strokeWidth={1.5} />
        </View>
        <Text className="font-display mt-8 text-[28px] text-ink text-center">
          Build your first exam
        </Text>
        <Text className="mt-3 max-w-[19rem] text-center text-[17px] leading-relaxed text-ink-soft">
          Pick a subject or folder, choose how many questions, and go.
        </Text>
        <Pressable
          onPress={onCreateClick}
          className="mt-8 flex-row items-center gap-3 rounded-full bg-onyx px-8 py-4"
        >
          <Plus size={20} color={ink} strokeWidth={1.75} />
          <Text className="text-[17px] text-paper">Create an exam</Text>
        </Pressable>
      </View>
    </View>
  );
}
