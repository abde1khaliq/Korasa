import { View } from "react-native";
import { Plus } from "lucide-react-native";
import { Pulse } from "@/components/common/Pulse";

export function HomeSubjectsSkeleton() {
  return (
    <View className="flex-1">
      <View className="px-6 pt-6">
        <Pulse style={{ height: 16, width: 64, borderRadius: 4, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ marginTop: 8, height: 48, width: 192, borderRadius: 8, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ marginTop: 8, height: 20, width: 256, borderRadius: 4, backgroundColor: "#E4DED4" }} />
      </View>

      <View className="mt-6 px-6">
        <View className="rounded-2xl border border-rule bg-onyx p-5" style={{ height: 130 }}>
          <Pulse style={{ height: 16, width: 128, borderRadius: 4, backgroundColor: "rgba(247,245,241,0.2)" }} />
          <Pulse style={{ marginTop: 8, height: 26, width: 160, borderRadius: 4, backgroundColor: "rgba(247,245,241,0.2)" }} />
          <Pulse style={{ marginTop: 16, height: 44, width: 112, borderRadius: 999, backgroundColor: "rgba(247,245,241,0.2)" }} />
        </View>
      </View>

      <View className="px-6 pt-8">
        <Pulse style={{ height: 30, width: 128, borderRadius: 4, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ marginTop: 4, height: 20, width: 96, borderRadius: 4, backgroundColor: "#E4DED4" }} />
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-4 px-6 py-6">
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ width: "48%", height: 190 }} className="rounded-2xl border border-rule bg-paper-card p-4">
            <Pulse style={{ height: 36, width: 64, borderRadius: 8, backgroundColor: "#E4DED4" }} />
            <View style={{ flex: 1 }} />
            <Pulse style={{ height: 26, width: 128, borderRadius: 4, backgroundColor: "#E4DED4" }} />
            <Pulse style={{ marginTop: 12, height: 16, width: 80, borderRadius: 4, backgroundColor: "#E4DED4" }} />
          </View>
        ))}
        <View style={{ width: "48%", height: 190 }} className="items-center justify-center rounded-2xl border border-dashed border-rule">
          <View className="items-center justify-center rounded-full border border-ink-faint" style={{ width: 48, height: 48 }}>
            <Plus size={20} color="#9C9086" strokeWidth={1.5} />
          </View>
        </View>
      </View>
    </View>
  );
}