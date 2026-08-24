import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Question } from "@/types/question";

export function useFolderQuestions(folderId: string | undefined) {
  const { accessToken } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!accessToken || !folderId) return;
    setError(null);
    try {
      const data: Question[] = await apiFetch(
        `/api/folders/${folderId}/questions`,
        { token: accessToken },
      );
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    await load();
    setIsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [accessToken, folderId]);

  const addQuestion = (newQuestion: Question) =>
    setQuestions((prev) => [...prev, newQuestion]);

  useEffect(() => {
    if (accessToken && folderId) fetchQuestions();
  }, [accessToken, folderId]);

  return {
    questions,
    isLoading,
    isRefreshing,
    error,
    fetchQuestions,
    onRefresh,
    addQuestion,
  };
}
