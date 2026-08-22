import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { QuestionDetail } from "@/components/QuestionDetail/QuestionDetail";

export default function QuestionScreen() {
  const { id, folderId, questionId } = useLocalSearchParams<{
    id: string;
    folderId: string;
    questionId: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <QuestionDetail subjectId={id} folderId={folderId} questionId={questionId} />
    </SafeAreaView>
  );
}