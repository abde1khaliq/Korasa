"use client";

import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Folder,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Screen, difficultyStyles, type Difficulty } from "./Lib/Screen";

interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  note: string;
  folder_id: number;
}

const difficultyLabels: Record<Question["difficulty"], Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function FolderQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Difficulty | "All">("All");
  const { data: session } = useSession();
  const { folderId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const folderName = searchParams.get("name") ?? "Folder";

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${folderId}/questions`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      );

      if (!res.ok) {
        throw new Error(`Failed to load questions (${res.status})`);
      }

      const data: Question[] = await res.json();
      setQuestions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && folderId) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, folderId]);

  const counts = {
    Easy: questions.filter((q) => q.difficulty === "easy").length,
    Medium: questions.filter((q) => q.difficulty === "medium").length,
    Hard: questions.filter((q) => q.difficulty === "hard").length,
  };

  const visibleQuestions =
    filter === "All"
      ? questions
      : questions.filter((q) => difficultyLabels[q.difficulty] === filter);

  if (isLoading) return <FolderQuestionsSkeleton />;

  if (error) {
    return (
      <Screen className="relative">
        <header className="flex items-center justify-between px-4 pt-5">
          <ChevronLeft
            className="size-6 cursor-pointer"
            strokeWidth={1.75}
            onClick={() => router.back()}
          />
          <h1 className="text-[17px] font-semibold">{folderName}</h1>
          <div className="flex items-center gap-3">
            <Search className="size-5" strokeWidth={1.75} />
            <SlidersHorizontal className="size-5" strokeWidth={1.75} />
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-hard-soft">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="mt-6 font-display text-[24px] leading-tight text-center">
            Couldn&apos;t load questions
          </h2>
          <p className="mt-3 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
            {error}
          </p>
          <button
            onClick={fetchQuestions}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-rule bg-paper-card px-8 py-3.5 text-[16px] text-ink hover:bg-tag transition-colors"
          >
            <RefreshCw className="size-4" strokeWidth={1.75} />
            Try again
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-4 pt-5">
        <ChevronLeft
          className="size-6 cursor-pointer"
          strokeWidth={1.75}
          onClick={() => router.back()}
        />
        <h1 className="text-[17px] font-semibold">{folderName}</h1>
        <div className="flex items-center gap-3">
          <Search className="size-5" strokeWidth={1.75} />
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </div>
      </header>

      <div className="px-4 pt-5">
        <p className="flex items-center gap-1.5 font-mono text-[13px] tracking-[0.1em] text-ink-soft uppercase">
          <Folder className="size-4 text-brand" strokeWidth={1.5} />
          <span className="text-brand">{folderName}</span>
        </p>
        <h2 className="mt-2 font-display text-[34px] leading-tight">{folderName}</h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          {questions.length} {questions.length === 1 ? "question" : "questions"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-4">
        <button
          onClick={() => setFilter("All")}
          className={`rounded-full px-3 py-1.5 text-[12px] ${
            filter === "All" ? "bg-onyx text-paper" : "border border-rule text-ink"
          }`}
        >
          All
        </button>
        {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
          <FilterChip
            key={level}
            level={level}
            n={counts[level]}
            active={filter === level}
            onClick={() => setFilter(level)}
          />
        ))}
      </div>

      {visibleQuestions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
          <p className="text-[16px] text-ink-soft">
            {questions.length === 0 ? "No questions yet." : "No questions match this filter."}
          </p>
        </div>
      ) : (
        <ul className="mt-3 px-4 pb-24">
          {visibleQuestions.map((q, i) => {
            const label = difficultyLabels[q.difficulty];
            const s = difficultyStyles[label];
            return (
              <li key={q.id} className="flex gap-3 border-b border-rule py-5">
                <span className="pt-0.5 font-mono text-[12px] text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-relaxed">{q.text}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] ${s.pill} ${s.text}`}
                    >
                      <span className={`size-[6px] rounded-full ${s.dot}`} />
                      {label}
                    </span>
                    {q.note && (
                      <span className="text-[13px] text-ink-faint">Has notes</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button className="absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full bg-onyx px-6 py-3 text-[16px] text-paper">
        <Plus className="size-5" strokeWidth={1.75} />
        Add question
      </button>
    </Screen>
  );
}

function FilterChip({
  level,
  n,
  active,
  onClick,
}: {
  level: Difficulty;
  n: number;
  active: boolean;
  onClick: () => void;
}) {
  const s = difficultyStyles[level];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
        active ? `border-current ${s.text}` : "border-rule"
      }`}
    >
      <span className={s.text}>{level}</span>
      <span className="text-ink-soft">{n}</span>
    </button>
  );
}

function FolderQuestionsSkeleton() {
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
                style={{ width: `${70 + (i % 3) * 10}%`, animationDelay: `${i * 100}ms` }}
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