"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  MoreHorizontal,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Screen, Breadcrumb, DifficultyPill, type Difficulty } from "./Lib/Screen";

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

  const { data: session } = useSession();
  const { questionId } = useParams();
  const router = useRouter();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, questionId]);

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
    <Screen className="relative">
      <header className="flex items-center justify-between px-6 pt-6">
        <ChevronLeft
          className="size-7 cursor-pointer"
          strokeWidth={1.75}
          onClick={() => router.back()}
        />
        <h1 className="text-[20px] font-semibold">
          {index >= 0 ? `Question ${index + 1} of ${total}` : "Question"}
        </h1>
        <div className="flex items-center gap-4">
          <Pencil className="size-6" strokeWidth={1.5} />
          <MoreHorizontal className="size-6" strokeWidth={1.75} />
        </div>
      </header>

      <div className="px-6 pt-6">
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
            <p className="text-[19px] leading-[1.55]">{question.answer}</p>
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
            <div className="mt-4 mb-32 rounded-2xl border border-rule bg-[oklch(0.955_0.008_90)] p-6">
              <p className="font-display text-[18px] leading-[1.6] italic text-ink-soft">
                {question.note}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-6 left-1/2 flex w-[372px] -translate-x-1/2 items-center gap-3">
        <button
          disabled={!prevQuestion}
          onClick={() => prevQuestion && goTo(prevQuestion.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-rule bg-paper-card py-4 text-[18px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="size-5" strokeWidth={1.75} />
          Prev
        </button>
        <button
          disabled={!nextQuestion}
          onClick={() => nextQuestion && goTo(nextQuestion.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-onyx py-4 text-[18px] text-paper disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="size-5" strokeWidth={1.75} />
        </button>
      </div>
    </Screen>
  );
}

function QuestionDetailSkeleton() {
  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="size-7 animate-pulse rounded bg-tag/70" />
        <div className="h-5 w-32 animate-pulse rounded bg-tag/70" />
        <div className="flex items-center gap-4">
          <div className="size-6 animate-pulse rounded bg-tag/70" />
          <div className="size-6 animate-pulse rounded bg-tag/70" />
        </div>
      </header>
      <div className="px-6 pt-6">
        <div className="h-[28px] w-[70%] animate-pulse rounded bg-tag/70" />
        <div className="mt-8 h-[170px] animate-pulse rounded-2xl bg-tag/50" />
      </div>
    </Screen>
  );
}