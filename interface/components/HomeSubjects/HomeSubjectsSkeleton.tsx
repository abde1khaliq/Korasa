import { Plus } from "lucide-react";

export function HomeSubjectsSkeleton() {
  return (
    <>
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 rounded bg-ink-faint/20 animate-pulse" />
        </div>
        <div className="mt-2 h-[48px] w-48 rounded-lg bg-ink-faint/20 animate-pulse" />
        <div className="mt-2 h-5 w-64 rounded bg-ink-faint/20 animate-pulse" />
      </div>

      <div className="mt-6 px-6">
        <div className="relative overflow-hidden rounded-2xl border border-rule bg-onyx p-5">
          <div className="relative z-10">
            <div className="h-4 w-32 rounded bg-paper/20 animate-pulse" />
            <div className="mt-2 h-[26px] w-40 rounded bg-paper/20 animate-pulse" />
            <div className="mt-4 h-11 w-28 rounded-full bg-paper/20 animate-pulse" />
          </div>
          <div className="pointer-events-none absolute -right-6 -top-6 opacity-10">
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
              <circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="44" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="28" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      <div className="px-6 pt-8">
        <div className="h-[30px] w-32 rounded bg-ink-faint/20 animate-pulse" />
        <div className="mt-1 h-5 w-24 rounded bg-ink-faint/20 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-6 pb-24">
        {[...Array(4)].map((_, index) => (
          <article
            key={index}
            className="flex h-[190px] flex-col rounded-2xl border border-rule bg-paper-card p-4"
          >
            <div className="h-9 w-16 rounded-lg bg-ink-faint/20 animate-pulse" />
            
            <div className="mt-auto h-[26px] w-32 rounded bg-ink-faint/20 animate-pulse" />
            
            <div className="mt-3 flex flex-col gap-2">
              <div className="h-4 w-20 rounded bg-ink-faint/20 animate-pulse" />
              <div className="h-4 w-24 rounded bg-ink-faint/20 animate-pulse" />
            </div>
          </article>
        ))}

        <div className="flex h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule">
          <div className="flex size-12 items-center justify-center rounded-full border border-ink-faint/30">
            <Plus className="size-5 text-ink-faint/30" strokeWidth={1.5} />
          </div>
          <div className="h-5 w-24 rounded bg-ink-faint/20 animate-pulse" />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 size-14 rounded-full bg-ink-faint/20 animate-pulse" />
    </>
  );
}