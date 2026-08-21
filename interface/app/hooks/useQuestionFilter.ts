import { useState, useMemo } from "react";
import { type Difficulty } from "@/components/misc/Screen";
import { Question } from "@/types/question";

const difficultyLabels: Record<Question["difficulty"], Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function useQuestionFilter(questions: Question[]) {
  const [filter, setFilter] = useState<Difficulty | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => ({
    Easy: questions.filter((q) => q.difficulty === "easy").length,
    Medium: questions.filter((q) => q.difficulty === "medium").length,
    Hard: questions.filter((q) => q.difficulty === "hard").length,
  }), [questions]);

  const filteredByDifficulty = useMemo(() => {
    if (filter === "All") return questions;
    return questions.filter((q) => difficultyLabels[q.difficulty] === filter);
  }, [questions, filter]);

  const searchLower = searchQuery.toLowerCase().trim();
  const visibleQuestions = useMemo(() => {
    if (!searchLower) return filteredByDifficulty;
    return filteredByDifficulty.filter(
      (q) =>
        q.text.toLowerCase().includes(searchLower) ||
        q.answer.toLowerCase().includes(searchLower) ||
        q.note.toLowerCase().includes(searchLower),
    );
  }, [filteredByDifficulty, searchLower]);

  const hasActiveSearch = searchQuery.trim().length > 0;

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    counts,
    visibleQuestions,
    hasActiveSearch,
  };
}