import { useRouter } from "expo-router";
import { Question } from "@/types/question";

export function useQuestionNavigation(
  subjectId: string,
  folderId: string,
  question: Question | null,
  siblings: Question[],
) {
  const router = useRouter();

  if (!question) {
    return { prevQuestion: null, nextQuestion: null, goTo: () => {} };
  }

  const index = siblings.findIndex((s) => s.id === question.id);
  const prevQuestion = index > 0 ? siblings[index - 1] : null;
  const nextQuestion = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const goTo = (id: number) => {
    router.replace({
      pathname: "/subject/[id]/folder/[folderId]/question/[questionId]",
      params: { id: subjectId, folderId, questionId: String(id) },
    });
  };

  return { prevQuestion, nextQuestion, goTo };
}