"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, ArrowLeft, Clock, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Attempt } from "@/types/exam";
import {
  formatAttemptDate,
  formatDuration,
  scorePercent,
} from "@/app/utils/examUtils";

export function AttemptSummaryScreen({
  examId,
  attemptId,
}: {
  examId: string;
  attemptId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${examId}/attempts/${attemptId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load attempt details");
        return res.json();
      })
      .then(setAttempt)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [examId, attemptId, session?.accessToken]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 animate-pulse">
        <Loader2 className="size-8 animate-spin text-brand mb-3" />
        <p className="text-ink-soft text-[14px]">Loading attempt summary...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-hard text-[15px]">{error || "Attempt not found"}</p>
        <button
          onClick={() => router.push(`/app/exam/${examId}`)}
          className="mt-4 px-4 py-2 rounded-xl border border-rule"
        >
          Return to Exam
        </button>
      </div>
    );
  }

  const pct = scorePercent(attempt.correct_count, attempt.total_count);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-lg mx-auto">
      <div className="inline-flex size-18 items-center justify-center rounded-3xl bg-tag text-brand shadow-sm mb-6">
        <Award className="size-9" />
      </div>

      <span className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
        {formatAttemptDate(attempt.completed_at)}
      </span>

      <h1 className="font-display text-6xl font-normal text-ink mt-2">{pct}%</h1>

      <p className="mt-3 text-xl font-medium text-ink">
        {attempt.correct_count} of {attempt.total_count} questions correct
      </p>

      <div className="mt-2 flex items-center gap-2 font-mono text-[13px] text-ink-soft">
        <Clock className="size-3.5" />
        <span>Time spent: {formatDuration(attempt.duration_secs)}</span>
      </div>

      <button
        onClick={() => router.push(`/app/exam/${examId}`)}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-onyx px-8 py-3 text-[15px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-md"
      >
        <ArrowLeft className="size-4" />
        <span>Back to Exam Overview</span>
      </button>
    </div>
  );
}
