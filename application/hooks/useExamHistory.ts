import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Attempt } from "@/types/exam";

export function useExamHistory(examId: string | undefined) {
  const { accessToken } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || !examId) return;
    setError(null);
    try {
      const data: Attempt[] = await apiFetch(`/api/exams/${examId}/attempts`, {
        token: accessToken,
      });
      setAttempts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [accessToken, examId]);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    await load();
    setIsLoading(false);
  }, [load]);

  useEffect(() => {
    if (accessToken && examId) fetchHistory();
  }, [accessToken, examId, fetchHistory]);

  return { attempts, isLoading, error, fetchHistory };
}