import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Exam } from "@/types/exam";

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchExams = useCallback(
    async (isRefresh = false) => {
      if (!session?.accessToken) return;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to load exams (${res.status})`);
        }

        const data = await res.json();
        setExams(Array.isArray(data) ? data : []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        console.error("Failed to fetch exams:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [session],
  );

  useEffect(() => {
    if (session?.accessToken) {
      fetchExams();
    }
  }, [session, fetchExams]);

  const onRefresh = useCallback(() => {
    fetchExams(true);
  }, [fetchExams]);

  const addExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
  };

  return {
    exams,
    isLoading,
    isRefreshing,
    error,
    fetchExams,
    onRefresh,
    addExam,
  };
}
