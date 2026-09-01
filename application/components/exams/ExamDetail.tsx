import { useCallback, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Play, MoreHorizontal, Clock, Layers } from "lucide-react-native";
import { useExam } from "@/hooks/useExam";
import { useExamHistory } from "@/hooks/useExamHistory";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { DifficultyPill } from "@/components/misc/Screen";
import { difficultyLabels } from "@/lib/questionUtils";
import {
  examTypeLabels,
  formatAttemptDate,
  formatDuration,
  scorePercent,
} from "@/lib/examUtils";
import { RenameExamModal } from "./RenameExamModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { ActionSheet } from "@/components/common/ActionSheet";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Attempt } from "@/types/exam";

export function ExamDetail({ examId }: { examId: string }) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  const { exam, isLoading, error, fetchExam, setExam } = useExam(examId);
  const {
    attempts,
    isLoading: historyLoading,
    fetchHistory,
  } = useExamHistory(examId);
  const { notification, showNotification } = useNotification();

  const [showRename, setShowRename] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const handleStart = () => {
    if (!exam) return;
    router.push({
      pathname: "/exam/[id]/attempt",
      params: { id: String(exam.id) },
    });
  };

  const handleDelete = async () => {
    if (!exam) return;
    setConfirmingDelete(false);
    try {
      await apiFetch(`/api/exams/${exam.id}`, {
        method: "DELETE",
        token: accessToken!,
      });
      router.back();
    } catch (err) {
      showNotification(
        err instanceof ApiError ? err.message : "Failed to delete exam",
      );
    }
  };

  if (isLoading || !exam) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-[15px] text-ink-soft">Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[16px] text-ink text-center">{error}</Text>
        <Pressable
          onPress={fetchExam}
          className="mt-4 rounded-full border border-rule px-6 py-3"
        >
          <Text className="text-[15px] text-ink">Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="px-6 pt-6 flex-row items-start justify-between">
        <View style={{ flex: 1 }}>
          <Text className="font-display text-[32px] leading-[36px] text-ink">
            {exam.name}
          </Text>
          <Text className="mt-2 text-[15px] text-ink-soft">
            {exam.scope_name}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowActions(true)}
          hitSlop={8}
          className="pt-1"
        >
          <MoreHorizontal size={22} color="#6E655C" strokeWidth={1.75} />
        </Pressable>
      </View>

      <View className="mt-4 flex-row flex-wrap px-6" style={{ gap: 8 }}>
        <View className="rounded-full bg-tag px-3 py-1.5">
          <Text className="text-[12px] text-ink" style={{ fontWeight: "500" }}>
            {examTypeLabels[exam.type]}
          </Text>
        </View>
        {exam.difficulties.map((d) => (
          <DifficultyPill key={d} level={difficultyLabels[d]} />
        ))}
      </View>

      <View className="mt-4 flex-row px-6" style={{ gap: 20 }}>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Layers size={14} color="#9C9086" strokeWidth={1.75} />
          <Text className="text-[13px] text-ink-soft">
            {exam.type === "full" ? "All" : exam.question_count} questions
          </Text>
        </View>
        {exam.time_limit_minutes ? (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Clock size={14} color="#9C9086" strokeWidth={1.75} />
            <Text className="text-[13px] text-ink-soft">
              {exam.time_limit_minutes} min
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={handleStart}
        className="mx-6 mt-6 flex-row items-center justify-center rounded-full bg-onyx py-4"
        style={{ gap: 10 }}
      >
        <Play size={18} color={ink} strokeWidth={1.75} />
        <Text className="text-[16px] text-paper" style={{ fontWeight: "500" }}>
          Start exam
        </Text>
      </Pressable>

      <View className="mt-8 px-6">
        <Text className="text-[13px] tracking-widest text-ink-faint uppercase">
          History
        </Text>
      </View>

      <FlatList
        data={attempts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 40,
        }}
        ListEmptyComponent={
          !historyLoading ? (
            <Text className="px-2 py-6 text-center text-[14px] text-ink-faint">
              No attempts yet.
            </Text>
          ) : null
        }
        renderItem={({ item }: { item: Attempt }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/exam/[id]/attempt/[attemptId]",
                params: { id: String(exam.id), attemptId: String(item.id) },
              })
            }
            className="flex-row items-center justify-between rounded-xl px-2 py-3"
          >
            <View>
              <Text className="text-[15px] text-ink">
                {formatAttemptDate(item.completed_at)}
              </Text>
              <Text className="mt-0.5 text-[13px] text-ink-faint">
                {formatDuration(item.duration_secs)}
              </Text>
            </View>
            <Text className="text-[15px] text-ink-soft">
              {item.completed_at
                ? `${item.correct_count}/${item.total_count} · ${scorePercent(item.correct_count, item.total_count)}%`
                : "In progress"}
            </Text>
          </Pressable>
        )}
      />

      {showRename && (
        <RenameExamModal
          exam={exam}
          onClose={() => setShowRename(false)}
          onUpdated={(updated) => {
            setExam(updated);
            showNotification("Exam renamed");
          }}
        />
      )}

      <ActionSheet
        visible={showActions}
        title={exam.name}
        onCancel={() => setShowActions(false)}
        options={[
          {
            label: "Rename",
            onPress: () => {
              setShowActions(false);
              setShowRename(true);
            },
          },
          {
            label: "Delete",
            destructive: true,
            onPress: () => {
              setShowActions(false);
              setConfirmingDelete(true);
            },
          },
        ]}
      />

      <ConfirmModal
        visible={confirmingDelete}
        title="Delete exam"
        message="This deletes the exam and all of its attempt history. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <Notification message={notification} />
    </View>
  );
}
