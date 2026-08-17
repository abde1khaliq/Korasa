"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  MoreHorizontal,
  Eye,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Screen, Breadcrumb, DifficultyPill, type Difficulty } from "@/components/misc/Screen";
import { QuestionDetailSkeleton } from "@/components/QuestionDetail/QuestionDetailSkeleton";
import { Notification } from "@/components/misc/Notification";

interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  note: string;
  folder_id: number;
}

const difficultyLabels: Record<Question["difficulty"], Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function QuestionDetail() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [siblings, setSiblings] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: session } = useSession();
  const { questionId } = useParams();
  const router = useRouter();

  const showNotification = (message: string) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchQuestion = async () => {
    setIsLoading(true);
    setError(null);
    setRevealed(false);

    try {
      const headers = { Authorization: `Bearer ${session?.accessToken}` };

      const qRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions/${questionId}`,
        { headers }
      );
      if (!qRes.ok) {
        throw new Error(`Failed to load question (${qRes.status})`);
      }
      const q: Question = await qRes.json();
      setQuestion(q);

      const listRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${q.folder_id}/questions`,
        { headers }
      );
      if (listRes.ok) {
        const list: Question[] = await listRes.json();
        setSiblings(list);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && questionId) {
      fetchQuestion();
    }
  }, [session, questionId]);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const handleUpdate = (updatedQuestion: Question) => {
    setQuestion(updatedQuestion);
    setSiblings((prev) =>
      prev.map((s) => (s.id === updatedQuestion.id ? updatedQuestion : s))
    );
    setIsEditing(false);
    showNotification("Question saved");
  };

  if (isLoading) return <QuestionDetailSkeleton />;

  if (error || !question) {
    return (
      <Screen className="relative">
        <header className="flex items-center justify-between px-6 pt-6">
          <ChevronLeft
            className="size-7 cursor-pointer"
            strokeWidth={1.75}
            onClick={() => router.back()}
          />
          <h1 className="text-[20px] font-semibold">Question</h1>
          <div className="size-6" />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-hard-soft">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="mt-6 font-display text-[24px] leading-tight text-center">
            Couldn&apos;t load this question
          </h2>
          <p className="mt-3 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
            {error ?? "Question not found."}
          </p>
          <button
            onClick={fetchQuestion}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-rule bg-paper-card px-8 py-3.5 text-[16px] text-ink hover:bg-tag transition-colors"
          >
            <RefreshCw className="size-4" strokeWidth={1.75} />
            Try again
          </button>
        </div>
      </Screen>
    );
  }

  const index = siblings.findIndex((s) => s.id === question.id);
  const total = siblings.length;
  const prevQuestion = index > 0 ? siblings[index - 1] : null;
  const nextQuestion = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  const label = difficultyLabels[question.difficulty];

  const goTo = (id: number) => {
    router.push(
      window.location.pathname.replace(/\/question\/\d+$/, `/question/${id}`)
    );
  };

  return (
    <>
      <Screen className="relative">
        <header className="flex items-center justify-between px-4 pt-5">
          <ChevronLeft
            className="size-6 cursor-pointer"
            strokeWidth={1.75}
            onClick={() => router.back()}
          />
          <h1 className="text-[17px]">
            {index >= 0 ? `Question ${index + 1} of ${total}` : "Question"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center rounded-full p-2 hover:bg-tag transition-colors"
            >
              <Pencil className="size-5 text-ink" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="px-6 pt-6 pb-32">
          <Breadcrumb parts={[]} />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <DifficultyPill level={label} />
          </div>

          <h2 className="mt-6 font-display text-[32px] leading-[1.25]">
            {question.text}
          </h2>

          <div className="mt-8 flex items-center gap-3">
            <span className="h-px w-6 bg-ink-faint" />
            <p className="font-mono text-[14px] tracking-[0.18em] text-ink-soft uppercase">
              Answer
            </p>
          </div>

          {revealed ? (
            <div className="mt-4 rounded-2xl border border-rule bg-paper-card p-6">
              <p className="text-[19px] leading-[1.55] whitespace-pre-wrap">{question.answer}</p>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-rule py-9 text-[19px] text-ink"
            >
              <Eye className="size-5" strokeWidth={1.5} />
              Tap to reveal answer
            </button>
          )}

          {question.note && (
            <>
              <p className="mt-8 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
                Notes
              </p>
              <div className="mt-4 rounded-2xl border border-rule bg-[oklch(0.955_0.008_90)] p-6">
                <p className="font-display text-[18px] leading-[1.6] italic text-ink-soft whitespace-pre-wrap">
                  {question.note}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="fixed bottom-6 left-1/2 flex w-[320px] max-w-[90vw] -translate-x-1/2 items-center gap-3">
          <button
            disabled={!prevQuestion}
            onClick={() => prevQuestion && goTo(prevQuestion.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-rule bg-paper-card py-3 text-[15px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
            Prev
          </button>
          <button
            disabled={!nextQuestion}
            onClick={() => nextQuestion && goTo(nextQuestion.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-onyx py-3 text-[15px] text-paper disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="size-4" strokeWidth={2} />
          </button>
        </div>
      </Screen>

      {isEditing && (
        <EditQuestionModal
          question={question}
          accessToken={session?.accessToken}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate}
        />
      )}
      
      <Notification message={notification} />
    </>
  );
}

function EditQuestionModal({
  question,
  accessToken,
  onClose,
  onSave,
}: {
  question: Question;
  accessToken?: string;
  onClose: () => void;
  onSave: (q: Question) => void;
}) {
  const [text, setText] = useState(question.text);
  const [answer, setAnswer] = useState(question.answer);
  const [difficulty, setDifficulty] = useState<Question["difficulty"]>(question.difficulty);
  const [note, setNote] = useState(question.note || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            text: text.trim(),
            answer: answer.trim(),
            difficulty,
            note: note.trim(),
            folder_id: question.folder_id,
          }),
        }
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
      <div className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto animate-[slideUp_0.25s_ease-out] rounded-t-3xl sm:rounded-3xl bg-paper px-6 pb-8 pt-5 shadow-xl">
        <div className="sticky top-0 bg-paper pb-4 pt-1 flex items-center justify-between z-10">
          <h2 className="font-display text-[22px]">Edit Question</h2>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full hover:bg-tag transition-colors"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5">
          <div>
            <label className="font-mono text-[13px] tracking-[0.12em] text-ink-faint uppercase">
              Question Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What is..."
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[16px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[13px] tracking-[0.12em] text-ink-faint uppercase">
              Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="The answer is..."
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[16px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[13px] tracking-[0.12em] text-ink-faint uppercase mb-2 block">
              Difficulty
            </label>
            <div className="flex gap-3">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 rounded-xl border py-2.5 text-[15px] font-medium capitalize transition-colors ${
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
            <label className="font-mono text-[13px] tracking-[0.12em] text-ink-faint uppercase">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add extra context or hints..."
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[16px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
            />
          </div>

          {error && <p className="text-[14px] text-hard">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !text.trim() || !answer.trim()}
            className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl bg-onyx py-3.5 text-[16px] font-medium text-paper transition-colors hover:bg-onyx/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}