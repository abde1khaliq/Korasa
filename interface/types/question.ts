export interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  note: string;
  folder_id: number;
}