"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { Screen } from "@/components/misc/Screen";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Notification } from "@/components/misc/Notification";
import { HomeSubjectsSkeleton } from "@/components/HomeSubjects/HomeSubjectsSkeleton";
import { HomeEmptyState } from "@/components/HomeSubjects/HomeEmptyState";

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