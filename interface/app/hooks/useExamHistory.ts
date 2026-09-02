import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Attempt } from "@/types/exam";

export function useExamHistory(examId: string | number) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchHistory = useCallback(async () => {
    if (!session?.accessToken || !examId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${examId}/attempts`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to load history (${res.status})`);
      }

      const data = await res.json();
      setAttempts(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load history";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [session, examId]);

  useEffect(() => {
    if (session?.accessToken && examId) {
      fetchHistory();
    }
  }, [session, examId, fetchHistory]);

  return {
    attempts,
    isLoading,
    error,
    fetchHistory,
  };
}
