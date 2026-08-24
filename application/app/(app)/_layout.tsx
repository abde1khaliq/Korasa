import { Stack } from "expo-router";
import { View } from "react-native";
import { Header } from "@/components/Header";

// Header lives OUTSIDE both the Stack and the nested Tabs navigator, so it
// never re-mounts or animates when switching tabs or pushing a detail
// screen — only the content below it changes.
export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          {/* (tabs) is a route group: Home/Exams/Settings/Profile live
              inside a Tabs navigator, switched with no push animation and
              no stack growth. */}
          <Stack.Screen name="(tabs)" />

          {/* Genuine hierarchical drill-down — pushing here is correct,
              "back" should go up one level. */}
          <Stack.Screen name="subject/[id]" />
          <Stack.Screen name="subject/[id]/folder/[folderId]" />
          <Stack.Screen name="subject/[id]/folder/[folderId]/question/[questionId]" />
        </Stack>
      </View>
    </View>
  );
}