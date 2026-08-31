import { useCallback, useState } from "react";
import { View, Text, Pressable, FlatList, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Clock, Layers, ChevronRight } from "lucide-react-native";
import { useExams } from "@/hooks/useExams";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { ExamsListSkeleton } from "./ExamsListSkeleton";
import { ExamsListError } from "./ExamsListError";
import { ExamsEmptyState } from "./ExamsEmptyState";
import { CreateExamModal } from "./CreateExamModal";
import { Exam } from "@/types/exam";
import { examTypeLabels, scorePercent } from "@/lib/examUtils";
import { useThemeColor } from "@/hooks/useThemeColor";

export function ExamsList() {
  const insets = useSafeAreaInsets();
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabBarHeight = 64;
  const tabBarBottom = Math.max(insets.bottom, 14);
  const buttonBottom = tabBarBottom + tabBarHeight + 16;

  const { exams, isLoading, isRefreshing, error, fetchExams, onRefresh, addExam } = useExams();
  const { notification, showNotification } = useNotification();

  useFocusEffect(
    useCallback(() => {
      fetchExams();
    }, []),
  );

  const handleCreated = (exam: Exam) => {
    addExam(exam);
    showNotification(`"${exam.name}" created`);
  };

  if (isLoading) return <ExamsListSkeleton />;
  if (error) return <ExamsListError error={error} onRetry={fetchExams} />;

  if (exams.length === 0) {
    return (
      <View className="flex-1 bg-paper">
        <ExamsEmptyState onCreateClick={() => setShowCreateModal(true)} />
        {showCreateModal && (
          <CreateExamModal onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
        )}
        <Notification message={notification} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper">
      <FlatList
        data={exams}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: buttonBottom + 64 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={ink} />}
        ListHeaderComponent={
          <View className="px-2 pt-6 pb-4">
            <Text className="font-display text-[40px] leading-[44px] text-ink">Exams</Text>
            <Text className="mt-2 text-[17px] text-ink-soft">
              {exams.length} {exams.length === 1 ? "exam" : "exams"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/exam/[id]", params: { id: String(item.id) } })}
            className="mb-3 rounded-2xl border border-rule bg-paper-card p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[18px] text-ink" style={{ fontWeight: "500" }} numberOfLines={1}>
                {item.name}
              </Text>
              <ChevronRight size={18} color="#9C9086" strokeWidth={2} />
            </View>
            <Text className="mt-1 text-[13px] text-ink-faint" numberOfLines={1}>
              {item.scope_name}
            </Text>
            <View className="mt-3 flex-row items-center" style={{ gap: 14 }}>
              <View className="rounded-full bg-tag px-3 py-1">
                <Text className="text-[11px] text-ink" style={{ fontWeight: "500" }}>
                  {examTypeLabels[item.type]}
                </Text>
              </View>
              <View className="flex-row items-center" style={{ gap: 5 }}>
                <Layers size={12} color="#9C9086" strokeWidth={1.75} />
                <Text className="text-[12px] text-ink-soft">
                  {item.type === "full" ? "All" : item.question_count}
                </Text>
              </View>
              {item.time_limit_minutes ? (
                <View className="flex-row items-center" style={{ gap: 5 }}>
                  <Clock size={12} color="#9C9086" strokeWidth={1.75} />
                  <Text className="text-[12px] text-ink-soft">{item.time_limit_minutes}m</Text>
                </View>
              ) : null}
            </View>
            {item.last_attempt?.completed_at ? (
              <Text className="mt-2 text-[12px] text-ink-faint">
                Last: {item.last_attempt.correct_count}/{item.last_attempt.total_count} ·{" "}
                {scorePercent(item.last_attempt.correct_count, item.last_attempt.total_count)}%
              </Text>
            ) : null}
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => setShowCreateModal(true)}
        className="absolute self-center flex-row items-center rounded-full bg-onyx"
        style={{
          bottom: buttonBottom,
          gap: 8,
          paddingHorizontal: 24,
          paddingVertical: 14,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <Plus size={20} color={ink} strokeWidth={2} />
        <Text className="text-[16px] text-paper">New exam</Text>
      </Pressable>

      {showCreateModal && (
        <CreateExamModal onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
      )}
      <Notification message={notification} />
    </View>
  );
}