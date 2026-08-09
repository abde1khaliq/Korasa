import { Search, LayoutGrid, Plus } from "lucide-react";
import { Screen } from "./Screen";

const subjects: { name: string; folders: number; questions: number }[] = [
  {
    name: "Mathematics",
    folders: 2,
    questions: 10,
  },
];

export function HomeSubjects() {
  if (subjects.length === 0) {
    return <HomeEmptyState />;
  }

  const totalQuestions = subjects.reduce((sum, s) => sum + s.questions, 0);

  return (
    <Screen>
      <header className="flex items-center justify-between px-6 pt-6">
        <span className="font-display text-2xl leading-none">K</span>
        <div className="flex items-center gap-5 text-ink">
          <Search className="size-6" strokeWidth={1.75} />
          <LayoutGrid className="size-6" strokeWidth={1.75} />
        </div>
      </header>

      <div className="px-6 pt-6">
        <h1 className="font-display text-[56px] leading-[1.05]">Subjects</h1>
        <p className="mt-2 text-[17px] text-ink-soft">
          {subjects.length} {subjects.length === 1 ? "subject" : "subjects"} ·{" "}
          {totalQuestions} questions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-6">
        {subjects.map((s) => (
          <article
            key={s.name}
            className="flex h-[190px] flex-col justify-between rounded-2xl border border-rule bg-paper-card p-4"
          >
            <h2 className="font-display text-[18px] leading-[1.15]">
              {s.name}
            </h2>
            <div className="flex flex-col gap-0.5 font-mono text-[14px] text-ink-soft">
              <span>{s.folders} folders</span>
              <span>{s.questions} questions</span>
            </div>
          </article>
        ))}

        <button className="flex h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule">
          <span className="flex size-12 items-center justify-center rounded-full border border-ink-faint">
            <Plus className="size-5 text-ink-soft" strokeWidth={1.5} />
          </span>
          <span className="text-[16px] text-ink-soft">New subject</span>
        </button>
      </div>
    </Screen>
  );
}

function HomeEmptyState() {
  return (
    <Screen>
      <header className="flex items-center justify-between px-6 pt-6">
        <span className="font-display text-2xl leading-none">K</span>
        <div className="flex items-center gap-5 text-ink">
          <Search className="size-6" strokeWidth={1.75} />
          <LayoutGrid className="size-6" strokeWidth={1.75} />
        </div>
      </header>

      <div className="px-6 pt-8">
        <h1 className="font-display text-[56px] leading-[1.05]">Subjects</h1>
        <p className="mt-3 text-[17px] text-ink-soft">
          A quiet place for the questions worth remembering.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <EmptyIllustration />

        <h2 className="mt-10 font-display text-[32px] leading-tight">
          Begin with a subject
        </h2>
        <p className="mt-3 max-w-[19rem] text-center text-[17px] leading-relaxed text-ink-soft">
          English, Chemistry, or anything you're learning. Folders and questions
          follow.
        </p>

        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper">
          <Plus className="size-5" strokeWidth={1.75} />
          Create your first subject
        </button>
      </div>
    </Screen>
  );
}

function EmptyIllustration() {
  return (
    <div className="relative h-[130px] w-[160px]">
      <div className="absolute left-0 top-2 h-[115px] w-[110px] -rotate-6 rounded-xl border border-rule bg-paper-card" />
      <div className="absolute right-0 top-2 h-[115px] w-[110px] rotate-6 rounded-xl border border-rule bg-paper-card" />
      <div className="absolute left-1/2 top-0 h-[125px] w-[120px] -translate-x-1/2 rounded-xl border border-rule bg-paper-card p-5">
        <div className="mt-1 h-[7px] w-[60%] rounded-full bg-tag/70" />
        <div className="mt-3 h-[7px] w-[80%] rounded-full bg-tag/70" />
        <div className="mt-3 h-[7px] w-[52%] rounded-full bg-tag/70" />
        <div className="mt-3 h-[7px] w-[40%] rounded-full bg-tag/70" />
      </div>
    </div>
  );
}
