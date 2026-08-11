import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Folder,
  BookOpen,
  Plus,
} from "lucide-react";
import { Screen, difficultyStyles, type Difficulty } from "./Screen";
import { InlineMath, BlockMath } from "react-katex";

const questions: {
  n: string;
  prefix?: string;
  expr?: string;
  suffix?: string;
  level: Difficulty;
  source?: string;
}[] = [
  {
    n: "01",
    prefix: "If the middle term of the expansion of",
    expr: "\\left( \\dfrac{2a}{3} + \\dfrac{b}{a^{2}} \\right)^{8}",
    suffix: "is the ninth term, then n =",
    level: "Easy",
    source: "El Moaser",
  },
  {
    n: "02",
    prefix: "If the middle term of the expansion of",
    expr: "\\left( \\dfrac{3x}{3} + \\dfrac{b}{a^{2}} \\right)^{2}",
    suffix: "is the fifth term, then n =",
    level: "Medium",
    source: "El Moaser",
  },
];

function SafeInlineMath({ math }: { math: string }) {
  return <InlineMath math={math} throwOnError={false} />;
}

function SafeBlockMath({ math }: { math: string }) {
  return <BlockMath math={math} throwOnError={false} />;
}

export function FolderQuestions() {
  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-4 pt-5">
        <ChevronLeft className="size-6" strokeWidth={1.75} />
        <h1 className="text-[17px] font-semibold">Pure Math</h1>
        <div className="flex items-center gap-3">
          <Search className="size-5" strokeWidth={1.75} />
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </div>
      </header>

      <div className="px-4 pt-5">
        <p className="flex items-center gap-1.5 font-mono text-[13px] tracking-[0.1em] text-ink-soft uppercase">
          <Folder className="size-4 text-brand" strokeWidth={1.5} />
          <span className="text-brand">MATH</span>
        </p>
        <h2 className="mt-2 font-display text-[34px] leading-tight">
          Pure Math
        </h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-4">
        <span className="rounded-full bg-onyx px-3 py-1.5 text-[12px] text-paper">
          All
        </span>
        <FilterChip level="Easy" n={0} />
        <FilterChip level="Medium" n={1} />
        <FilterChip level="Hard" n={1} />
      </div>

      <ul className="mt-3 px-4 pb-24">
        {questions.map((q) => (
          <li key={q.n} className="flex gap-3 border-b border-rule py-5">
            <span className="pt-0.5 font-mono text-[12px] text-ink-faint">
              {q.n}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] leading-relaxed">
                {q.prefix && (
                  <p>
                    {q.prefix}{" "}
                    <span className="text-[12px]">
                      <SafeInlineMath math={q.expr ?? ""} />
                    </span>{" "}
                    {q.suffix}
                  </p>
                )}
                {q.expr && !q.prefix && (
                  <div className="my-3">
                    <SafeBlockMath math={q.expr} />
                  </div>
                )}
                {q.suffix && !q.prefix && <p>{q.suffix}</p>}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] ${difficultyStyles[q.level].pill} ${difficultyStyles[q.level].text}`}
                >
                  <span
                    className={`size-[6px] rounded-full ${difficultyStyles[q.level].dot}`}
                  />
                  {q.level}
                </span>
                {q.source && (
                  <span className="flex items-center gap-1.5 text-[13px] text-ink-faint">
                    <BookOpen className="size-4" strokeWidth={1.5} />
                    {q.source}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button className="absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full bg-onyx px-6 py-3 text-[16px] text-paper">
        <Plus className="size-5" strokeWidth={1.75} />
        Add question
      </button>
    </Screen>
  );
}

function FilterChip({ level, n }: { level: Difficulty; n: number }) {
  const s = difficultyStyles[level];
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-[12px]">
      <span className={s.text}>{level}</span>
      <span className="text-ink-soft">{n}</span>
    </span>
  );
}
