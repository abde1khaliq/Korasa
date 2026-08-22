import { Text } from "react-native";
import { Question } from "@/types/question";
import { type Difficulty } from "@/components/misc/Screen";

export const difficultyLabels: Record<Question["difficulty"], Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

// Splitting on a regex with a single capture group interleaves matches at
// odd indices deterministically — no need for a stateful `.test()` pass,
// which is what the web version did (and which silently drops every other
// match because `.test()` on a global-flag regex mutates `lastIndex`).
export function highlightText(text: string, query: string) {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={{ backgroundColor: "rgba(250,204,21,0.4)" }} className="text-ink">
        {part}
      </Text>
    ) : (
      part
    ),
  );
}

export function getQuestionMatchType(
  question: Question,
  searchQuery: string,
): "answer" | "notes" | null {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return null;
  if (question.answer.toLowerCase().includes(query)) return "answer";
  if (question.note.toLowerCase().includes(query)) return "notes";
  return null;
}