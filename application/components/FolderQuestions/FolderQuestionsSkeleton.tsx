import { View } from "react-native";
import { Search } from "lucide-react-native";
import { Pulse } from "@/components/common/Pulse";

export function FolderQuestionsSkeleton() {
  return (
    <View className="flex-1">
      <View className="px-5 pt-5">
        <Pulse style={{ height: 34, width: 192, borderRadius: 8, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ marginTop: 8, height: 20, width: 128, borderRadius: 4, backgroundColor: "#E4DED4" }} />
      </View>

      <View className="mt-4 px-5">
        <View className="flex-row items-center rounded-xl border border-rule bg-paper-card px-3 py-2" style={{ gap: 8 }}>
          <Search size={16} color="rgba(156,144,134,0.3)" strokeWidth={1.75} />
          <Pulse style={{ height: 20, flex: 1, borderRadius: 4, backgroundColor: "rgba(156,144,134,0.1)" }} />
        </View>
      </View>

      <View className="mt-4 flex-row px-5" style={{ gap: 8 }}>
        {[48, 80, 96, 80].map((w, i) => (
          <Pulse key={i} style={{ height: 32, width: w, borderRadius: 999, backgroundColor: "#E4DED4" }} />
        ))}
      </View>

      <View className="mt-4 px-5" style={{ gap: 24 }}>
        {[...Array(6)].map((_, i) => (
          <View key={i} className="flex-row" style={{ gap: 16 }}>
            <Pulse style={{ height: 13, width: 20, borderRadius: 4, backgroundColor: "#E4DED4" }} />
            <View style={{ flex: 1, gap: 8 }}>
              <Pulse style={{ height: 20, width: "100%", borderRadius: 4, backgroundColor: "#E4DED4" }} />
              <Pulse style={{ height: 20, width: "75%", borderRadius: 4, backgroundColor: "#E4DED4" }} />
              <View className="flex-row items-center mt-1" style={{ gap: 10 }}>
                <Pulse style={{ height: 24, width: 64, borderRadius: 999, backgroundColor: "#E4DED4" }} />
                <Pulse style={{ height: 20, width: 80, borderRadius: 4, backgroundColor: "#E4DED4" }} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}