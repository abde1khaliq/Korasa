import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Moon, Sun, ChevronRight, Sparkles } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWhatsNew } from "@/context/WhatsNewContext";

export default function SettingsScreen() {
  const { scheme, toggle } = useTheme();
  const { openWhatsNew, hasUnseen, activeRelease } = useWhatsNew();
  const ink = useThemeColor("#2B2724", "#F1EFEC");
  const brandColor = useThemeColor("#A8703F", "#C99A66");

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <View className="px-6 pt-6">
        <Text className="font-display text-[34px] text-ink">Settings</Text>
      </View>

      <View className="mt-8 px-6">
        <Text className="text-[13px] tracking-widest text-ink-faint uppercase">
          Appearance
        </Text>
        <View className="mt-3 overflow-hidden rounded-2xl border border-rule bg-paper-card">
          <Pressable
            onPress={toggle}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center" style={{ gap: 12 }}>
              {scheme === "dark" ? (
                <Sun size={18} color={ink} strokeWidth={1.75} />
              ) : (
                <Moon size={18} color={ink} strokeWidth={1.75} />
              )}
              <Text className="text-[15px] text-ink">
                {scheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              </Text>
            </View>
            <ChevronRight size={18} color="#9C9086" strokeWidth={1.75} />
          </Pressable>
        </View>
      </View>

      <View className="mt-8 px-6">
        <Text className="text-[13px] tracking-widest text-ink-faint uppercase">
          About
        </Text>
        <View className="mt-3 overflow-hidden rounded-2xl border border-rule bg-paper-card">
          <Pressable
            onPress={() => openWhatsNew()}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <Sparkles size={18} color={ink} strokeWidth={1.75} />
              <View className="flex-row items-center gap-2">
                <Text className="text-[15px] text-ink">{"What's New in Korasa"}</Text>
                {hasUnseen && (
                  <View className="rounded-full bg-easy px-1.5 py-0.5">
                    <Text className="font-mono text-[9px] font-bold text-white uppercase">
                      New
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="font-mono text-[12px] text-ink-faint">
                {activeRelease.version}
              </Text>
              <ChevronRight size={18} color="#9C9086" strokeWidth={1.75} />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
