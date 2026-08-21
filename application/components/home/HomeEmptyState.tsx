import { Text, View, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { EmptyIllustration } from "./EmptyIllustration";

export function HomeEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <View className="flex-1">
      <View className="px-6 pt-8">
        <Text className="text-[48px] leading-[52px] text-ink" style={{ fontWeight: "600" }}>
          Subjects
        </Text>
        <Text className="mt-3 text-[17px] text-ink-soft">
          A quiet place for the questions worth remembering.
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6 pb-16">
        <EmptyIllustration />
        <Text className="mt-10 text-[28px] text-ink text-center" style={{ fontWeight: "600" }}>
          Begin with a subject
        </Text>
        <Text className="mt-3 max-w-[19rem] text-center text-[17px] leading-relaxed text-ink-soft">
          English, Chemistry, or anything you're learning.
        </Text>
        <Pressable
          onPress={onCreateClick}
          className="mt-8 flex-row items-center gap-3 rounded-full bg-onyx px-8 py-4"
        >
          <Plus size={20} color="#F7F5F1" strokeWidth={1.75} />
          <Text className="text-[17px] text-paper">Create your first subject</Text>
        </Pressable>
      </View>
    </View>
  );
}