"use client";

import { useState } from "react";
import { Search, LayoutGrid, Plus } from "lucide-react";
import { Screen } from "./Screen";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function HomeSubjects({ initialSubjects }: { initialSubjects: any[] }) {
  const [subjects, setSubjects] = useState(initialSubjects || []);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const router = useRouter();

  const handleCreateSubject = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const { createSubject } = await import("@/app/actions/subject");
      const newSubject = await createSubject(newSubjectName);

      // Update local state for optimistic UI before revalidate takes over
      setSubjects([...subjects, newSubject]);
      setNewSubjectName("");
      setIsCreating(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (subjects.length === 0 && !isCreating) {
    return <HomeEmptyState onCreateClick={() => setIsCreating(true)} />;
  }

  const totalQuestions = subjects.reduce(
    (sum, s) => sum + (s.questions || 0),
    0,
  );

  return (
    <Screen>
      <header className="flex items-center justify-between px-6 pt-6">
        <span className="font-display text-2xl leading-none">K</span>
        <div className="flex items-center gap-5 text-ink">
          <Search className="size-6" strokeWidth={1.75} />
          <LayoutGrid
            className="size-6"
            strokeWidth={1.75}
            onClick={() => signOut()}
          />
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
            key={s.id}
            onClick={() => router.push(`/subject/${s.id}`)}
            className="flex h-[190px] flex-col justify-between rounded-2xl border border-rule bg-paper-card p-4 hover:border-brand cursor-pointer transition-colors"
          >
            <h2 className="font-display text-[18px] leading-[1.15]">
              {s.name}
            </h2>
            <div className="flex flex-col gap-0.5 font-mono text-[14px] text-ink-soft">
              <span>{s.folders || 0} folders</span>
              <span>{s.questions || 0} questions</span>
            </div>
          </article>
        ))}

        {isCreating ? (
          <form
            onSubmit={handleCreateSubject}
            className="flex h-[190px] flex-col justify-center gap-3 rounded-2xl border border-rule bg-paper-card p-4"
          >
            <input
              type="text"
              autoFocus
              placeholder="Subject name"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full bg-transparent font-display text-[18px] leading-[1.15] text-ink placeholder:text-ink-faint outline-none border-b border-rule focus:border-brand pb-1"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="text-sm text-paper bg-brand rounded-full px-3 py-1"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-sm text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule hover:border-brand hover:text-brand transition-colors text-ink-soft"
          >
            <span className="flex size-12 items-center justify-center rounded-full border border-inherit">
              <Plus className="size-5" strokeWidth={1.5} />
            </span>
            <span className="text-[16px]">New subject</span>
          </button>
        )}
      </div>
    </Screen>
  );
}

function HomeEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
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

        <button
          onClick={onCreateClick}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper hover:bg-onyx/90 transition-colors"
        >
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
