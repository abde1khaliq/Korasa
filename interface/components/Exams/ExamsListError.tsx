import { AlertCircle, RefreshCw } from "lucide-react";

interface ExamsListErrorProps {
  error: string;
  onRetry: () => void;
}

export function ExamsListError({ error, onRetry }: ExamsListErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-hard/20 bg-hard-soft/20 text-center my-6">
      <AlertCircle className="size-10 text-hard mb-3" />
      <h3 className="font-display text-lg font-normal text-ink">
        Failed to load exams
      </h3>
      <p className="mt-1 text-[14px] text-ink-soft">{error}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rule bg-paper px-4 py-2 text-[14px] text-ink hover:bg-tag/40 transition-colors"
      >
        <RefreshCw className="size-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
