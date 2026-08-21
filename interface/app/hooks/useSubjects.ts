import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Subject } from "@/types/subject";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSubject, setRecentSubject] = useState<Subject | null>(null);
  const { data: session } = useSession();

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to load subjects (${res.status})`);
      }

      const subjects: Subject[] = await res.json();
      setSubjects(subjects);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch subjects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentSubject = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/recent`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      if (!res.ok) {
        setRecentSubject(null);
        return;
      }
      const data: Subject = await res.json();
      setRecentSubject(data);
    } catch (err) {
      console.error("Failed to fetch recent subject:", err);
      setRecentSubject(null);
    }
  };

  const deleteSubject = async (subjectId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to delete subject (${res.status})`);
      }

      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      if (recentSubject?.id === subjectId) {
        setRecentSubject(null);
      }
      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      return { success: false, error: message };
    }
  };

  const addSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubjectCounts = (subjectId: number, type: 'folder' | 'question') => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              [type === 'folder' ? 'folder_count' : 'question_count']:
                (s[type === 'folder' ? 'folder_count' : 'question_count'] || 0) + 1,
            }
          : s,
      ),
    );
  };

  useEffect(() => {
    if (session) {
      fetchSubjects();
      fetchRecentSubject();
    }
  }, [session]);

  return {
    subjects,
    setSubjects,
    isLoading,
    error,
    recentSubject,
    fetchSubjects,
    deleteSubject,
    addSubject,
    updateSubjectCounts,
  };
}