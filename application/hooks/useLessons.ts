import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { Lesson, LessonInput } from "@/types/lesson";
import {
  scheduleLessonNotification,
  cancelLessonNotification,
  syncLessonNotifications,
} from "@/lib/notifications";

export function useLessons() {
  const { accessToken, user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!accessToken) return;
    try {
      setError(null);
      const [allLessons, upcoming] = await Promise.all([
        apiFetch("/api/lessons", { token: accessToken }),
        apiFetch("/api/lessons/upcoming?limit=10", { token: accessToken }),
      ]);

      const sortedAll: Lesson[] = allLessons ?? [];
      const sortedUpcoming: Lesson[] = upcoming ?? [];

      setLessons(sortedAll);
      setUpcomingLessons(sortedUpcoming);

      // Background notification sync
      syncLessonNotifications(sortedAll, user?.username).catch(() => {});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load lessons");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken, user?.username]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchLessons();
  }, [fetchLessons]);

  const createLesson = async (input: LessonInput): Promise<Lesson | Lesson[]> => {
    if (!accessToken) throw new Error("Not authenticated");
    const res = await apiFetch("/api/lessons", {
      method: "POST",
      body: JSON.stringify(input),
      token: accessToken,
    });

    const newLessons: Lesson[] = Array.isArray(res) ? res : [res];

    setLessons((prev) =>
      [...prev, ...newLessons].sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        return a.start_time.localeCompare(b.start_time);
      })
    );

    // Refresh upcoming list and notifications
    fetchLessons();

    return res;
  };

  const updateLesson = async (id: number, input: LessonInput): Promise<Lesson> => {
    if (!accessToken) throw new Error("Not authenticated");
    const updated: Lesson = await apiFetch(`/api/lessons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
      token: accessToken,
    });

    setLessons((prev) =>
      prev
        .map((l) => (l.id === id ? updated : l))
        .sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
          return a.start_time.localeCompare(b.start_time);
        })
    );

    // Re-schedule notification
    scheduleLessonNotification(updated, user?.username).catch(() => {});
    fetchLessons();

    return updated;
  };

  const deleteLesson = async (id: number): Promise<void> => {
    if (!accessToken) throw new Error("Not authenticated");
    await apiFetch(`/api/lessons/${id}`, {
      method: "DELETE",
      token: accessToken,
    });

    setLessons((prev) => prev.filter((l) => l.id !== id));
    setUpcomingLessons((prev) => prev.filter((l) => l.id !== id));

    // Cancel notification
    cancelLessonNotification(id).catch(() => {});
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
