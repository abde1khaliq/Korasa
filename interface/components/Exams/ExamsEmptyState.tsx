import { ClipboardList, Plus } from "lucide-react";

interface ExamsEmptyStateProps {
  onCreateClick: () => void;
}

export function ExamsEmptyState({ onCreateClick }: ExamsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-rule text-center my-6 bg-paper-card/40">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-tag text-brand mb-4">
        <ClipboardList className="size-8" strokeWidth={1.5} />
      </div>

      <h3 className="font-display text-2xl font-normal text-ink">
        No exams created yet
      </h3>
      <p className="mt-2 text-[15px] text-ink-soft max-w-md">
        Create practice quizzes, timed mock tests, or comprehensive revisions from your saved flashcards.
      </p>

      <button
        onClick={onCreateClick}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-sm"
      >
        <Plus className="size-4" strokeWidth={2.2} />
        <span>Create First Exam</span>
      </button>
    </div>
  );
}
