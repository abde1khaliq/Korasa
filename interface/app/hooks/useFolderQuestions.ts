import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Question } from "@/types/question";

export function useFolderQuestions(folderId: string | string[] | undefined) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const resolvedFolderId = Array.isArray(folderId) ? folderId[0] : folderId;

  const fetchQuestions = useCallback(
    async (isRefresh = false) => {
      if (!session?.accessToken || !resolvedFolderId) return;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${resolvedFolderId}/questions`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to load questions (${res.status})`);
        }

        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        console.error("Failed to fetch questions:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [session, resolvedFolderId],
  );

  const addQuestion = useCallback((newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
  }, []);

  const onRefresh = useCallback(() => {
    fetchQuestions(true);
  }, [fetchQuestions]);

  useEffect(() => {
    if (session?.accessToken && resolvedFolderId) {
      fetchQuestions();
    }
  }, [session, resolvedFolderId, fetchQuestions]);

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