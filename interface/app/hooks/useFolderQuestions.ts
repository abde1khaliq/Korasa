import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Question } from "@/types/question";

export function useFolderQuestions(folderId: string | string[] | undefined) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchQuestions = async () => {
    if (!session || !folderId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${folderId}/questions`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );

      if (!res.ok) {
        throw new Error(`Failed to load questions (${res.status})`);
      }

      const data: Question[] = await res.json();
      setQuestions(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = (newQuestion: Question) => {
    setQuestions((prev) => [...prev, newQuestion]);
  };

  useEffect(() => {
    if (session && folderId) {
      fetchQuestions();
    }
  }, [session, folderId]);

  return {
    questions,
    isLoading,
    error,
    fetchQuestions,
    addQuestion,
  };
}