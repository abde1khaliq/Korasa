import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function FolderScreen() {
  const { folderId, name } = useLocalSearchParams<{ folderId: string; name?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-paper items-center justify-center" edges={["bottom"]}>
      <View>
        <Text className="text-ink text-[20px]">{name || `Folder ${folderId}`}</Text>
        <Text className="text-ink-soft mt-2">Questions list not built yet.</Text>
      </View>
    </SafeAreaView>
  );
}