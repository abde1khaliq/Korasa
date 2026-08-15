"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  RefreshCw,
  X,
  Loader2,
  ArrowRight,
  LogOut,
  Trash2,
} from "lucide-react";
import { Screen } from "@/components/misc/Screen";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Notification } from "@/components/misc/Notification";
import { HomeSubjectsSkeleton } from "@/components/HomeSubjects/HomeSubjectsSkeleton";
import { HomeEmptyState } from "@/components/HomeSubjects/HomeEmptyState";

export interface Subject {
  id: number;
  name: string;
  question_count?: number;
  folder_count?: number;
}

const CHIP_COLORS = [
  "bg-[oklch(0.94_0.03_60)] text-brand",
  "bg-[oklch(0.94_0.025_160)] text-easy",
  "bg-[oklch(0.93_0.03_300)] text-[oklch(0.5_0.11_300)]",
  "bg-[oklch(0.94_0.03_35)] text-hard",
  "bg-[oklch(0.93_0.025_255)] text-[oklch(0.52_0.09_255)]",
];

function getSubjectMeta(subjectId: number, name: string) {
  const code = name.substring(0, 3).toUpperCase();
  const chip = CHIP_COLORS[subjectId % CHIP_COLORS.length];
  return { code, chip };
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [menuSubject, setMenuSubject] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const router = useRouter();
  const { data: session } = useSession();
  const [recentSubject, setRecentSubject] = useState<Subject | null>(null);

  const fetchRecentSubject = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/recent`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      if (!res.ok) {
        setRecentSubject(null);
        return;
      }
      const data: Subject = await res.json();
      setRecentSubject(data);
    } catch (err) {
      console.error("Failed to fetch recent subject:", err);
      setRecentSubject(null);
    }
  };

  const userName = session?.user?.name || "";

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

  const handleDeleteSubject = async (subject: Subject) => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subject.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to delete subject (${res.status})`);
      }

      setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
      if (recentSubject?.id === subject.id) {
        setRecentSubject(null);
      }
      showNotification(`"${subject.name}" deleted`);
      setMenuSubject(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      showNotification(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePointerDown = (subject: Subject) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setMenuSubject(subject);
    }, 500);
  };

  const handlePointerUpOrCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (session) {
      fetchSubjects();
      fetchRecentSubject();
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
        {/* --- Header --- */}

        <header className="flex items-center justify-between px-6 pt-6">
          <span className="font-display text-2xl leading-none">K</span>
          <div className="flex items-center gap-5 text-ink">
            <LogOut
              className="w-6 h-6 cursor-pointer text-red-500"
              strokeWidth={1.75}
              onClick={() => signOut()}
            />
          </div>
        </header>

        {/* --- Greeting Section --- */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
              {greeting()}
            </span>
          </div>
          <h1 className="mt-2 font-display text-[48px] leading-[1.05]">
            {userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}
          </h1>
          <p className="mt-2 text-[17px] text-ink-soft">
            Ready to pick up where you left off?
          </p>
        </div>

        {/* --- Continue Studying --- */}
        {recentSubject && (
          <div className="mt-6 px-6">
            <div className="relative overflow-hidden rounded-2xl border border-rule bg-onyx p-5 text-paper">
              <div className="relative z-10">
                <span className="font-mono text-[13px] tracking-[0.18em] text-paper/60 uppercase">
                  Continue studying
                </span>
                <h2 className="mt-2 font-display text-[26px] leading-[1.15]">
                  {recentSubject.name}
                </h2>
                <button
                  onClick={() => router.push(`/subject/${recentSubject.id}`)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-[15px] font-medium text-onyx"
                >
                  Continue
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </button>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 opacity-10">
                <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* --- Subjects Header --- */}
        <div className="px-6 pt-8">
          <h2 className="font-display text-[30px] leading-tight">Subjects</h2>
          <p className="mt-1 text-[17px] text-ink-soft">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
          </p>
        </div>

        {/* --- Subjects Grid --- */}
        <div className="grid grid-cols-2 gap-4 px-6 py-6 pb-24">
          {subjects.map((subject) => {
            const { code, chip } = getSubjectMeta(subject.id, subject.name);

            return (
              <article
                key={subject.id}
                onPointerDown={() => handlePointerDown(subject)}
                onPointerUp={handlePointerUpOrCancel}
                onPointerCancel={handlePointerUpOrCancel}
                onPointerLeave={handlePointerUpOrCancel}
                onPointerMove={handlePointerUpOrCancel}
                onClick={(e) => {
                  if (isLongPressRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    isLongPressRef.current = false;
                    return;
                  }
                  router.push(`/subject/${subject.id}`);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenuSubject(subject);
                }}
                className="flex h-[190px] flex-col rounded-2xl border border-rule bg-paper-card p-4 hover:border-brand cursor-pointer transition-colors select-none"
              >
                <span
                  className={`inline-flex w-fit rounded-lg px-3 py-1.5 font-mono text-[13px] tracking-widest ${chip}`}
                >
                  {code}
                </span>
                <h2 className="mt-auto font-display text-[26px] leading-[1.15]">
                  {subject.name}
                </h2>
                <div className="mt-3 flex flex-col gap-2 font-mono text-[14px] text-ink-soft">
                  <span className="flex flex-row items-center gap-2 leading-tight">
                    <span>{subject.folder_count || 0}</span>
                    <span>folders</span>
                  </span>
                  <span className="flex flex-row items-center gap-2 leading-tight">
                    <span>{subject.question_count || 0}</span>
                    <span>questions</span>
                  </span>
                </div>
              </article>
            );
          })}

          {/* New Subject Card Button inside grid */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule hover:bg-tag/30 transition-colors"
          >
            <span className="flex size-12 items-center justify-center rounded-full border border-ink-faint">
              <Plus className="size-5 text-ink-soft" strokeWidth={1.5} />
            </span>
            <span className="text-[16px] text-ink-soft">New subject</span>
          </button>
        </div>
      </Screen>

      {/* --- Context Action Popup Menu --- */}
      {menuSubject && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-onyx/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMenuSubject(null);
          }}
        >
          <div className="w-full max-w-[420px] animate-[slideUp_0.25s_ease-out] rounded-t-3xl bg-paper px-6 pb-8 pt-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[22px]">{menuSubject.name}</h2>
              <button
                onClick={() => setMenuSubject(null)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-tag transition-colors"
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => handleDeleteSubject(menuSubject)}
                disabled={isDeleting}
                className="flex w-full items-center gap-3 rounded-xl bg-hard-soft/50 px-4 py-3.5 text-[16px] font-medium text-hard transition-colors hover:bg-hard-soft disabled:opacity-40"
              >
                {isDeleting ? (
                  <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Trash2 className="size-5" strokeWidth={1.75} />
                )}
                {isDeleting ? "Deleting..." : "Delete subject"}
              </button>
            </div>
          </div>
        </div>
      )}

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
