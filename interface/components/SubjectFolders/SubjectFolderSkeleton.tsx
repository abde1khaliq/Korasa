import { Folder, ChevronRight } from "lucide-react";

export function SubjectFoldersSkeleton() {
  return (
    <>
      <div className="px-6 pt-6 bg-paper animate-pulse">
        <div className="mt-2 h-[46px] w-48 rounded-lg bg-ink-faint/20" />
        <div className="mt-3 flex items-center gap-2">
          <div className="h-5 w-16 rounded bg-ink-faint/20" />
          <span className="text-ink-faint">·</span>
          <div className="h-5 w-20 rounded bg-ink-faint/20" />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between px-6 animate-pulse">
        <div className="h-4 w-20 rounded bg-ink-faint/20" />
      </div>

      <ul className="mt-3 px-5 pb-28">
        {[...Array(5)].map((_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 rounded-xl px-2 py-4"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ink-faint/10">
              <Folder className="size-6 text-ink-faint/30" strokeWidth={1.5} />
            </span>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-32 rounded bg-ink-faint/20 animate-pulse" />
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-20 rounded bg-ink-faint/20 animate-pulse" />
                <span className="h-[3px] w-[3px] rounded-full bg-ink-faint/20"></span>
                <div className="h-4 w-16 rounded bg-ink-faint/20 animate-pulse" />
              </div>
            </div>

            <ChevronRight
              className="size-5 text-ink-faint/20"
              strokeWidth={2}
            />
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
