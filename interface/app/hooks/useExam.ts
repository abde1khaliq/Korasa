import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Exam } from "@/types/exam";

export function useExam(examId: string | number) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchExam = useCallback(async () => {
    if (!session?.accessToken || !examId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to load exam (${res.status})`);
      }

      const data: Exam = await res.json();
      setExam(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load exam";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [session, examId]);

  useEffect(() => {
    if (session?.accessToken && examId) {
      fetchExam();
    }
  }, [session, examId, fetchExam]);

  return {
    exam,
    isLoading,
    error,
    fetchExam,
    setExam,
  };
}
