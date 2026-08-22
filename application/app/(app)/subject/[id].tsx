import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { SubjectFolders } from "@/components/subject/SubjectFolders";

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <SubjectFolders subjectID={id} />
    </SafeAreaView>
  );
}