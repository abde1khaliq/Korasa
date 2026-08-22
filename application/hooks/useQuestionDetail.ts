import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Question } from "@/types/question";

export function useQuestionDetail(questionId: string | undefined) {
  const { accessToken } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [siblings, setSiblings] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    if (!accessToken || !questionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const q: Question = await apiFetch(`/api/questions/${questionId}`, { token: accessToken });
      setQuestion(q);

      try {
        const list: Question[] = await apiFetch(`/api/folders/${q.folder_id}/questions`, { token: accessToken });
        setSiblings(list);
      } catch {
        // Non-fatal: prev/next nav just won't work if this fails.
        setSiblings([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuestion = (updated: Question) => {
    setQuestion(updated);
    setSiblings((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  useEffect(() => {
    if (accessToken && questionId) fetchQuestion();
  }, [accessToken, questionId]);

  return { question, siblings, isLoading, error, fetchQuestion, updateQuestion };
}