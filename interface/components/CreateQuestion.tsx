import { X, ChevronRight, Image as ImageIcon, Plus } from "lucide-react";
import { Screen, difficultyStyles, type Difficulty } from "./Screen";

const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const selected: Difficulty = "Medium";

export function CreateQuestion() {
  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5">
        <X className="size-6" strokeWidth={1.75} />
        <h1 className="text-[17px] font-semibold">New question</h1>
        <button className="rounded-full bg-onyx px-5 py-2.5 text-[14px] text-paper">
          Save
        </button>
      </header>

      <div className="px-4 pt-5 pb-12">
        <p className="font-mono text-[13px] text-ink-soft">
          <span className="text-brand">Math</span>
        </p>

        <p className="mt-5 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Question
        </p>
        <div className="mt-2 min-h-[90px] rounded-2xl border border-brand bg-paper-card p-4">
          <p className="font-display text-[19px] leading-snug">
            The number of terms in the expansion of (x + 1/x)^n is 9. Find the
            value of n.
          </p>
        </div>

        <p className="mt-5 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Answer
        </p>
        <div className="mt-2 min-h-[100px] rounded-2xl border border-rule bg-paper-card p-4">
          <p className="text-[15px] leading-relaxed">29</p>
        </div>

        <p className="mt-5 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Difficulty
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {levels.map((l) => {
            const s = difficultyStyles[l];
            const on = l === selected;
            return (
              <button
                key={l}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-4 text-[14px] ${
                  on
                    ? `${s.pill} ${s.text} border-current`
                    : "border-rule bg-paper-card text-ink"
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>

        <p className="mt-5 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Image
        </p>
        <button className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-dashed border-rule px-4 py-4 text-left">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tag">
            <ImageIcon className="size-5 text-brand" strokeWidth={1.5} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px]">Attach image</span>
            <span className="block truncate text-[13px] text-ink-faint">
              Diagrams, photos, snippets
            </span>
          </span>
          <Plus className="size-5 shrink-0 text-ink-soft" strokeWidth={1.75} />
        </button>

        <p className="mt-5 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Notes
        </p>
        <div className="mt-2 min-h-[80px] rounded-2xl border border-rule bg-paper-card p-4">
          <p className="text-[14px] text-ink-faint">
            Optional context, mnemonics, or exam tips…
          </p>
        </div>
      </div>
    </Screen>
  );
}
