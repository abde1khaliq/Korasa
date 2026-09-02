"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DifficultyPill } from "@/components/misc/Screen";
import { QuestionDetailSkeleton } from "@/components/QuestionDetail/QuestionDetailSkeleton";
import { QuestionDetailError } from "@/components/QuestionDetail/QuestionDetailError";
import { Notification } from "@/components/misc/Notification";
import { EditQuestionModal } from "@/components/QuestionDetail/EditQuestionModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useQuestionDetail } from "@/app/hooks/useQuestionDetail";
import { useQuestionNavigation } from "@/app/hooks/useQuestionNavigation";
import { useReveal } from "@/app/hooks/useReveal";
import { useNotification } from "@/app/hooks/useNotification";
import { getDifficultyLabel } from "@/app/utils/questionUtils";
import { Question } from "@/types/question";
import { useSession } from "next-auth/react";

interface QuestionDetailProps {
  subjectId?: string;
  folderId?: string;
  questionId?: string;
}

export function QuestionDetail({
  subjectId: propSubjectId,
  folderId: propFolderId,
  questionId: propQuestionId,
}: QuestionDetailProps = {}) {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectId =
    propSubjectId ||
    (Array.isArray(params?.id) ? params.id[0] : params?.id) ||
    "";
  const folderId =
    propFolderId ||
    (Array.isArray(params?.folderId) ? params.folderId[0] : params?.folderId) ||
    "";
  const questionId =
    propQuestionId ||
    (Array.isArray(params?.questionId)
      ? params.questionId[0]
      : params?.questionId) ||
    "";

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

  const handleDelete = async () => {
    if (!question) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/questions/${question.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to delete question");
      showNotification("Question deleted");
      router.push(`/subject/${subjectId}/folder/${folderId}`);
    } catch {
      showNotification("Failed to delete question");
      setIsDeleting(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === " " && !revealed) {
        e.preventDefault();
        toggleReveal();
      } else if (e.key === "ArrowLeft" && prevQuestion) {
        e.preventDefault();
        goTo(prevQuestion.id);
      } else if (e.key === "ArrowRight" && nextQuestion) {
        e.preventDefault();
        goTo(nextQuestion.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, prevQuestion, nextQuestion, toggleReveal, goTo]);

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

  const label = getDifficultyLabel(question.difficulty);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Desktop Breadcrumb Navigation */}
      <div className="hidden md:flex items-center gap-2 text-[13px] font-mono text-ink-faint">
        <Link
          href="/app"
          className="flex items-center gap-1 hover:text-brand transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Subjects</span>
        </Link>
        <span>/</span>
        <Link
          href={`/subject/${subjectId}`}
          className="hover:text-brand transition-colors"
        >
          Folders
        </Link>
        <span>/</span>
        <Link
          href={`/subject/${subjectId}/folder/${folderId}`}
          className="hover:text-brand transition-colors"
        >
          Questions
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Flashcard</span>
      </div>

      {/* Top Controls Row */}
      <div className="flex items-center justify-between pb-2 border-b border-rule/60">
        <DifficultyPill level={label} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rule bg-paper-card text-[13px] text-ink hover:bg-tag/50 transition-colors cursor-pointer shadow-xs"
            title="Edit Question"
          >
            <Pencil className="size-3.5 text-ink-soft" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hard/30 bg-hard-soft/20 text-[13px] text-hard hover:bg-hard-soft/40 transition-colors cursor-pointer shadow-xs"
            title="Delete Question"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard View */}
      <div className="rounded-3xl border border-rule bg-paper-card p-6 sm:p-8 shadow-xs space-y-6">
        {/* Question Image if present */}
        {question.image_url && (
          <div className="relative w-full min-h-[220px] max-h-[420px] rounded-2xl overflow-hidden bg-tag/30 border border-rule/60 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image_url}
              alt="Question illustration"
              className="max-h-[380px] w-auto max-w-full rounded-xl object-contain shadow-xs"
            />
          </div>
        )}

        {/* Question Text */}
        {question.text && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-4 bg-ink-faint" />
              <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
                Question
              </span>
            </div>
            <h2 className="font-display text-[22px] sm:text-[26px] font-normal text-ink leading-relaxed whitespace-pre-wrap">
              {question.text}
            </h2>
          </div>
        )}

        {/* Answer Section */}
        <div className="pt-4 border-t border-rule/60">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-4 bg-ink-faint" />
            <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              Answer
            </span>
          </div>

          {revealed ? (
            <div className="rounded-2xl border border-rule bg-paper p-5 animate-in fade-in">
              <p className="text-[16px] leading-relaxed text-ink whitespace-pre-wrap">
                {question.answer}
              </p>
            </div>
          ) : (
            <button
              onClick={toggleReveal}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border border-dashed border-rule/80 hover:bg-tag/30 hover:border-brand/60 transition-all text-ink cursor-pointer"
            >
              <Eye className="size-5 text-brand" />
              <span className="text-[15px] font-medium">
                Click or press{" "}
                <kbd className="font-mono bg-tag px-1.5 py-0.5 rounded text-xs">
                  Space
                </kbd>{" "}
                to reveal answer
              </span>
            </button>
          )}
        </div>

        {/* Notes Section */}
        {question.note && (
          <div className="pt-4 border-t border-rule/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-4 bg-ink-faint" />
              <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
                Study Notes
              </span>
            </div>
            <div className="rounded-2xl border border-rule bg-paper p-5">
              <p className="text-[14px] leading-relaxed text-ink-soft italic whitespace-pre-wrap">
                {question.note}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Question Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-paper/90 backdrop-blur-md border border-rule/80 p-1.5 rounded-full shadow-lg">
        <button
          disabled={!prevQuestion}
          onClick={() => prevQuestion && goTo(prevQuestion.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rule bg-paper-card text-[13px] font-medium text-ink hover:bg-tag/50 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
        >
          <ChevronLeft className="size-4" />
          <span>Prev</span>
        </button>

        <button
          disabled={!nextQuestion}
          onClick={() => nextQuestion && goTo(nextQuestion.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-onyx text-[13px] font-medium text-paper hover:bg-onyx/90 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditQuestionModal
          question={question}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={confirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Notification message={notification} />
    </div>
  );
}

