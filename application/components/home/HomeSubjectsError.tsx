import { Text, View, Pressable } from "react-native";
import { RefreshCw } from "lucide-react-native";

export function HomeSubjectsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6 pb-16">
      <View className="items-center justify-center rounded-2xl bg-hard-soft" style={{ width: 64, height: 64 }}>
        <Text className="text-2xl">!</Text>
      </View>
      <Text className="mt-6 text-[24px] text-ink text-center">
        Couldn't load subjects
      </Text>
      <Text className="mt-3 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
        {error}
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-8 flex-row items-center gap-3 rounded-full border border-rule bg-paper-card px-8 py-3.5"
      >
        <RefreshCw size={16} color="#2B2724" strokeWidth={1.75} />
        <Text className="text-[16px] text-ink">Try again</Text>
      </Pressable>
    </View>
  );
}