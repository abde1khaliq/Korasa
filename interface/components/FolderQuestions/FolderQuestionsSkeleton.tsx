import { Search } from "lucide-react";

export function FolderQuestionsSkeleton() {
  return (
    <>
      <div className="px-4 pt-5 animate-pulse">
        <div className="mt-2 h-[34px] w-48 rounded-lg bg-ink-faint/20" />
        <div className="mt-1 h-5 w-32 rounded bg-ink-faint/20" />
      </div>

      <div className="mt-4 px-4">
        <div className="flex items-center gap-2 rounded-xl border border-rule bg-paper-card px-3 py-2">
          <Search className="size-4 text-ink-faint/30" strokeWidth={1.75} />
          <div className="h-5 flex-1 rounded bg-ink-faint/10" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 px-4 animate-pulse">
        <div className="h-8 w-12 rounded-full bg-ink-faint/20" />
        <div className="h-8 w-20 rounded-full bg-ink-faint/20" />
        <div className="h-8 w-24 rounded-full bg-ink-faint/20" />
        <div className="h-8 w-20 rounded-full bg-ink-faint/20" />
      </div>

      <ul className="mt-4 px-4 pb-28">
        {[...Array(6)].map((_, index) => (
          <li key={index} className="flex gap-4 rounded-xl px-2 py-4">
            <span className="pt-0.5 font-mono text-[13px] text-ink-faint/30 shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-5 w-full rounded bg-ink-faint/20 animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-ink-faint/20 animate-pulse" />
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <div className="h-6 w-16 rounded-full bg-ink-faint/20 animate-pulse" />
                <div className="h-[3px] w-[3px] rounded-full bg-ink-faint/20"></div>
                <div className="h-5 w-20 rounded bg-ink-faint/20 animate-pulse" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full bg-ink-faint/20 px-6 py-3.5">
        <div className="size-5 rounded bg-ink-faint/20" />
        <div className="h-4 w-24 rounded bg-ink-faint/20" />
      </div>
    </>
  );
}
