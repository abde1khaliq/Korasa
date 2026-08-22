import { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { Search, Plus, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { difficultyStyles, difficultyHex } from "@/components/misc/Screen";
import { Notification } from "@/components/Notification";
import { FolderQuestionsSkeleton } from "./FolderQuestionsSkeleton";
import { FolderQuestionsError } from "./FolderQuestionsError";
import { FilterChip } from "./FilterChip";
import { CreateQuestionModal } from "./CreateQuestionModal";
import { useFolderQuestions } from "@/hooks/useFolderQuestions";
import { useQuestionFilter } from "@/hooks/useQuestionFilter";
import { useNotification } from "@/hooks/useNotification";
import { difficultyLabels, highlightText, getQuestionMatchType } from "@/lib/questionUtils";
import { Question } from "@/types/question";
import { useThemeColor } from "@/hooks/useThemeColor";

export function FolderQuestions({
  subjectId,
  folderId,
  folderName,
}: {
  subjectId: string;
  folderId: string;
  folderName: string;
}) {
  const ink = useThemeColor("#F1EFEC", "#2B2724")
  const paper = useThemeColor("#F7F5F1", "#211D1A")
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { questions, isLoading, error, fetchQuestions, addQuestion } = useFolderQuestions(folderId);
  const { filter, setFilter, searchQuery, setSearchQuery, counts, visibleQuestions, hasActiveSearch } =
    useQuestionFilter(questions);
  const { notification, showNotification } = useNotification();

  const handleQuestionCreated = (newQuestion: Question) => {
    addQuestion(newQuestion);
    showNotification("Question added");
  };

  if (isLoading) return <FolderQuestionsSkeleton />;
  if (error) return <FolderQuestionsError error={error} onRetry={fetchQuestions} />;

  return (
    <View className="flex-1">
      <FlatList
        data={visibleQuestions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 112 }}
        ListHeaderComponent={
          <View>
            <View className="pt-5">
              <Text className="font-display text-[34px] leading-[38px] text-ink">
                {folderName}
              </Text>
              <Text className="mt-1 text-[15px] text-ink-soft">
                {visibleQuestions.length} of {questions.length}{" "}
                {questions.length === 1 ? "question" : "questions"}
                {searchQuery && <Text className="text-ink-faint">  matching "{searchQuery}"</Text>}
              </Text>
            </View>

            <View className="mt-4">
              <View className="flex-row items-center rounded-xl border border-rule bg-paper-card px-3 py-2" style={{ gap: 8 }}>
                <Search size={16} color="#9C9086" strokeWidth={1.75} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search questions..."
                  className="flex-1 text-[15px] text-ink"
                  style={{ padding: 0 }}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <X size={16} color="#9C9086" strokeWidth={1.75} />
                  </Pressable>
                )}
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap" style={{ gap: 8 }}>
              <Pressable
                onPress={() => setFilter("All")}
                className="rounded-full border px-3 py-1.5"
                style={{
                  backgroundColor: filter === "All" ? paper : paper,
                  borderColor: filter === "All" ? ink : ink,
                }}
              >
                <Text className="text-[12px]" style={{ color: filter === "All" ? ink : ink }}>
                  All
                </Text>
              </Pressable>
              {(["Easy", "Medium", "Hard"] as const).map((level) => (
                <FilterChip
                  key={level}
                  level={level}
                  n={counts[level]}
                  active={filter === level}
                  onPress={() => setFilter(level)}
                />
              ))}
            </View>

            {visibleQuestions.length === 0 && (
              <View className="items-center pt-12 pb-8">
                <Text className="text-[16px] text-ink-soft text-center">
                  {questions.length === 0
                    ? "No questions yet. Add your first question!"
                    : searchQuery
                      ? `No questions match "${searchQuery}"`
                      : "No questions match this filter."}
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item: q, index }) => {
          const label = difficultyLabels[q.difficulty];
          const s = difficultyStyles[label];
          const highlighted = hasActiveSearch ? highlightText(q.text, searchQuery) : q.text;
          const matchType = getQuestionMatchType(q, searchQuery);

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/subject/[id]/folder/[folderId]/question/[questionId]",
                  params: { id: subjectId, folderId, questionId: String(q.id) },
                })
              }
              className="flex-row rounded-xl px-2 py-4"
              style={{ gap: 16 }}
            >
              <Text className="pt-0.5 text-[13px] text-ink-faint" style={{ minWidth: 20 }}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <View style={{ flex: 1 }}>
                <Text className="text-[15px] leading-[22px] text-ink" numberOfLines={2}>
                  {highlighted}
                </Text>

                <View className="mt-3 flex-row flex-wrap items-center" style={{ gap: 10 }}>
                  <View className={`flex-row items-center rounded-full px-3 py-1 ${s.pillBg}`} style={{ gap: 6 }}>
                    <View className={`rounded-full ${s.dot}`} style={{ width: 5, height: 5 }} />
                    <Text className={`text-[12px] ${s.pillText}`} style={{ fontWeight: "500" }}>{label}</Text>
                  </View>
                  {q.note ? (
                    <>
                      <View style={{ width: 3, height: 3, borderRadius: 999, backgroundColor: "rgba(156,144,134,0.5)" }} />
                      <Text className="text-[12px] text-ink-faint">Has notes</Text>
                    </>
                  ) : null}
                  {matchType ? (
                    <>
                      <View style={{ width: 3, height: 3, borderRadius: 999, backgroundColor: "rgba(156,144,134,0.5)" }} />
                      <Text className="text-[12px] text-ink-faint">Match in {matchType}</Text>
                    </>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => setShowCreateModal(true)}
        className="absolute self-center flex-row items-center rounded-full bg-onyx"
        style={{ bottom: 24, gap: 8, paddingHorizontal: 24, paddingVertical: 14 }}
      >
        <Plus size={20} color={ink} strokeWidth={2} />
        <Text className="text-[16px] text-paper">Add question</Text>
      </Pressable>

      {showCreateModal && (
        <CreateQuestionModal
          folderId={folderId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleQuestionCreated}
        />
      )}
      <Notification message={notification} />
    </View>
  );
}