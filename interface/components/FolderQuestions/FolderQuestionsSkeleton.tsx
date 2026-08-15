import { Screen } from "@/components/misc/Screen";

export const FolderQuestionsSkeleton = () => {
  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-4 pt-5">
        <div className="size-6 animate-pulse rounded bg-tag/70" />
        <div className="h-5 w-24 animate-pulse rounded bg-tag/70" />
        <div className="flex items-center gap-3">
          <div className="size-5 animate-pulse rounded bg-tag/70" />
          <div className="size-5 animate-pulse rounded bg-tag/70" />
        </div>
      </header>

      <div className="px-4 pt-5">
        <div className="h-[13px] w-20 animate-pulse rounded bg-tag/50" />
        <div className="mt-2 h-[34px] w-[60%] animate-pulse rounded-lg bg-tag/70" />
      </div>

      <ul className="mt-6 px-4 pb-24">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex gap-3 border-b border-rule py-5">
            <div className="h-[12px] w-4 animate-pulse rounded bg-tag/40" />
            <div className="min-w-0 flex-1">
              <div
                className="h-[14px] animate-pulse rounded bg-tag/70"
                style={{
                  width: `${70 + (i % 3) * 10}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
              <div
                className="mt-2 h-[14px] w-[40%] animate-pulse rounded bg-tag/50"
                style={{ animationDelay: `${i * 100 + 50}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  );
}