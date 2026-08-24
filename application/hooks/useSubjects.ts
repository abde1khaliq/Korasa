import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Subject } from "@/types/subject";

export function useSubjects() {
  const { accessToken } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSubject, setRecentSubject] = useState<Subject | null>(null);

  const load = async () => {
    if (!accessToken) return;
    setError(null);
    try {
      const [subjectsData, recentData] = await Promise.all([
        apiFetch("/api/subjects/", { token: accessToken }),
        apiFetch("/api/subjects/recent", { token: accessToken }).catch(
          () => null,
        ),
      ]);
      setSubjects(subjectsData);
      setRecentSubject(recentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const fetchSubjects = async () => {
    setIsLoading(true);
    await load();
    setIsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [accessToken]);

  const deleteSubject = async (subjectId: number) => {
    try {
      await apiFetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
        token: accessToken!,
      });
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      if (recentSubject?.id === subjectId) setRecentSubject(null);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Something went wrong",
      };
    }
  };

  const addSubject = (newSubject: Subject) =>
    setSubjects((prev) => [...prev, newSubject]);

  const updateSubjectCounts = (
    subjectId: number,
    type: "folder" | "question",
  ) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              [type === "folder" ? "folder_count" : "question_count"]:
                (s[type === "folder" ? "folder_count" : "question_count"] ||
                  0) + 1,
            }
          : s,
      ),
    );
  };

  useEffect(() => {
    if (accessToken) fetchSubjects();
  }, [accessToken]);

  return {
    subjects,
    isLoading,
    isRefreshing,
    error,
    recentSubject,
    fetchSubjects,
    onRefresh,
    deleteSubject,
    addSubject,
    updateSubjectCounts,
  };
}
