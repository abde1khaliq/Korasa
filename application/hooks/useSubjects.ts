import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Subject } from "@/types/subject";

export function useSubjects() {
  const { accessToken } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSubject, setRecentSubject] = useState<Subject | null>(null);

  const fetchSubjects = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data: Subject[] = await apiFetch("/api/subjects/", { token: accessToken });
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentSubject = async () => {
    if (!accessToken) return;
    try {
      const data: Subject = await apiFetch("/api/subjects/recent", { token: accessToken });
      setRecentSubject(data);
    } catch {
      setRecentSubject(null);
    }
  };

  const deleteSubject = async (subjectId: number) => {
    try {
      await apiFetch(`/api/subjects/${subjectId}`, { method: "DELETE", token: accessToken! });
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      if (recentSubject?.id === subjectId) setRecentSubject(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Something went wrong" };
    }
  };

  const addSubject = (newSubject: Subject) => setSubjects((prev) => [...prev, newSubject]);

  const updateSubjectCounts = (subjectId: number, type: "folder" | "question") => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              [type === "folder" ? "folder_count" : "question_count"]:
                (s[type === "folder" ? "folder_count" : "question_count"] || 0) + 1,
            }
          : s,
      ),
    );
  };

  useEffect(() => {
    if (accessToken) {
      fetchSubjects();
      fetchRecentSubject();
    }
  }, [accessToken]);

  return {
    subjects,
    isLoading,
    error,
    recentSubject,
    fetchSubjects,
    deleteSubject,
    addSubject,
    updateSubjectCounts,
  };
}