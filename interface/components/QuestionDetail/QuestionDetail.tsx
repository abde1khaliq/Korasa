"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb, DifficultyPill } from "@/components/misc/Screen";
import { QuestionDetailSkeleton } from "@/components/QuestionDetail/QuestionDetailSkeleton";
import { QuestionDetailError } from "@/components/QuestionDetail/QuestionDetailError";
import { Notification } from "@/components/misc/Notification";
import { EditQuestionModal } from "@/components/QuestionDetail/EditQuestionModal";
import { useQuestionDetail } from "@/app/hooks/useQuestionDetail";
import { useQuestionNavigation } from "@/app/hooks/useQuestionNavigation";
import { useReveal } from "@/app/hooks/useReveal";
import { useNotification } from "@/app/hooks/useNotification";
import { difficultyLabels } from "@/app/utils/questionUtils";
import { Question } from "@/types/question";

export function QuestionDetail() {
  const { questionId } = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const {
    question,
    siblings,
    isLoading,
    error,
    fetchQuestion,
    updateQuestion,
  } = useQuestionDetail(questionId);

  const { prevQuestion, nextQuestion, goTo } = useQuestionNavigation(
    question,
    siblings,
  );

  const { revealed, toggleReveal } = useReveal();
  const { notification, showNotification } = useNotification();

  const handleUpdate = (updatedQuestion: Question) => {
    updateQuestion(updatedQuestion);
    setIsEditing(false);
    showNotification("Question saved");
  };

  if (isLoading) return <QuestionDetailSkeleton />;

  if (error || !question) {
    return (
      <QuestionDetailError
        error={error}
        onRetry={fetchQuestion}
        onBack={() => router.back()}
      />
    );
  }

  const label = difficultyLabels[question.difficulty];

  return (
    <>
      <div className="px-5 pt-4 pb-28">
        <Breadcrumb parts={[]} />

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <DifficultyPill level={label} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px w-5 bg-ink-faint" />
          <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            Question
          </p>
        </div>

        <h2 className="mt-4 border-l-2 border-ink/20 pl-4 font-display text-[18px] sm:text-[18px] leading-[1.4] text-ink whitespace-pre-wrap">
          {question.text}
        </h2>

        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-5 bg-ink-faint" />
          <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            Answer
          </p>
        </div>

        {revealed ? (
          <div className="mt-3 rounded-2xl border border-rule bg-paper-card p-5">
            <p className="text-[16px] leading-[1.6] whitespace-pre-wrap text-ink">
              {question.answer}
            </p>
          </div>
        ) : (
          <button
            onClick={toggleReveal}
            className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-rule py-6 text-[16px] text-ink transition-colors hover:bg-tag/30"
          >
            <Eye className="size-4" strokeWidth={1.75} />
            Tap to reveal answer
          </button>
        )}

        {question.note && (
          <>
            <p className="mt-8 font-mono text-[12px] tracking-[0.18em] text-ink-faint uppercase">
              Notes
            </p>
            <div className="mt-3 rounded-2xl border border-rule bg-paper p-5">
              <p className="font-display text-[15px] leading-[1.6] italic text-ink-soft whitespace-pre-wrap">
                {question.note}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-5 left-1/2 flex w-[280px] max-w-[90vw] -translate-x-1/2 items-center gap-2.5">
        <button
          disabled={!prevQuestion}
          onClick={() => prevQuestion && goTo(prevQuestion.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-rule bg-paper-card py-2.5 text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
          Prev
        </button>
        <button
          disabled={!nextQuestion}
          onClick={() => nextQuestion && goTo(nextQuestion.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-onyx py-2.5 text-[14px] font-medium text-paper disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="size-4" strokeWidth={2} />
        </button>
      </div>

      {isEditing && (
        <EditQuestionModal
          question={question}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate}
        />
      )}

      <Notification message={notification} />
    </>
  );
}
