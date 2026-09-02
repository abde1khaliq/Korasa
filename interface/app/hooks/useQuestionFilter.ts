import { useState, useMemo } from "react";
import { type Difficulty } from "@/components/misc/Screen";
import { Question } from "@/types/question";
import { getDifficultyLabel } from "@/app/utils/questionUtils";

export function useQuestionFilter(questions: Question[] = []) {
  const [filter, setFilter] = useState<Difficulty | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const safeQuestions = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions],
  );

  const counts = useMemo(
    () => ({
      Easy: safeQuestions.filter(
        (q) => q && getDifficultyLabel(q.difficulty) === "Easy",
      ).length,
      Medium: safeQuestions.filter(
        (q) => q && getDifficultyLabel(q.difficulty) === "Medium",
      ).length,
      Hard: safeQuestions.filter(
        (q) => q && getDifficultyLabel(q.difficulty) === "Hard",
      ).length,
    }),
    [safeQuestions],
  );

  const filteredByDifficulty = useMemo(() => {
    if (filter === "All") return safeQuestions;
    return safeQuestions.filter(
      (q) => q && getDifficultyLabel(q.difficulty) === filter,
    );
  }, [safeQuestions, filter]);

  const searchLower = searchQuery?.toLowerCase().trim() || "";

  const visibleQuestions = useMemo(() => {
    if (!searchLower) return filteredByDifficulty;
    return filteredByDifficulty.filter((q) => {
      if (!q) return false;
      const textMatch = q.text
        ? q.text.toLowerCase().includes(searchLower)
        : false;
      const answerMatch = q.answer
        ? q.answer.toLowerCase().includes(searchLower)
        : false;
      const noteMatch = q.note
        ? q.note.toLowerCase().includes(searchLower)
        : false;
      return textMatch || answerMatch || noteMatch;
    });
  }, [filteredByDifficulty, searchLower]);

  const hasActiveSearch = searchLower.length > 0;

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