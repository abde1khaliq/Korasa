"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  LayoutGrid,
  Plus,
  RefreshCw,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Screen } from "@/components/misc/Screen";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export interface Subject {
  id: number;
  name: string;
}

export function HomeSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to load subjects (${res.status})`);
      }

      const subjects: Subject[] = await res.json();
      setSubjects(subjects);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch subjects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSubjectCreated = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    showNotification(`"${newSubject.name}" created`);
  };

  useEffect(() => {
    if (session) {
      fetchSubjects();
    }
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [session]);

  if (isLoading) {
    return <HomeSubjectsSkeleton />;
  }

  if (error) {
    return (
      <Screen>
        <header className="flex items-center justify-between px-6 pt-6">
          <span className="font-display text-2xl leading-none">K</span>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-hard-soft">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="mt-6 font-display text-[24px] leading-tight text-center">
            Couldn&apos;t load subjects
          </h2>
          <p className="mt-3 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
            {error}
          </p>
          <button
            onClick={fetchSubjects}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-rule bg-paper-card px-8 py-3.5 text-[16px] text-ink hover:bg-tag transition-colors"
          >
            <RefreshCw className="size-4" strokeWidth={1.75} />
            Try again
          </button>
        </div>
      </Screen>
    );
  }

  if (subjects.length === 0) {
    return (
      <>
        <HomeEmptyState onCreateClick={() => setShowCreateModal(true)} />
        {showCreateModal && (
          <CreateSubjectModal
            accessToken={session?.accessToken}
            onClose={() => setShowCreateModal(false)}
            onCreated={handleSubjectCreated}
          />
        )}
        <Notification message={notification} />
      </>
    );
  }

  return (
    <>
      <Screen>
        <header className="flex items-center justify-between px-6 pt-6">
          <span className="font-display text-2xl leading-none">K</span>
        </header>

        <div className="px-6 pt-6">
          <h1 className="font-display text-[56px] leading-[1.05]">Subjects</h1>
          <p className="mt-2 text-[17px] text-ink-soft">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"} ·
            0 questions
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-6">
          {subjects.map((subject) => (
            <article
              key={subject.id}
              onClick={() => router.push(`/subject/${subject.id}`)}
              className="flex h-[190px] flex-col justify-between rounded-2xl border border-rule bg-paper-card p-4 hover:border-brand cursor-pointer transition-colors"
            >
              <h2 className="font-display text-[18px] leading-[1.15]">
                {subject.name}
              </h2>
            </article>
          ))}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 left-1/2 ml-[130px] flex size-12 -translate-x-1/5 items-center justify-center rounded-2xl bg-onyx text-paper hover:bg-onyx/90 transition-colors"
        >
          <Plus className="size-7" strokeWidth={1.75} />
        </button>
      </Screen>

      {showCreateModal && (
        <CreateSubjectModal
          accessToken={session?.accessToken}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleSubjectCreated}
        />
      )}
      <Notification message={notification} />
    </>
  );
}

function HomeSubjectsSkeleton() {
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
          English, Chemistry, or anything you're learning.
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

function CreateSubjectModal({
  accessToken,
  onClose,
  onCreated,
}: {
  accessToken?: string;
  onClose: () => void;
  onCreated: (subject: Subject) => void;
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: trimmed }),
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to create subject (${res.status})`);
      }

      const created: Subject = await res.json();
      onCreated(created);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-onyx/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[420px] animate-[slideUp_0.25s_ease-out] rounded-t-3xl bg-paper px-6 pb-8 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px]">New subject</h2>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full hover:bg-tag transition-colors"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="subject-name"
            className="font-mono text-[13px] tracking-[0.12em] text-ink-faint uppercase"
          >
            Subject name
          </label>
          <input
            ref={inputRef}
            id="subject-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. English, Chemistry…"
            className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[16px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
          />

          {error && <p className="mt-3 text-[14px] text-hard">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-onyx py-3.5 text-[16px] font-medium text-paper transition-colors hover:bg-onyx/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Plus className="size-5" strokeWidth={1.75} />
            )}
            {isSubmitting ? "Creating…" : "Create subject"}
          </button>
        </form>
      </div>
    </div>
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

function Notification({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 animate-[slideUp_0.25s_ease-out] items-center gap-3 rounded-full bg-onyx px-5 py-3.5 text-[15px] text-paper shadow-sm">
      <div className="flex size-5 items-center justify-center rounded-full bg-paper/20">
        <Check className="size-3.5" strokeWidth={2.5} />
      </div>
      {message}
    </div>
  );
}