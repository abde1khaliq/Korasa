import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Question } from "@/types/question";

export function useQuestionDetail(questionId: string | undefined) {
  const { accessToken } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [siblings, setSiblings] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!accessToken || !questionId) return;
    setError(null);
    try {
      const q: Question = await apiFetch(`/api/questions/${questionId}`, { token: accessToken });
      setQuestion(q);
      try {
        const list: Question[] = await apiFetch(`/api/folders/${q.folder_id}/questions`, { token: accessToken });
        setSiblings(list);
      } catch {
        setSiblings([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const fetchQuestion = async () => {
    setIsLoading(true);
    await load();
    setIsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [accessToken, questionId]);

  const updateQuestion = (updated: Question) => {
    setQuestion(updated);
    setSiblings((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  useEffect(() => {
    if (accessToken && questionId) fetchQuestion();
  }, [accessToken, questionId]);

  return { question, siblings, isLoading, isRefreshing, error, fetchQuestion, onRefresh, updateQuestion };
}