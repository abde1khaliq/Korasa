import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClipboardList } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

// Stub: there's no "exam" concept anywhere in the backend models or
// services yet (only Subject / Folder / Question). This screen exists
// so the tab bar has a valid typed route to point at — the actual
// feature (what an "exam" even is here — timed run through a folder?
// spaced repetition?) needs to be scoped separately.
export default function ExamsScreen() {
  const inkFaint = useThemeColor("#9C9086", "#7A7166");

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <View className="flex-1 items-center justify-center px-6">
        <ClipboardList size={40} color={inkFaint} strokeWidth={1.5} />
        <Text className="font-display mt-5 text-[26px] text-ink text-center">
          Exams
        </Text>
        <Text className="mt-2 text-center text-[15px] text-ink-soft">
          Not built yet.
        </Text>
      </View>
    </SafeAreaView>
  );
}