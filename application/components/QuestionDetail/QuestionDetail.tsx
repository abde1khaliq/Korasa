import { useState } from "react";
import { View, Text, Pressable, ScrollView, Image, Alert } from "react-native";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { DifficultyPill } from "@/components/misc/Screen";
import { QuestionDetailSkeleton } from "./QuestionDetailSkeleton";
import { QuestionDetailError } from "./QuestionDetailError";
import { EditQuestionModal } from "./EditQuestionModal";
import { Notification } from "@/components/Notification";
import { useQuestionDetail } from "@/hooks/useQuestionDetail";
import { useQuestionNavigation } from "@/hooks/useQuestionNavigation";
import { useReveal } from "@/hooks/useReveal";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api";
import { difficultyLabels } from "@/lib/questionUtils";
import { useThemeColor } from "@/hooks/useThemeColor";

export function QuestionDetail({
  subjectId,
  folderId,
  questionId,
}: {
  subjectId: string;
  folderId: string;
  questionId: string;
}) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const ink = useThemeColor("#2B2724", "#F1EFEC");
  const ink2 = useThemeColor("#F1EFEC", "#2B2724");

  const { question, siblings, isLoading, error, fetchQuestion, updateQuestion } =
    useQuestionDetail(questionId);
  const { prevQuestion, nextQuestion, goTo } = useQuestionNavigation(
    subjectId,
    folderId,
    question,
    siblings,
  );
  const { revealed, toggleReveal } = useReveal();
  const { notification, showNotification } = useNotification();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return <QuestionDetailSkeleton />;

  if (error || !question) {
    return (
      <QuestionDetailError
        error={error}
        onRetry={fetchQuestion}
        onBack={() => router.back()}
      />
    );
  }

  const label = difficultyLabels[question.difficulty];

  const handleDelete = () => {
    Alert.alert("Delete question", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            await apiFetch(`/api/questions/${questionId}`, {
              method: "DELETE",
              token: accessToken!,
            });
            router.back();
          } catch (err) {
            setIsDeleting(false);
            showNotification(
              err instanceof ApiError ? err.message : "Failed to delete question",
            );
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 112 }}
      >
        <View className="mt-4 flex-row items-center justify-between">
          <DifficultyPill level={label} />
          <View className="flex-row items-center" style={{ gap: 20 }}>
            <Pressable onPress={() => setShowEditModal(true)} hitSlop={8} disabled={isDeleting}>
              <Pencil size={18} color={ink} strokeWidth={1.75} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8} disabled={isDeleting}>
              <Trash2 size={18} color="#A34A34" strokeWidth={1.75} />
            </Pressable>
          </View>
        </View>

        <View className="mt-6 flex-row items-center" style={{ gap: 12 }}>
          <View style={{ height: 1, width: 20, backgroundColor: "#9C9086" }} />
          <Text className="text-[12px] tracking-widest text-ink-soft uppercase">
            Question
          </Text>
        </View>

        <Image
          source={{ uri: question.image_url }}
          style={{
            width: "100%",
            height: 260,
            borderRadius: 16,
            marginTop: 16,
          }}
          resizeMode="contain"
        />

        {question.text ? (
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card p-5">
            <Text className="text-[15px] leading-[24px] text-ink">{question.text}</Text>
          </View>
        ) : null}

        <View className="mt-8 flex-row items-center" style={{ gap: 12 }}>
          <View style={{ height: 1, width: 20, backgroundColor: "#9C9086" }} />
          <Text className="text-[12px] tracking-widest text-ink-soft uppercase">
            Answer
          </Text>
        </View>

        {revealed ? (
          <View className="mt-3 rounded-2xl border border-rule bg-paper-card p-5">
            <Text className="text-[16px] leading-[26px] text-ink">
              {question.answer}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={toggleReveal}
            className="mt-3 items-center justify-center rounded-2xl border border-dashed border-rule py-6"
          >
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <Eye size={16} color="#2B2724" strokeWidth={1.75} />
              <Text className="text-[16px] text-ink">Tap to reveal answer</Text>
            </View>
          </Pressable>
        )}

        {question.note ? (
          <>
            <Text className="mt-8 text-[12px] tracking-widest text-ink-faint uppercase">
              Notes
            </Text>
            <View className="mt-3 rounded-2xl border border-rule bg-paper p-5">
              <Text
                className="text-[15px] leading-[24px] text-ink-soft"
                style={{ fontStyle: "italic" }}
              >
                {question.note}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      <View
        className="absolute self-center flex-row"
        style={{ bottom: 20, gap: 10, width: 280 }}
      >
        <Pressable
          disabled={!prevQuestion}
          onPress={() => prevQuestion && goTo(prevQuestion.id)}
          className="flex-1 flex-row items-center justify-center rounded-full border border-rule bg-paper-card py-2.5"
          style={{ gap: 6, opacity: prevQuestion ? 1 : 0.4 }}
        >
          <ChevronLeft size={16} color={ink} strokeWidth={2} />
          <Text className="text-[14px] text-ink" style={{ fontWeight: "500" }}>
            Prev
          </Text>
        </Pressable>
        <Pressable
          disabled={!nextQuestion}
          onPress={() => nextQuestion && goTo(nextQuestion.id)}
          className="flex-1 flex-row items-center justify-center rounded-full bg-onyx py-2.5"
          style={{ gap: 6, opacity: nextQuestion ? 1 : 0.4 }}
        >
          <Text
            className="text-[14px] text-paper"
            style={{ fontWeight: "500" }}
          >
            Next
          </Text>
          <ChevronRight size={16} color={ink2} strokeWidth={2} />
        </Pressable>
      </View>

      {showEditModal && (
        <EditQuestionModal
          question={question}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => {
            updateQuestion(updated);
            showNotification("Question updated");
          }}
        />
      )}

      <Notification message={notification} />
    </View>
  );
}