import { RefreshCw } from "lucide-react";

interface FolderQuestionsErrorProps {
  error: string;
  onRetry: () => void;
}

export function FolderQuestionsError({
  error,
  onRetry,
}: FolderQuestionsErrorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-hard-soft">
        <span className="text-2xl">!</span>
      </div>
      <h2 className="mt-6 font-display text-[24px] leading-tight text-center">
        Couldn&apos;t load questions
      </h2>
      <p className="mt-3 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="mt-8 inline-flex items-center gap-3 rounded-full border border-rule bg-paper-card px-8 py-3.5 text-[16px] text-ink hover:bg-tag transition-colors"
      >
        <RefreshCw className="size-4" strokeWidth={1.75} />
        Try again
      </button>
    </div>
  );
}
