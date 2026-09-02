export type ExamType = "practice" | "timed" | "full";
export type ExamScopeType = "subject" | "folder";
export type ExamDifficulty = "easy" | "medium" | "hard";

export interface AttemptSummary {
  id: number;
  completed_at: string | null;
  correct_count: number;
  total_count: number;
}

export interface Exam {
  id: number;
  name: string;
  type: ExamType;
  scope_type: ExamScopeType;
  scope_id: number;
  scope_name: string;
  difficulties: ExamDifficulty[];
  question_count: number;
  time_limit_minutes: number | null;
  attempt_count: number;
  last_attempt: AttemptSummary | null;
}

export interface AttemptQuestion {
  question_id: number;
  image_url: string;
  text: string;
  answer: string;
  difficulty: ExamDifficulty;
  note: string;
}

export interface StartAttemptResponse {
  attempt_id: number;
  exam_id: number;
  started_at: string;
  time_limit_minutes: number | null;
  questions: AttemptQuestion[];
}

export interface Attempt {
  id: number;
  exam_id: number;
  started_at: string;
  completed_at: string | null;
  correct_count: number;
  total_count: number;
  duration_secs: number | null;
}
