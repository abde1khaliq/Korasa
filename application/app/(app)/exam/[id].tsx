import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ExamDetail } from "@/components/exams/ExamDetail";

export default function ExamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <ExamDetail examId={id} />
    </SafeAreaView>
  );
}
