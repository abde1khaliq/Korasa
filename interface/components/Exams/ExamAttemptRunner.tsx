"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  Check,
  X as XIcon,
  Clock,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  StartAttemptResponse,
  AttemptQuestion,
  Attempt,
} from "@/types/exam";
import { scorePercent, formatDuration } from "@/app/utils/examUtils";
import { DifficultyPill } from "@/components/misc/Screen";
import { getDifficultyLabel } from "@/app/utils/questionUtils";

type Phase = "starting" | "in_progress" | "submitting" | "results" | "error";

export function ExamAttemptRunner({ examId }: { examId: string }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [phase, setPhase] = useState<Phase>("starting");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<Attempt | null>(null);

  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const attemptIdRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Start attempt on mount
  useEffect(() => {
    if (!session?.accessToken) return;
    let isCancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${examId}/attempts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to initialize exam attempt");
        }
        return res.json();
      })
      .then((data: StartAttemptResponse) => {
        if (isCancelled) return;
        attemptIdRef.current = data.attempt_id;
        setQuestions(data.questions || []);
        if (data.time_limit_minutes) {
          setSecondsLeft(data.time_limit_minutes * 60);
        }
        setPhase("in_progress");
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : "Could not start exam");
        setPhase("error");
      });

    return () => {
      isCancelled = true;
    };
  }, [session?.accessToken, examId]);

  // Submit attempt function
  const submitAttempt = useCallback(
    async (finalAnswers: Record<number, boolean>) => {
      if (submittedRef.current || !attemptIdRef.current || !session?.accessToken)
        return;
      submittedRef.current = true;
      setPhase("submitting");

      const payload = {
        answers: questionsRef.current.map((q) => ({
          question_id: q.question_id,
          is_correct: finalAnswers[q.question_id] ?? false,
        })),
      };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${examId}/attempts/${attemptIdRef.current}/complete`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (!res.ok) throw new Error("Failed to submit exam answers");
        const data: Attempt = await res.json();
        setResult(data);
        setPhase("results");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to record results",
        );
        setPhase("error");
      }
    },
    [session, examId],
  );

  // Timer countdown
  useEffect(() => {
    if (phase !== "in_progress" || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submitAttempt(answersRef.current);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, secondsLeft, submitAttempt]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "in_progress") return;
      if (e.key === " " && !revealed) {
        e.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, revealed]);

  if (phase === "starting" || phase === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <Loader2 className="size-8 animate-spin text-brand mb-3" />
        <p className="text-ink font-medium text-[16px]">
          {phase === "starting"
            ? "Preparing your exam questions…"
            : "Calculating your final score…"}
        </p>
      </div>
    );
  }

  if (phase === "error" || error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-hard-soft text-hard mb-3">
          <XIcon className="size-7" />
        </div>
        <h3 className="font-display text-2xl font-normal text-ink">Exam Error</h3>
        <p className="mt-2 text-[14px] text-ink-soft">{error}</p>
        <button
          onClick={() => router.push(`/app/exam/${examId}`)}
          className="mt-6 px-6 py-2.5 rounded-xl bg-onyx text-paper text-[14px] font-medium"
        >
          Return to Exam
        </button>
      </div>
    );
  }

  if (phase === "results" && result) {
    const pct = scorePercent(result.correct_count, result.total_count);
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto">
        <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-tag text-brand shadow-sm mb-4">
          <Sparkles className="size-8" />
        </div>

        <span className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
          Exam Completed
        </span>

        <h2 className="font-display text-6xl sm:text-7xl font-normal text-ink mt-2">
          {pct}%
        </h2>

        <p className="mt-3 text-xl text-ink font-medium">
          {result.correct_count} of {result.total_count} questions correct
        </p>

        <p className="mt-1 font-mono text-[14px] text-ink-soft">
          Time spent: {formatDuration(result.duration_secs)}
        </p>

        <div className="mt-8 flex items-center gap-3 w-full max-w-xs">
          <button
            onClick={() => router.push(`/app/exam/${examId}`)}
            className="flex-1 py-3 px-6 rounded-2xl bg-onyx text-paper text-[15px] font-medium hover:bg-onyx/90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[index];
  if (!currentQ) return null;

  const isLast = index === questions.length - 1;
  const hasAnswered = answers[currentQ.question_id] !== undefined;
  const isCorrect = answers[currentQ.question_id];

  const markAnswer = (correct: boolean) => {
    setAnswers((prev) => ({ ...prev, [currentQ.question_id]: correct }));
  };

  const handleNext = () => {
    if (!hasAnswered) return;
    if (isLast) {
      submitAttempt(answersRef.current);
      return;
    }
    setRevealed(false);
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Runner Header */}
      <div className="flex items-center justify-between px-2 pb-3 border-b border-rule/60">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold text-ink-faint">
            Question {index + 1} of {questions.length}
          </span>
          <DifficultyPill level={getDifficultyLabel(currentQ.difficulty)} />
        </div>

        {secondsLeft !== null && (
          <div
            className={`flex items-center gap-1.5 font-mono text-[14px] font-semibold ${
              secondsLeft < 30 ? "text-hard animate-pulse" : "text-ink-soft"
            }`}
          >
            <Clock className="size-4" />
            <span>
              {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-rule bg-paper-card p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Image if present */}
        {currentQ.image_url && (
          <div className="relative w-full min-h-[220px] max-h-[380px] rounded-2xl overflow-hidden bg-tag/30 border border-rule/60 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentQ.image_url}
              alt="Question illustration"
              className="max-h-[350px] w-auto max-w-full rounded-xl object-contain shadow-xs"
            />
          </div>
        )}

        {/* Question Text */}
        {currentQ.text && (
          <div>
            <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase block mb-1">
              Question
            </span>
            <p className="font-display text-xl sm:text-2xl text-ink leading-relaxed whitespace-pre-wrap">
              {currentQ.text}
            </p>
          </div>
        )}

        {/* Answer Section */}
        <div className="pt-4 border-t border-rule/60">
          <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase block mb-2">
            Answer
          </span>

          {revealed ? (
            <div className="rounded-2xl border border-rule bg-paper p-5 animate-in fade-in">
              <p className="text-[16px] leading-relaxed text-ink whitespace-pre-wrap">
                {currentQ.answer}
              </p>

              {currentQ.note && (
                <div className="mt-4 pt-3 border-t border-rule/50">
                  <span className="font-mono text-[11px] text-ink-faint block">
                    Notes:
                  </span>
                  <p className="text-[13px] text-ink-soft italic mt-0.5">
                    {currentQ.note}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border border-dashed border-rule/80 hover:bg-tag/30 hover:border-brand/60 transition-all text-ink cursor-pointer"
            >
              <Eye className="size-5 text-brand" />
              <span className="text-[15px] font-medium">
                Click or press <kbd className="font-mono bg-tag px-1.5 py-0.5 rounded text-xs">Space</kbd> to reveal answer
              </span>
            </button>
          )}
        </div>

        {/* Self-grading controls when revealed */}
        {revealed && (
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => markAnswer(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                isCorrect === false
                  ? "bg-hard-soft text-hard border-hard font-bold shadow-xs"
                  : "border-rule text-hard hover:bg-hard-soft/30"
              }`}
            >
              <XIcon className="size-4" strokeWidth={2.4} />
              <span>Got it wrong</span>
            </button>

            <button
              onClick={() => markAnswer(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                isCorrect === true
                  ? "bg-easy-soft text-easy border-easy font-bold shadow-xs"
                  : "border-rule text-easy hover:bg-easy-soft/30"
              }`}
            >
              <Check className="size-4" strokeWidth={2.4} />
              <span>Got it right</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav: Next / Finish */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push(`/app/exam/${examId}`)}
          className="px-4 py-2 text-[14px] text-ink-soft hover:text-ink"
        >
          Exit Exam
        </button>

        <button
          onClick={handleNext}
          disabled={!hasAnswered}
          className="flex items-center gap-2 rounded-2xl bg-onyx px-7 py-3 text-[15px] font-medium text-paper hover:bg-onyx/90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md"
        >
          <span>{isLast ? "Finish Exam" : "Next Question"}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
