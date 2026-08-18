// Mirrors backend/internal/dto/*.go — update both sides on any contract change.
// See repo.md: no codegen exists yet, so this drift is on you to catch in review.

export interface Subject {
  id: number;
  name: string;
  question_count: number;
  folder_count: number;
}

export interface Folder {
  id: number;
  name: string;
  question_count: number;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: Difficulty;
  note: string;
  folder_id: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: {
    id: number;
    email: string;
    username: string;
  };
}