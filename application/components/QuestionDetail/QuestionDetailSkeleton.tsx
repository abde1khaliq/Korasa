import { View } from "react-native";
import { Pulse } from "@/components/common/Pulse";

export function QuestionDetailSkeleton() {
  return (
    <View className="flex-1 px-5 pt-4">
      <View className="flex-row" style={{ gap: 8 }}>
        <Pulse style={{ height: 16, width: 64, borderRadius: 4, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ height: 16, width: 80, borderRadius: 4, backgroundColor: "#E4DED4" }} />
      </View>

      <Pulse style={{ marginTop: 16, height: 32, width: 96, borderRadius: 999, backgroundColor: "#E4DED4" }} />

      <View style={{ marginTop: 24, gap: 8 }}>
        <Pulse style={{ height: 20, width: "100%", borderRadius: 4, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ height: 20, width: "75%", borderRadius: 4, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ height: 20, width: "50%", borderRadius: 4, backgroundColor: "#E4DED4" }} />
      </View>

      <Pulse
        style={{
          marginTop: 32,
          height: 100,
          width: "100%",
          borderRadius: 16,
          backgroundColor: "rgba(228,222,212,0.4)",
        }}
      />

      <View className="absolute self-center flex-row" style={{ bottom: 20, gap: 10, width: 280 }}>
        <Pulse style={{ flex: 1, height: 44, borderRadius: 999, backgroundColor: "#E4DED4" }} />
        <Pulse style={{ flex: 1, height: 44, borderRadius: 999, backgroundColor: "#E4DED4" }} />
      </View>
    </View>
  );
}