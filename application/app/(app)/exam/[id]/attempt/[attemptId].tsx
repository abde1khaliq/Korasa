import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { AttemptSummaryScreen } from "@/components/exams/AttemptSummaryScreen";

export default function AttemptDetailScreen() {
  const { id, attemptId } = useLocalSearchParams<{
    id: string;
    attemptId: string;
  }>();
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <AttemptSummaryScreen examId={id} attemptId={attemptId} />
    </SafeAreaView>
  );
}
