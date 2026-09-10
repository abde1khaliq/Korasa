import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  Search,
  Plus,
  X,
  FileText,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { difficultyStyles } from "@/components/misc/Screen";
import { Notification } from "@/components/Notification";
import { FolderQuestionsSkeleton } from "./FolderQuestionsSkeleton";
import { FolderQuestionsError } from "./FolderQuestionsError";
import { FilterChip } from "./FilterChip";
import { CreateQuestionModal } from "./CreateQuestionModal";
import { useFolderQuestions } from "@/hooks/useFolderQuestions";
import { useQuestionFilter } from "@/hooks/useQuestionFilter";
import { useNotification } from "@/hooks/useNotification";
import {
  difficultyLabels,
  getQuestionMatchType,
  highlightText,
} from "@/lib/questionUtils";
import { Question } from "@/types/question";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/context/ThemeContext";

function QuestionGridCard({
  question,
  index,
  onPress,
  searchQuery,
}: {
  question: Question;
  index: number;
  onPress: () => void;
  searchQuery: string;
}) {
  const cardBg = useThemeColor(
    "rgba(251, 250, 248, 0.95)",
    "rgba(39, 34, 32, 0.95)",
  );
  const cardBorder = useThemeColor(
    "rgba(228, 222, 212, 0.9)",
    "rgba(58, 51, 44, 0.9)",
  );
  const inkFaint = useThemeColor("#9C9086", "#7A7166");
  const brandColor = useThemeColor("#A8703F", "#C99A66");

  const scale = useSharedValue(1);

  const cardScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  };

  const label = difficultyLabels[question.difficulty];
  const s = difficultyStyles[label];
  const matchType = getQuestionMatchType(question, searchQuery);
  const hasText = !!question.text?.trim();
  const hasNotes = !!question.note?.trim();

  return (
    <Animated.View
      style={[{ flex: 1, minHeight: hasText ? 220 : 190 }, cardScaleStyle]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{
          flex: 1,
          borderRadius: 20,
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderWidth: 1,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        {/* Top Header Row: Question Number & Difficulty Badge */}
        <View className="flex-row items-center justify-between px-3 pt-3 pb-2">
          <Text className="font-mono text-[11px] font-bold text-ink-faint tracking-wider">
            #{String(index + 1).padStart(2, "0")}
          </Text>

          <View
            className={`flex-row items-center rounded-full px-2 py-0.5 ${s.pillBg}`}
            style={{ gap: 4 }}
          >
            <View
              className={`rounded-full ${s.dot}`}
              style={{ width: 5, height: 5 }}
            />
            <Text className={`text-[10px] font-semibold ${s.pillText}`}>
              {label}
            </Text>
          </View>
        </View>

        {/* Clean Image Box (Inset with rounded corners) */}
        <View className="px-3">
          <View
            style={{
              height: 110,
              width: "100%",
              borderRadius: 14,
              backgroundColor: "rgba(156,144,134,0.08)",
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: question.image_url }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              accessibilityLabel={`Preview of question: ${question.title || "question"}`}
            />
          </View>
        </View>

        {/* Card Body Details */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 12,
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          {/* Question text if available */}
          {hasText && (
            <Text
              className="text-[13px] leading-[18px] text-ink font-medium"
              numberOfLines={2}
            >
              {searchQuery
                ? highlightText(question.text.trim(), searchQuery)
                : question.text.trim()}
            </Text>
          )}

          {/* Bottom Meta & Action Icon */}
          <View
            className={`flex-row items-center justify-between ${hasText ? "mt-2.5 pt-1" : "mt-2"}`}
          >
            <View className="flex-row items-center" style={{ gap: 4 }}>
              {hasNotes ? (
                <>
                  <FileText size={11} color={inkFaint} strokeWidth={1.75} />
                  <Text className="text-[11px] text-ink-faint font-medium">
                    Has Notes
                  </Text>
                </>
              ) : matchType ? (
                <Text
                  className="text-[10px] font-medium"
                  style={{ color: brandColor }}
                >
                  In {matchType}
                </Text>
              ) : (
                <View />
              )}
            </View>

            <View
              className="items-center justify-center rounded-full p-1"
              style={{ backgroundColor: "rgba(156,144,134,0.12)" }}
            >
              <ArrowUpRight size={11} color={inkFaint} strokeWidth={2} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function FolderQuestions({
  subjectId,
  folderId,
  folderName,
}: {
  subjectId: string;
  folderId: string;
  folderName: string;
}) {
  const ink = useThemeColor("#F1EFEC", "#2B2724");
  const inkSoft = useThemeColor("#6E655C", "#9C9086");
  const inkFaint = useThemeColor("#9C9086", "#7A7166");
  const ruleColor = useThemeColor("#E4DED4", "#3A332C");
  const { scheme } = useTheme();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    questions,
    isLoading,
    isRefreshing,
    error,
    fetchQuestions,
    onRefresh,
    addQuestion,
  } = useFolderQuestions(folderId);
  const {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    counts,
    visibleQuestions,
  } = useQuestionFilter(questions);
  const { notification, showNotification } = useNotification();

  const handleQuestionCreated = (newQuestion: Question) => {
    addQuestion(newQuestion);
    showNotification("Question added");
  };

  if (isLoading) return <FolderQuestionsSkeleton />;
  if (error)
    return <FolderQuestionsError error={error} onRetry={fetchQuestions} />;

  return (
    <View className="flex-1">
      <FlatList
        data={visibleQuestions}
        key="grid-2"
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 112 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={ink}
          />
        }
        ListHeaderComponent={
          <View className="mb-4">
            <View className="pt-5">
              <Text className="font-display text-[34px] leading-[38px] text-ink">
                {folderName}
              </Text>
              <Text className="mt-1 text-[15px] text-ink-soft">
                {visibleQuestions.length} of {questions.length}{" "}
                {questions.length === 1 ? "question" : "questions"}
                {searchQuery && (
                  <Text className="text-ink-faint">
                    {" "}
                    matching "{searchQuery}"
                  </Text>
                )}
              </Text>
            </View>

            <View className="mt-4">
              <View
                className="flex-row items-center rounded-2xl border border-rule bg-paper-card px-3.5 py-2.5"
                style={{ gap: 8 }}
              >
                <Search size={16} color="#9C9086" strokeWidth={1.75} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search questions..."
                  className="flex-1 text-[15px] text-ink"
                  style={{ padding: 0 }}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                    <X size={16} color="#9C9086" strokeWidth={1.75} />
                  </Pressable>
                )}
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap" style={{ gap: 8 }}>
              <Pressable
                onPress={() => setFilter("All")}
                className="flex-row items-center rounded-full border px-3 py-1.5"
                style={{
                  backgroundColor:
                    filter === "All"
                      ? scheme === "dark"
                        ? "#F1EFEC"
                        : "#2B2724"
                      : "transparent",
                  borderColor:
                    filter === "All"
                      ? scheme === "dark"
                        ? "#F1EFEC"
                        : "#2B2724"
                      : ruleColor,
                  gap: 6,
                }}
              >
                <Text
                  className="text-[12px] font-medium"
                  style={{
                    color:
                      filter === "All"
                        ? scheme === "dark"
                          ? "#2B2724"
                          : "#F7F5F1"
                        : inkSoft,
                  }}
                >
                  All
                </Text>
                <Text
                  className="text-[12px]"
                  style={{
                    color:
                      filter === "All"
                        ? scheme === "dark"
                          ? "rgba(43,39,36,0.7)"
                          : "rgba(247,245,241,0.7)"
                        : inkFaint,
                  }}
                >
                  {questions.length}
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
              <View className="items-center pt-14 pb-8 px-4">
                <View
                  className="items-center justify-center rounded-full p-4 mb-3"
                  style={{ backgroundColor: "rgba(156,144,134,0.1)" }}
                >
                  <HelpCircle size={28} color={inkFaint} strokeWidth={1.5} />
                </View>
                <Text className="text-[16px] font-medium text-ink text-center">
                  {questions.length === 0
                    ? "No questions in this folder"
                    : searchQuery
                      ? `No questions match "${searchQuery}"`
                      : "No questions match this filter"}
                </Text>
                <Text className="mt-1 text-[13px] text-ink-soft text-center max-w-xs">
                  {questions.length === 0
                    ? "Tap the button below to add your first question flashcard."
                    : "Try adjusting your search query or filter chip."}
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item: q, index }) => (
          <QuestionGridCard
            question={q}
            index={index}
            searchQuery={searchQuery}
            onPress={() =>
              router.push({
                pathname:
                  "/subject/[id]/folder/[folderId]/question/[questionId]",
                params: { id: subjectId, folderId, questionId: String(q.id) },
              })
            }
          />
        )}
      />

      <Pressable
        onPress={() => setShowCreateModal(true)}
        className="absolute self-center flex-row items-center rounded-full bg-onyx shadow-lg"
        style={{
          bottom: 24,
          gap: 8,
          paddingHorizontal: 24,
          paddingVertical: 14,
          elevation: 6,
        }}
      >
        <Plus size={20} color={ink} strokeWidth={2} />
        <Text className="text-[16px] text-paper font-medium">Add question</Text>
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
