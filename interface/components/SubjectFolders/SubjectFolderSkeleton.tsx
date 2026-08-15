import { Screen } from "@/components/misc/Screen";

export const SubjectFoldersSkeleton = () => {
  return (
    <Screen className="relative">
      {/* Header skeleton */}
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="size-7 animate-pulse rounded bg-tag/70" />
        <div className="h-5 w-24 animate-pulse rounded bg-tag/70" />
        <div className="flex items-center gap-4">
          <div className="size-6 animate-pulse rounded bg-tag/70" />
          <div className="size-6 animate-pulse rounded bg-tag/70" />
        </div>
      </header>

      {/* Subject hero card skeleton */}
      <section className="mx-6 mt-6 rounded-2xl border border-rule bg-paper-card p-6">
        <div className="mt-4 h-[42px] w-[65%] animate-pulse rounded-lg bg-tag/70" />
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div
                className="h-[34px] w-[50%] animate-pulse rounded bg-tag/60"
                style={{ animationDelay: `${i * 80}ms` }}
              />
              <div
                className="mt-2 h-[15px] w-[70%] animate-pulse rounded bg-tag/40"
                style={{ animationDelay: `${i * 80 + 40}ms` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Section label skeleton */}
      <div className="mt-8 flex items-center justify-between px-6">
        <div className="h-[13px] w-16 animate-pulse rounded bg-tag/50" />
        <div className="h-[16px] w-20 animate-pulse rounded bg-tag/50" />
      </div>

      {/* Folder rows skeleton */}
      <ul className="mt-4 px-6 pb-28">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center gap-4 border-b border-rule py-5"
          >
            <div
              className="size-12 shrink-0 animate-pulse rounded-xl bg-tag/60"
              style={{ animationDelay: `${i * 120}ms` }}
            />
            <div className="min-w-0 flex-1">
              <div
                className="h-[19px] animate-pulse rounded bg-tag/70"
                style={{
                  width: `${55 + (i % 3) * 15}%`,
                  animationDelay: `${i * 120 + 40}ms`,
                }}
              />
              <div
                className="mt-2 h-[14px] animate-pulse rounded bg-tag/40"
                style={{
                  width: `${70 + (i % 2) * 10}%`,
                  animationDelay: `${i * 120 + 80}ms`,
                }}
              />
            </div>
            <div
              className="size-5 animate-pulse rounded bg-tag/40"
              style={{ animationDelay: `${i * 120 + 60}ms` }}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}