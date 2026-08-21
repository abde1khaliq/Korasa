import { View } from "react-native";

export function EmptyIllustration() {
  return (
    <View style={{ width: 160, height: 130 }}>
      <View
        style={{
          position: "absolute", left: 0, top: 8, width: 110, height: 115,
          transform: [{ rotate: "-6deg" }], borderRadius: 16,
          borderWidth: 1, borderColor: "#E4DED4", backgroundColor: "#FBFAF8",
        }}
      />
      <View
        style={{
          position: "absolute", right: 0, top: 8, width: 110, height: 115,
          transform: [{ rotate: "6deg" }], borderRadius: 16,
          borderWidth: 1, borderColor: "#E4DED4", backgroundColor: "#FBFAF8",
        }}
      />
      <View
        style={{
          position: "absolute", left: 20, top: 0, width: 120, height: 125,
          borderRadius: 16, borderWidth: 1, borderColor: "#E4DED4",
          backgroundColor: "#FBFAF8", padding: 20,
        }}
      >
        <View style={{ marginTop: 4, height: 7, width: "60%", borderRadius: 4, backgroundColor: "#EFE2CD" }} />
        <View style={{ marginTop: 12, height: 7, width: "80%", borderRadius: 4, backgroundColor: "#EFE2CD" }} />
        <View style={{ marginTop: 12, height: 7, width: "52%", borderRadius: 4, backgroundColor: "#EFE2CD" }} />
        <View style={{ marginTop: 12, height: 7, width: "40%", borderRadius: 4, backgroundColor: "#EFE2CD" }} />
      </View>
    </View>
  );
}