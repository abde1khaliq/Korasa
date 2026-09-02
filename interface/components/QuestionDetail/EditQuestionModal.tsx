import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-onyx/40 backdrop-blur-sm p-0 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[480px] md:max-w-xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.25s_ease-out] md:animate-in md:fade-in md:zoom-in-95 rounded-t-3xl md:rounded-3xl bg-paper px-6 pb-8 pt-5 md:p-7 md:border md:border-rule md:shadow-xl">
        <div className="flex items-start justify-between pb-3 border-b border-rule/60">
          <div>
            <h2 className="font-display text-[20px] md:text-[22px] font-normal text-ink">Edit Question</h2>
            <p className="text-[12px] text-ink-soft hidden md:block">
              Update flashcard contents, answer key, and notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-tag/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
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
            <label className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
              Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="The answer is..."
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[12px] tracking-widest text-ink-faint uppercase mb-1.5 block">
              Difficulty
            </label>
            <div className="flex gap-2.5">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 rounded-xl border py-2 text-[14px] font-medium capitalize transition-colors cursor-pointer ${
                    difficulty === level
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-rule bg-paper-card text-ink-soft hover:bg-tag/40 hover:text-ink"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
              Study Notes (Optional)
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

          <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-rule/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-rule text-[14px] text-ink hover:bg-tag/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !text.trim() || !answer.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper transition-all hover:bg-onyx/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {isSubmitting && (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              )}
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
