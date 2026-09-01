import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { Attempt } from "@/types/exam";
import {
  formatAttemptDate,
  formatDuration,
  scorePercent,
} from "@/lib/examUtils";

export function AttemptSummaryScreen({
  examId,
  attemptId,
}: {
  examId: string;
  attemptId: string;
}) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch(`/api/exams/${examId}/attempts/${attemptId}`, {
      token: accessToken,
    })
      .then(setAttempt)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Could not load this attempt",
        ),
      );
  }, [accessToken, examId, attemptId]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[16px] text-ink text-center">{error}</Text>
      </View>
    );
  }

  if (!attempt) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#6E655C" />
      </View>
    );
  }

  const pct = scorePercent(attempt.correct_count, attempt.total_count);

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-[13px] tracking-widest text-ink-faint uppercase">
        {formatAttemptDate(attempt.completed_at)}
      </Text>
      <Text className="font-display mt-3 text-[56px] text-ink">{pct}%</Text>
      <Text className="mt-2 text-[17px] text-ink-soft">
        {attempt.correct_count} of {attempt.total_count} correct
      </Text>
      <Text className="mt-1 text-[14px] text-ink-faint">
        {formatDuration(attempt.duration_secs)}
      </Text>
      <Pressable
        onPress={() => router.back()}
        className="mt-10 rounded-full border border-rule px-8 py-4"
      >
        <Text className="text-[16px] text-ink">Back</Text>
      </Pressable>
    </View>
  );
}
