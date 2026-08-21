import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { Question } from "@/types/question";
import { useSession } from "next-auth/react";

export const EditQuestionModal = ({
  question,
  onClose,
  onSave,
}: {
  question: Question;
  accessToken?: string;
  onClose: () => void;
  onSave: (q: Question) => void;
}) => {
  const [text, setText] = useState(question.text);
  const [answer, setAnswer] = useState(question.answer);
  const [difficulty, setDifficulty] = useState<Question["difficulty"]>(
    question.difficulty,
  );
  const [note, setNote] = useState(question.note || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() || !answer.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions/${question.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            text: text.trim(),
            answer: answer.trim(),
            difficulty,
            note: note.trim(),
            folder_id: question.folder_id,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to update question (${res.status})`);
      }

      const updated: Question = await res.json();
      onSave(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
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
      <div className="w-full max-w-[460px] max-h-[90vh] overflow-y-auto animate-[slideUp_0.25s_ease-out] rounded-t-3xl sm:rounded-3xl bg-paper px-5 pb-6 pt-4 shadow-xl">
        <div className="sticky top-0 bg-paper pb-3 pt-1 flex items-center justify-between z-10">
          <h2 className="font-display text-[20px]">Edit Question</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-tag transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div>
            <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
              Question Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What is..."
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
              Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="The answer is..."
              rows={4}
              className="mt-1.5 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase mb-1.5 block">
              Difficulty
            </label>
            <div className="flex gap-2.5">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 rounded-xl border py-2 text-[14px] font-medium capitalize transition-colors ${
                    difficulty === level
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-rule bg-paper-card text-ink-soft hover:bg-tag"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add extra context or hints..."
              rows={2}
              className="mt-1.5 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          {error && <p className="text-[13px] text-hard">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !text.trim() || !answer.trim()}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-onyx py-3 text-[15px] font-medium text-paper transition-colors hover:bg-onyx/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            )}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};
