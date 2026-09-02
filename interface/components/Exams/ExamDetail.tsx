"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Clock,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useExam } from "@/app/hooks/useExam";
import { useExamHistory } from "@/app/hooks/useExamHistory";
import { useNotification } from "@/app/hooks/useNotification";
import { DifficultyPill } from "@/components/misc/Screen";
import { RenameExamModal } from "./RenameExamModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { getDifficultyLabel } from "@/app/utils/questionUtils";
import {
  examTypeLabels,
  formatAttemptDate,
  formatDuration,
  scorePercent,
} from "@/app/utils/examUtils";
import { useSession } from "next-auth/react";

export function ExamDetail({ examId }: { examId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { exam, isLoading, error, fetchExam, setExam } = useExam(examId);
  const { attempts } = useExamHistory(examId);
  const { showNotification } = useNotification();

  const [showRename, setShowRename] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!exam) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${exam.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to delete exam");
      showNotification(`"${exam.name}" deleted`);
      router.push("/app/exams");
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Failed to delete exam",
      );
      setIsDeleting(false);
    }
  };

  if (isLoading || !exam) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-tag/60 mb-4" />
        <div className="h-5 w-40 rounded-lg bg-tag/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-hard text-[16px]">{error}</p>
        <button
          onClick={fetchExam}
          className="mt-4 px-4 py-2 rounded-xl border border-rule"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Desktop Breadcrumb Navigation */}
      <div className="hidden md:flex items-center gap-2 text-[13px] font-mono text-ink-faint">
        <Link href="/app/exams" className="flex items-center gap-1 hover:text-brand transition-colors">
          <ArrowLeft className="size-3.5" />
          <span>Exams</span>
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{exam.name}</span>
      </div>

      {/* Top Header Card */}
      <div className="rounded-3xl border border-rule bg-paper-card p-6 sm:p-8 shadow-xs relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
              {exam.scope_name}
            </span>
            <h1 className="font-display text-[32px] sm:text-[38px] font-normal leading-tight text-ink mt-1">
              {exam.name}
            </h1>
          </div>

          {/* Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-tag/50 transition-colors"
              title="Options"
            >
              <MoreHorizontal className="size-5" />
            </button>

            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowOptions(false)}
                />
                <div className="absolute right-0 top-10 z-30 w-40 rounded-2xl border border-rule bg-paper p-1 shadow-lg animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      setShowRename(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-ink hover:bg-tag/40 transition-colors"
                  >
                    <Pencil className="size-4 text-ink-soft" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowOptions(false);
                      setConfirmDelete(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-hard hover:bg-hard-soft/30 transition-colors"
                  >
                    <Trash2 className="size-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges & Meta */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg bg-tag px-3 py-1 font-mono text-[12px] font-semibold text-ink">
            {examTypeLabels[exam.type]}
          </span>
          {exam.difficulties.map((d) => (
            <DifficultyPill key={d} level={getDifficultyLabel(d)} />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6 font-mono text-[13px] text-ink-soft border-t border-rule/60 pt-5">
          <span className="flex items-center gap-2">
            <Layers className="size-4 text-ink-faint" />
            <span>
              {exam.type === "full" ? "All Questions" : `${exam.question_count} Questions`}
            </span>
          </span>

          {exam.time_limit_minutes && (
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-ink-faint" />
              <span>{exam.time_limit_minutes} Minutes</span>
            </span>
          )}
        </div>

        {/* Primary Start Action */}
        <div className="mt-7">
          <Link
            href={`/app/exam/${exam.id}/attempt`}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-onyx px-8 py-3.5 text-[16px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Play className="size-5" />
            <span>Start Exam Now</span>
          </Link>
        </div>
      </div>

      {/* Attempt History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rule/60">
          <h2 className="font-display text-2xl font-normal text-ink">
            Attempt History
          </h2>
          <span className="font-mono text-[13px] text-ink-soft">
            {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-rule bg-paper-card/40">
            <p className="text-[15px] text-ink-soft">
              No previous attempts recorded for this exam.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-rule/60 rounded-2xl border border-rule bg-paper-card overflow-hidden">
            {attempts.map((att) => {
              const pct = scorePercent(att.correct_count, att.total_count);
              return (
                <Link
                  key={att.id}
                  href={`/app/exam/${exam.id}/attempt/${att.id}`}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-tag/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-tag font-mono text-[13px] font-bold text-ink">
                      {pct}%
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-ink">
                        {formatAttemptDate(att.completed_at)}
                      </p>
                      <p className="text-[12px] font-mono text-ink-faint mt-0.5">
                        Duration: {formatDuration(att.duration_secs)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[13px] text-ink-soft">
                    <span>
                      {att.correct_count} / {att.total_count} Correct
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {showRename && (
        <RenameExamModal
          exam={exam}
          onClose={() => setShowRename(false)}
          onUpdated={(updated) => {
            setExam(updated);
            showNotification("Exam renamed");
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={confirmDelete}
        title="Delete Exam"
        message={`Are you sure you want to delete "${exam.name}"? All past attempts will be permanently lost.`}
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
