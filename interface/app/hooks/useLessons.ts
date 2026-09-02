import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Lesson, LessonInput } from "@/types/lesson";
import { getNextOccurrenceDate } from "@/app/utils/lessonUtils";

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchLessons = useCallback(
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessons`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to load lessons (${res.status})`);
        }

        const data: Lesson[] = await res.json();
        setLessons(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        console.error("Failed to fetch lessons:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [session],
  );

  useEffect(() => {
    if (session?.accessToken) {
      fetchLessons();
    }
  }, [session, fetchLessons]);

  const onRefresh = useCallback(() => {
    fetchLessons(true);
  }, [fetchLessons]);

  const upcomingLessons = useMemo(() => {
    const list = [...lessons];
    list.sort((a, b) => {
      const nextA = getNextOccurrenceDate(a).getTime();
      const nextB = getNextOccurrenceDate(b).getTime();
      return nextA - nextB;
    });
    return list;
  }, [lessons]);

  const createLesson = async (input: LessonInput) => {
    if (!session?.accessToken) throw new Error("Not authenticated");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(input),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      let msg = "Failed to create lesson";
      try {
        const errJson = JSON.parse(text);
        if (errJson.error) msg = errJson.error;
      } catch {}
      throw new Error(msg);
    }

    const created = await res.json();
    if (Array.isArray(created)) {
      setLessons((prev) => [...created, ...prev]);
    } else {
      setLessons((prev) => [created, ...prev]);
    }
    return created;
  };

  const updateLesson = async (id: number, input: LessonInput) => {
    if (!session?.accessToken) throw new Error("Not authenticated");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessons/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(input),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      let msg = "Failed to update lesson";
      try {
        const errJson = JSON.parse(text);
        if (errJson.error) msg = errJson.error;
      } catch {}
      throw new Error(msg);
    }

    const updated: Lesson = await res.json();
    setLessons((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  };

  const deleteLesson = async (id: number) => {
    if (!session?.accessToken) throw new Error("Not authenticated");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessons/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to delete lesson");
    }

    setLessons((prev) => prev.filter((l) => l.id !== id));
    return { success: true };
  };

  return {
    lessons,
    upcomingLessons,
    isLoading,
    isRefreshing,
    error,
    fetchLessons,
    onRefresh,
    createLesson,
    updateLesson,
    deleteLesson,
  };
}
