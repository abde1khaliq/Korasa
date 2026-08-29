import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Exam } from "@/types/exam";

export function useExam(examId: string | undefined) {
  const { accessToken } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || !examId) return;
    setError(null);
    try {
      const data: Exam = await apiFetch(`/api/exams/${examId}`, { token: accessToken });
      setExam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [accessToken, examId]);

  const fetchExam = useCallback(async () => {
    setIsLoading(true);
    await load();
    setIsLoading(false);
  }, [load]);

  useEffect(() => {
    if (accessToken && examId) fetchExam();
  }, [accessToken, examId, fetchExam]);

  return { exam, isLoading, error, fetchExam, setExam };
}