import { View } from "react-native";
import { Folder, ChevronRight } from "lucide-react-native";
import { Pulse } from "@/components/common/Pulse";

export function SubjectFoldersSkeleton() {
  return (
    <View className="flex-1">
      <View className="px-6 pt-6">
        <Pulse style={{ height: 46, width: 192, borderRadius: 8, backgroundColor: "#E4DED4" }} />
        <View className="mt-3 flex-row items-center" style={{ gap: 8 }}>
          <Pulse style={{ height: 20, width: 64, borderRadius: 4, backgroundColor: "#E4DED4" }} />
          <Pulse style={{ height: 20, width: 80, borderRadius: 4, backgroundColor: "#E4DED4" }} />
        </View>
      </View>

      <View className="mt-8 px-6">
        <Pulse style={{ height: 16, width: 80, borderRadius: 4, backgroundColor: "#E4DED4" }} />
      </View>

      <View className="mt-3 px-5">
        {[...Array(5)].map((_, i) => (
          <View key={i} className="flex-row items-center px-2 py-4" style={{ gap: 16 }}>
            <View
              className="items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, backgroundColor: "rgba(156,144,134,0.1)" }}
            >
              <Folder size={24} color="rgba(156,144,134,0.3)" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Pulse style={{ height: 20, width: 128, borderRadius: 4, backgroundColor: "#E4DED4" }} />
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <Pulse style={{ height: 16, width: 80, borderRadius: 4, backgroundColor: "#E4DED4" }} />
                <Pulse style={{ height: 16, width: 64, borderRadius: 4, backgroundColor: "#E4DED4" }} />
              </View>
            </View>
            <ChevronRight size={20} color="rgba(156,144,134,0.2)" strokeWidth={2} />
          </View>
        ))}
      </View>

      <View
        className="absolute self-center flex-row items-center rounded-full"
        style={{ bottom: 24, gap: 8, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: "#E4DED4" }}
      >
        <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ height: 16, width: 96, borderRadius: 4, backgroundColor: "#E4DED4" }} />
      </View>
    </View>
  );
}