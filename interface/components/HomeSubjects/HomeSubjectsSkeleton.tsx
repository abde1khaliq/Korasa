import { Screen } from "@/components/misc/Screen";

export const HomeSubjectsSkeleton = () => {
  return (
    <Screen>
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="h-7 w-5 animate-pulse rounded bg-tag/70" />
        <div className="flex items-center gap-5">
          <div className="size-6 animate-pulse rounded bg-tag/70" />
          <div className="size-6 animate-pulse rounded bg-tag/70" />
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="h-[59px] w-[75%] animate-pulse rounded-lg bg-tag/70" />
        <div className="mt-3 h-[20px] w-[55%] animate-pulse rounded bg-tag/50" />
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-[190px] flex-col justify-between rounded-2xl border border-rule bg-paper-card p-4"
          >
            <div>
              <div
                className="h-[18px] animate-pulse rounded bg-tag/70"
                style={{
                  width: `${60 + (i % 3) * 15}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
              <div
                className="mt-2 h-[18px] animate-pulse rounded bg-tag/50"
                style={{
                  width: `${40 + (i % 2) * 20}%`,
                  animationDelay: `${i * 100 + 50}ms`,
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div
                className="h-[14px] w-[50%] animate-pulse rounded bg-tag/40"
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              />
              <div
                className="h-[14px] w-[60%] animate-pulse rounded bg-tag/40"
                style={{ animationDelay: `${i * 100 + 150}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
};
