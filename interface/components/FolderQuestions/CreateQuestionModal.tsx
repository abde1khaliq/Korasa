import { useState } from "react";
import { Difficulty, difficultyStyles } from "../misc/Screen";
import { Question } from "@/types/question";
import { Camera, Loader2, X } from "lucide-react";
import { QuestionOCRCapture } from "./QuestionOCRCapture";
import { useSession } from "next-auth/react";

const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

const MAX_LEN = 2000;

export const CreateQuestionModal = ({
  folderId,
  onClose,
  onCreated,
}: {
  folderId: string;
  folderName: string;
  accessToken?: string;
  onClose: () => void;
  onCreated: (q: Question) => void;
}) => {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOCR, setShowOCR] = useState(false);
  const { data: session } = useSession()

  const handleOCRText = (recognized: string) => {
    if (text.trim().length > 0) {
      const confirmed = window.confirm(
        "This will replace what you've already typed in the question field. Continue?",
      );
      if (!confirmed) {
        setShowOCR(false);
        return;
      }
    }
    setText(recognized);
    setShowOCR(false);
  };

  const trimmedText = text.trim();
  const trimmedAnswer = answer.trim();
  const isValid =
    trimmedText.length > 0 &&
    trimmedText.length <= MAX_LEN &&
    trimmedAnswer.length > 0 &&
    trimmedAnswer.length <= MAX_LEN &&
    note.length <= MAX_LEN;

  const handleSave = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${folderId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            text: trimmedText,
            answer: trimmedAnswer,
            difficulty: difficultyToApi[difficulty],
            note: note.trim(),
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || `Failed to create question (${res.status})`,
        );
      }

      const createdQuestion = await res.json();
      onCreated(createdQuestion);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-onyx/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-[420px] flex-col max-h-[90vh] animate-[slideUp_0.25s_ease-out] rounded-t-3xl bg-paper sm:rounded-3xl">
        {/* Modal Header */}
        <header className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-rule">
          <X
            className="size-6 cursor-pointer text-ink-soft hover:text-ink transition-colors"
            strokeWidth={1.75}
            onClick={onClose}
          />
          <h1 className="text-[17px] text-ink">New question</h1>
          <button
            onClick={handleSave}
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-2 rounded-full bg-onyx px-5 py-2 text-[14px] font-medium text-paper disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            )}
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </header>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto px-6 py-6 pb-12">
          {error && (
            <p className="mt-4 rounded-xl bg-hard-soft px-4 py-3 text-[14px] text-hard">
              {error}
            </p>
          )}
          <p className="mt-6 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Question
            <span className="flex items-center gap-3 normal-case tracking-normal text-ink-faint">
              <Camera
                className="size-4 cursor-pointer text-ink-soft hover:text-ink transition-colors"
                strokeWidth={1.75}
                onClick={() => setShowOCR(true)}
              />
              {text.length}/{MAX_LEN}
            </span>
          </p>
          <div className="mt-2 min-h-[90px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand transition-colors">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type the question…"
              maxLength={MAX_LEN}
              rows={3}
              className="text-ink w-full resize-none bg-transparent font-display text-[19px] leading-snug outline-none placeholder:text-ink-faint"
            />
          </div>

          <p className="mt-6 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Answer
            <span className="normal-case tracking-normal text-ink-faint">
              {answer.length}/{MAX_LEN}
            </span>
          </p>
          <div className="text-ink mt-2 min-h-[100px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand transition-colors">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type the answer…"
              maxLength={MAX_LEN}
              rows={3}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-ink-faint"
            />
          </div>

          <p className="mt-6 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Difficulty
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {levels.map((l) => {
              const s = difficultyStyles[l];
              const on = l === difficulty;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setDifficulty(l)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-[14px] transition-colors ${
                    on
                      ? `${s.pill} ${s.text} border-current`
                      : "border-rule bg-paper-card text-ink"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>

          <p className="mt-6 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Notes
            <span className="normal-case tracking-normal text-ink-faint">
              {note.length}/{MAX_LEN}
            </span>
          </p>
          <div className="mt-2 min-h-[80px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand transition-colors">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional context, mnemonics, or exam tips…"
              maxLength={MAX_LEN}
              rows={2}
              className="text-ink w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-ink-faint"
            />
          </div>
          {showOCR && (
            <QuestionOCRCapture
              onClose={() => setShowOCR(false)}
              onTextRecognized={handleOCRText}
            />
          )}
        </div>
      </div>
    </div>
  );
}