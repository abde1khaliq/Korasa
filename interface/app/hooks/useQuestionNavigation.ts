import { useRouter } from "next/navigation";
import { Question } from "@/types/question";

export function useQuestionNavigation(question: Question | null, siblings: Question[]) {
  const router = useRouter();

  if (!question) {
    return {
      prevQuestion: null,
      nextQuestion: null,
      goTo: () => {},
    };
  }

  const index = siblings.findIndex((s) => s.id === question.id);
  const prevQuestion = index > 0 ? siblings[index - 1] : null;
  const nextQuestion =
    index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const goTo = (id: number) => {
    const path = window.location.pathname;
    const newPath = path.replace(/\/question\/\d+$/, `/question/${id}`);
    router.push(newPath);
  };

  return {
    prevQuestion,
    nextQuestion,
    goTo,
  };
}