export interface Question {
  id: number;
  image_url?: string;
  text: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  note: string;
  folder_id: number;
}