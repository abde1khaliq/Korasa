import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Exam } from "@/types/exam";

export function useExams() {
  const { accessToken } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!accessToken) return;
    setError(null);
    try {
      const data: Exam[] = await apiFetch("/api/exams/", {
        token: accessToken,
      });
      setExams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const fetchExams = async () => {
    setIsLoading(true);
    await load();
    setIsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [accessToken]);

  const addExam = (exam: Exam) => setExams((prev) => [exam, ...prev]);

  useEffect(() => {
    if (accessToken) fetchExams();
  }, [accessToken]);

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
