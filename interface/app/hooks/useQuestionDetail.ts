import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Question } from "@/types/question";

export function useQuestionDetail(questionId: string | string[] | undefined) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [siblings, setSiblings] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchQuestion = async () => {
    if (!session || !questionId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${session?.accessToken}` };

      const qRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions/${questionId}`,
        { headers },
      );
      if (!qRes.ok) {
        throw new Error(`Failed to load question (${qRes.status})`);
      }
      const q: Question = await qRes.json();
      setQuestion(q);

      const listRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${q.folder_id}/questions`,
        { headers },
      );
      if (listRes.ok) {
        const list: Question[] = await listRes.json();
        setSiblings(list);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuestion(updatedQuestion);
    setSiblings((prev) =>
      prev.map((s) => (s.id === updatedQuestion.id ? updatedQuestion : s)),
    );
  };

  useEffect(() => {
    if (session && questionId) {
      fetchQuestion();
    }
  }, [session, questionId]);

  return {
    question,
    siblings,
    isLoading,
    error,
    fetchQuestion,
    updateQuestion,
  };
}