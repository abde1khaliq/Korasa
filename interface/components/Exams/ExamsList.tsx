"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Layers, Clock, ChevronRight, Award } from "lucide-react";
import { useExams } from "@/app/hooks/useExams";
import { useNotification } from "@/app/hooks/useNotification";
import { ExamsListSkeleton } from "./ExamsListSkeleton";
import { ExamsListError } from "./ExamsListError";
import { ExamsEmptyState } from "./ExamsEmptyState";
import { CreateExamModal } from "./CreateExamModal";
import { Exam } from "@/types/exam";
import { examTypeLabels, scorePercent } from "@/app/utils/examUtils";

export function ExamsList() {
  const { exams, isLoading, error, fetchExams, addExam } = useExams();
  const { showNotification } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreated = (exam: Exam) => {
    addExam(exam);
    showNotification(`"${exam.name}" created`);
  };

  if (isLoading) return <ExamsListSkeleton />;
  if (error) return <ExamsListError error={error} onRetry={fetchExams} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rule/60">
        <div>
          <h1 className="font-display text-[34px] sm:text-[40px] font-normal leading-tight text-ink">
            Exams & Quizzes
          </h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            {exams.length} {exams.length === 1 ? "exam" : "exams"} created
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-onyx px-4 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          <span>New Exam</span>
        </button>
      </div>

      {/* List or Empty State */}
      {exams.length === 0 ? (
        <ExamsEmptyState onCreateClick={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {exams.map((item) => (
            <Link
              key={item.id}
              href={`/app/exam/${item.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-rule bg-paper-card p-5 hover:border-brand/70 hover:shadow-sm transition-all select-none"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-[22px] font-normal text-ink group-hover:text-brand transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <ChevronRight
                    className="size-5 text-ink-faint shrink-0 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </div>

                <p className="mt-1 text-[13px] text-ink-soft font-mono truncate">
                  {item.scope_name}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[12px]">
                  <span className="rounded-md bg-tag px-2.5 py-0.5 font-medium text-ink">
                    {examTypeLabels[item.type]}
                  </span>

                  <span className="flex items-center gap-1 text-ink-soft">
                    <Layers className="size-3.5 text-ink-faint" />
                    {item.type === "full" ? "All questions" : `${item.question_count} Qs`}
                  </span>

                  {item.time_limit_minutes && (
                    <span className="flex items-center gap-1 text-ink-soft">
                      <Clock className="size-3.5 text-ink-faint" />
                      {item.time_limit_minutes}m
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom score summary */}
              <div className="mt-6 pt-3 border-t border-rule/50 flex items-center justify-between text-[13px]">
                {item.last_attempt?.completed_at ? (
                  <div className="flex items-center gap-1.5 text-ink-soft font-mono">
                    <Award className="size-4 text-brand" />
                    <span>
                      Score: {item.last_attempt.correct_count}/{item.last_attempt.total_count} (
                      {scorePercent(
                        item.last_attempt.correct_count,
                        item.last_attempt.total_count,
                      )}
                      %)
                    </span>
                  </div>
                ) : (
                  <span className="text-ink-faint italic font-mono text-[12px]">
                    No attempts taken yet
                  </span>
                )}

                <span className="text-brand font-medium text-[13px]">
                  Start &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
