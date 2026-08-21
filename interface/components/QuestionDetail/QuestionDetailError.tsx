import { ChevronLeft, RefreshCw } from "lucide-react";

interface QuestionDetailErrorProps {
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}

export function QuestionDetailError({ error, onRetry, onBack }: QuestionDetailErrorProps) {
  return (
    <>
      <header className="flex items-center justify-between px-6 pt-5">
        <ChevronLeft
          className="size-6 cursor-pointer"
          strokeWidth={1.75}
          onClick={onBack}
        />
        <h1 className="text-[18px] font-semibold">Question</h1>
        <div className="size-6" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-hard-soft">
          <span className="text-xl">!</span>
        </div>
        <h2 className="mt-5 font-display text-[20px] leading-tight text-center">
          Couldn&apos;t load this question
        </h2>
        <p className="mt-2 max-w-[19rem] text-center text-[15px] leading-relaxed text-ink-soft">
          {error ?? "Question not found."}
        </p>
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-rule bg-paper-card px-6 py-3 text-[15px] text-ink hover:bg-tag transition-colors"
        >
          <RefreshCw className="size-4" strokeWidth={1.75} />
          Try again
        </button>
      </div>
    </>
  );
}