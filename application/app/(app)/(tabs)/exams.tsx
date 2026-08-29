import { SafeAreaView } from "react-native-safe-area-context";
import { ExamsList } from "@/components/exams/ExamsList";

export default function ExamsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["bottom"]}>
      <ExamsList />
    </SafeAreaView>
  );
}