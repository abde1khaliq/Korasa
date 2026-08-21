import { type Difficulty } from "@/components/misc/Screen";
import { Question } from "@/types/question";

export const difficultyLabels: Record<Question["difficulty"], Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

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
}

export function getQuestionMatchType(
  question: Question,
  searchQuery: string
): "answer" | "notes" | null {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return null;
  
  if (question.answer.toLowerCase().includes(query)) return "answer";
  if (question.note.toLowerCase().includes(query)) return "notes";
  return null;
}