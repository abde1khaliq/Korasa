import { View, Text, Pressable } from "react-native";
import { ChevronLeft, RefreshCw } from "lucide-react-native";

export function QuestionDetailError({
  error,
  onRetry,
  onBack,
}: {
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-6 pt-5">
        <Pressable onPress={onBack}>
          <ChevronLeft size={24} color="#2B2724" strokeWidth={1.75} />
        </Pressable>
        <Text className="text-[18px] text-ink" style={{ fontWeight: "600" }}>Question</Text>
        <View style={{ width: 24 }} />
      </View>
      <View className="flex-1 items-center justify-center px-6 pb-16">
        <View className="items-center justify-center rounded-2xl bg-hard-soft" style={{ width: 48, height: 48 }}>
          <Text className="text-xl">!</Text>
        </View>
        <Text className="mt-5 text-[20px] text-ink text-center" style={{ fontWeight: "600" }}>
          Couldn't load this question
        </Text>
        <Text className="mt-2 max-w-[19rem] text-center text-[15px] leading-relaxed text-ink-soft">
          {error ?? "Question not found."}
        </Text>
        <Pressable
          onPress={onRetry}
          className="mt-6 flex-row items-center gap-2.5 rounded-full border border-rule bg-paper-card px-6 py-3"
        >
          <RefreshCw size={16} color="#2B2724" strokeWidth={1.75} />
          <Text className="text-[15px] text-ink">Try again</Text>
        </Pressable>
      </View>
    </View>
  );
}