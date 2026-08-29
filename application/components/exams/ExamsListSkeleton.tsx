import { View } from "react-native";
import { Pulse } from "@/components/common/Pulse";

export function ExamsListSkeleton() {
  return (
    <View className="flex-1 px-6 pt-6">
      <Pulse style={{ height: 40, width: 160, borderRadius: 8, backgroundColor: "#E4DED4" }} />
      <View style={{ marginTop: 24, gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <Pulse key={i} style={{ height: 96, borderRadius: 16, backgroundColor: "#E4DED4" }} />
        ))}
      </View>
    </View>
  );
}