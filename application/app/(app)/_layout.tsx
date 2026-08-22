import { Stack } from "expo-router";
import { Header } from "@/components/Header";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ header: () => <Header /> }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="subject/[id]" />
      <Stack.Screen name="subject/[id]/folder/[folderId]" />
      <Stack.Screen name="subject/[id]/folder/[folderId]/question/[questionId]" />
    </Stack>
  );
}