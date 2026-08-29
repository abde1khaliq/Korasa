import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ExamAttemptRunner } from "@/components/exams/ExamAttemptRunner";

export default function ExamAttemptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <ExamAttemptRunner examId={id} />
    </SafeAreaView>
  );
}