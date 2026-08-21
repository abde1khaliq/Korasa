import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <Pressable onPress={logout}>
            <Text className="text-brand text-[15px]">Sign out</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Subjects" }} />
    </Stack>
  );
}