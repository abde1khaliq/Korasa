import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Question } from "@/types/question";

export function useFolderQuestions(folderId: string | undefined) {
  const { accessToken } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!accessToken || !folderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data: Question[] = await apiFetch(`/api/folders/${folderId}/questions`, { token: accessToken });
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = (newQuestion: Question) => setQuestions((prev) => [...prev, newQuestion]);

  useEffect(() => {
    if (accessToken && folderId) fetchQuestions();
  }, [accessToken, folderId]);

  return { questions, isLoading, error, fetchQuestions, addQuestion };
}