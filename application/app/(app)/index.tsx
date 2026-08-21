import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-paper px-6 pt-6">
      <Text className="text-[40px] text-ink" style={{ fontWeight: "600" }}>
        {user?.username ?? ""}
      </Text>
      <View className="mt-4">
        <Text className="text-ink-soft text-[17px]">
          Subjects grid goes here next.
        </Text>
      </View>
    </SafeAreaView>
  );
}