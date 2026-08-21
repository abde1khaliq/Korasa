import { ChevronLeft } from "lucide-react";

export function QuestionDetailSkeleton() {
  return (
    <>
      <header className="flex items-center justify-between px-6 pt-5">
        <ChevronLeft className="size-6 text-ink-faint/30" strokeWidth={1.75} />
        <div className="h-6 w-20 rounded bg-ink-faint/20 animate-pulse" />
        <div className="size-6" />
      </header>

      <div className="px-5 pt-4 pb-28">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-ink-faint/20 animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-ink-faint/20" />
          <div className="h-4 w-20 rounded bg-ink-faint/20 animate-pulse" />
        </div>

        {/* Difficulty pill skeleton */}
        <div className="mt-4">
          <div className="h-8 w-24 rounded-full bg-ink-faint/20 animate-pulse" />
        </div>

        {/* Question label skeleton */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px w-5 bg-ink-faint/20" />
          <div className="h-4 w-20 rounded bg-ink-faint/20 animate-pulse" />
        </div>

        {/* Question text skeleton */}
        <div className="mt-4 space-y-2">
          <div className="h-5 w-full rounded bg-ink-faint/20 animate-pulse" />
          <div className="h-5 w-3/4 rounded bg-ink-faint/20 animate-pulse" />
          <div className="h-5 w-1/2 rounded bg-ink-faint/20 animate-pulse" />
        </div>

        {/* Answer label skeleton */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px w-5 bg-ink-faint/20" />
          <div className="h-4 w-16 rounded bg-ink-faint/20 animate-pulse" />
        </div>

        {/* Answer reveal button skeleton */}
        <div className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-rule py-6">
          <div className="size-4 rounded bg-ink-faint/20 animate-pulse" />
          <div className="h-5 w-40 rounded bg-ink-faint/20 animate-pulse" />
        </div>

        {/* Notes skeleton */}
        <div className="mt-8">
          <div className="h-4 w-16 rounded bg-ink-faint/20 animate-pulse" />
          <div className="mt-3 rounded-2xl border border-rule p-5">
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-ink-faint/20 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-ink-faint/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons skeleton */}
      <div className="fixed bottom-5 left-1/2 flex w-[280px] max-w-[90vw] -translate-x-1/2 items-center gap-2.5">
        <div className="flex-1 h-11 rounded-full bg-ink-faint/20 animate-pulse" />
        <div className="flex-1 h-11 rounded-full bg-ink-faint/20 animate-pulse" />
      </div>
    </>
  );
}