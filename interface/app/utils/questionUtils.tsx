import type React from "react";
import { type Difficulty } from "@/components/misc/Screen";
import { Question } from "@/types/question";

export const difficultyLabels: Record<string, Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};

export function getDifficultyLabel(difficulty?: string | null): Difficulty {
  if (!difficulty) return "Medium";
  const lower = difficulty.toLowerCase();
  if (lower === "easy") return "Easy";
  if (lower === "hard") return "Hard";
  return "Medium";
}

export function highlightText(
  text: string | undefined | null,
  query: string,
): React.ReactNode {
  if (!text) return "";
  if (!query || !query.trim()) return text;

  try {
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200/60 text-ink px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  } catch {
    return text;
  }
}

export function getQuestionMatchType(
  question: Question,
  searchQuery: string,
): "answer" | "notes" | null {
  const query = searchQuery?.toLowerCase().trim();
  if (!query) return null;

  if (question.answer && question.answer.toLowerCase().includes(query)) {
    return "answer";
  }
  if (question.note && question.note.toLowerCase().includes(query)) {
    return "notes";
  }
  return null;
}