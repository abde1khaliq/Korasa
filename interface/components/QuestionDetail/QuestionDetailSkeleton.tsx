import { Screen } from "@/components/misc/Screen";

export const QuestionDetailSkeleton = () => {
  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="size-7 animate-pulse rounded bg-tag/70" />
        <div className="h-5 w-32 animate-pulse rounded bg-tag/70" />
        <div className="flex items-center gap-4">
          <div className="size-6 animate-pulse rounded bg-tag/70" />
          <div className="size-6 animate-pulse rounded bg-tag/70" />
        </div>
      </header>
      <div className="px-6 pt-6">
        <div className="h-[28px] w-[70%] animate-pulse rounded bg-tag/70" />
        <div className="mt-8 h-[170px] animate-pulse rounded-2xl bg-tag/50" />
      </div>
    </Screen>
  );
}