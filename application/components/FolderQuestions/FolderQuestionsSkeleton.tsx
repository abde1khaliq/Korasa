import { View } from "react-native";
import { Search } from "lucide-react-native";
import { Pulse } from "@/components/common/Pulse";

export function FolderQuestionsSkeleton() {
  return (
    <View className="flex-1">
      <View className="px-5 pt-5">
        <Pulse
          style={{
            height: 34,
            width: 192,
            borderRadius: 8,
            backgroundColor: "#E4DED4",
          }}
        />
        <Pulse
          style={{
            marginTop: 8,
            height: 20,
            width: 128,
            borderRadius: 4,
            backgroundColor: "#E4DED4",
          }}
        />
      </View>

      <View className="mt-4 px-5">
        <View
          className="flex-row items-center rounded-2xl border border-rule bg-paper-card px-3.5 py-2.5"
          style={{ gap: 8 }}
        >
          <Search size={16} color="rgba(156,144,134,0.3)" strokeWidth={1.75} />
          <Pulse
            style={{
              height: 20,
              flex: 1,
              borderRadius: 4,
              backgroundColor: "rgba(156,144,134,0.1)",
            }}
          />
        </View>
      </View>

      <View className="mt-4 flex-row px-5" style={{ gap: 8 }}>
        {[48, 80, 96, 80].map((w, i) => (
          <Pulse
            key={i}
            style={{
              height: 32,
              width: w,
              borderRadius: 999,
              backgroundColor: "#E4DED4",
            }}
          />
        ))}
      </View>

      <View
        className="mt-5 px-4 flex-row flex-wrap justify-between"
        style={{ gap: 12 }}
      >
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={{
              width: "48%",
              height: 210,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(228, 222, 212, 0.7)",
              backgroundColor: "rgba(251, 250, 248, 0.8)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingTop: 12,
                paddingBottom: 8,
              }}
            >
              <Pulse
                style={{
                  height: 12,
                  width: 24,
                  borderRadius: 4,
                  backgroundColor: "#E4DED4",
                }}
              />
              <Pulse
                style={{
                  height: 16,
                  width: 44,
                  borderRadius: 999,
                  backgroundColor: "#E4DED4",
                }}
              />
            </View>

            <View style={{ paddingHorizontal: 12 }}>
              <Pulse
                style={{
                  height: 110,
                  width: "100%",
                  borderRadius: 14,
                  backgroundColor: "#E4DED4",
                }}
              />
            </View>

            <View
              style={{
                paddingHorizontal: 12,
                paddingTop: 10,
                paddingBottom: 12,
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <Pulse
                style={{
                  height: 13,
                  width: "80%",
                  borderRadius: 4,
                  backgroundColor: "#E4DED4",
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Pulse
                  style={{
                    height: 11,
                    width: 32,
                    borderRadius: 4,
                    backgroundColor: "#E4DED4",
                  }}
                />
                <Pulse
                  style={{
                    height: 16,
                    width: 16,
                    borderRadius: 999,
                    backgroundColor: "#E4DED4",
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
