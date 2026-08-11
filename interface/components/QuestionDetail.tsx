import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Screen, Breadcrumb, DifficultyPill } from "./Screen";

/** Question detail. `revealed` toggles between the two designed states. */
export function QuestionDetail({ revealed = false }: { revealed?: boolean }) {
  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-6 pt-6">
        <ChevronLeft className="size-7" strokeWidth={1.75} />
        <h1 className="text-[20px] font-semibold">Question 02 of 18</h1>
        <div className="flex items-center gap-4">
          <Pencil className="size-6" strokeWidth={1.5} />
          <MoreHorizontal className="size-6" strokeWidth={1.75} />
        </div>
      </header>

      <div className="px-6 pt-6">
        <Breadcrumb parts={[]} />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <DifficultyPill level="Medium" />
          <span className="font-mono text-[16px] text-ink">#keats</span>
          <span className="text-ink-faint">·</span>
          <span className="text-[16px] text-ink-faint">added Jun 12</span>
        </div>

        <h2 className="mt-6 font-display text-[38px] leading-[1.18]">
          Define "negative capability" as used by Keats.
        </h2>

        <div className="mt-6 flex h-[170px] items-center justify-center rounded-2xl bg-[oklch(0.9_0.012_88)]">
          <span className="font-mono text-[16px] text-ink-soft">
            keats-letter-1817.jpg
          </span>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-6 bg-ink-faint" />
          <p className="font-mono text-[14px] tracking-[0.18em] text-ink-soft uppercase">
            Answer
          </p>
        </div>

        {revealed ? (
          <div className="mt-4 rounded-2xl border border-rule bg-paper-card p-6">
            <p className="text-[19px] leading-[1.55]">
              The capacity to remain in "uncertainties, mysteries, doubts,
              without any irritable reaching after fact and reason." For Keats,
              it was the mark of a true poet — the ability to accept ambiguity
              rather than resolve it prematurely.
            </p>
          </div>
        ) : (
          <button className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-rule py-9 text-[19px] text-ink">
            <Eye className="size-5" strokeWidth={1.5} />
            Tap to reveal answer
          </button>
        )}

        <p className="mt-8 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
          Notes
        </p>
        <div className="mt-4 mb-32 rounded-2xl border border-rule bg-[oklch(0.955_0.008_90)] p-6">
          <p className="font-display text-[18px] leading-[1.6] italic text-ink-soft">
            Contrast with Wordsworth's "emotion recollected in tranquility". See
            also: Keats's letter of 21 Dec 1817 to his brothers.
          </p>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 flex w-[372px] -translate-x-1/2 items-center gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-rule bg-paper-card py-4 text-[18px]">
          <ChevronLeft className="size-5" strokeWidth={1.75} />
          Prev
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-onyx py-4 text-[18px] text-paper">
          Next
          <ChevronRight className="size-5" strokeWidth={1.75} />
        </button>
      </div>
    </Screen>
  );
}

export function QuestionHidden() {
  return <QuestionDetail />;
}

export function QuestionRevealed() {
  return <QuestionDetail revealed />;
}
