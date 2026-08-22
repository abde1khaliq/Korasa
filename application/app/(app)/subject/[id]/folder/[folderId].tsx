import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { FolderQuestions } from "@/components/FolderQuestions/FolderQuestions";

export default function FolderScreen() {
  const { id, folderId, name } = useLocalSearchParams<{ id: string; folderId: string; name?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <FolderQuestions subjectId={id} folderId={folderId} folderName={name || "Folder"} />
    </SafeAreaView>
  );
}