import { ExamType } from "@/types/exam";

export const examTypeLabels: Record<ExamType, string> = {
  practice: "Practice",
  timed: "Timed",
  full: "Full revision",
};

export const examTypeDescriptions: Record<ExamType, string> = {
  practice: "Untimed — pick how many questions to review.",
  timed: "Race the clock across a set number of questions.",
  full: "Every question in scope, no timer.",
};

export function formatDuration(secs: number | null): string {
  if (secs == null) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function formatAttemptDate(iso: string | null): string {
  if (!iso) return "In progress";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function scorePercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
