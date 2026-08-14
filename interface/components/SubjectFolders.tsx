"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  Folder,
  ArrowDownUp,
  Plus,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { Screen } from "@/components/misc/Screen";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Subject } from "@/components/HomeSubjects";
import { useParams, useRouter } from "next/navigation";

interface FolderItem {
  id: number;
  name: string;
}

export function SubjectFolders() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session } = useSession();
  const { id: subjectID } = useParams();
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${session?.accessToken}` };

      const [subjectRes, foldersRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}`,
          { headers },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}/folders`,
          { headers },
        ),
      ]);

      if (!subjectRes.ok) {
        throw new Error(`Failed to load subject (${subjectRes.status})`);
      }
      if (!foldersRes.ok) {
        throw new Error(`Failed to load folders (${foldersRes.status})`);
      }

      const subjectData: Subject = await subjectRes.json();
      const foldersData: FolderItem[] = await foldersRes.json();

      setSubject(subjectData);
      setFolders(foldersData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch subject data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderCreated = (newFolder: FolderItem) => {
    setFolders((prev) => [...prev, newFolder]);
  };

  useEffect(() => {
    if (session && subjectID) {
      fetchData();
    }
  }, [session, subjectID]);

  if (isLoading) {
    return <SubjectFoldersSkeleton />;
  }

  if (error) {
    return (
      <Screen className="relative">
        <header className="flex items-center justify-between px-6 pt-6">
          <ChevronLeft
            className="size-7 cursor-pointer"
            strokeWidth={1.75}
            onClick={() => router.back()}
          />
          <h1 className="text-[20px] font-semibold">Subject</h1>
          {/* <div className="flex items-center gap-4">
            <Search className="size-6" strokeWidth={1.75} />
            <MoreHorizontal className="size-6" strokeWidth={1.75} />
          </div> */}
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-hard-soft">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="mt-6 font-display text-[24px] leading-tight text-center">
            Couldn&apos;t load this subject
          </h2>
          <p className="mt-3 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
            {error}
          </p>
          <button
            onClick={fetchData}
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
      <header className="flex items-center justify-between px-6 pt-6">
        <ChevronLeft
          className="size-7 cursor-pointer"
          strokeWidth={1.75}
          onClick={() => router.back()}
        />
      </header>

      <section className="mx-6 mt-6 rounded-2xl border border-rule bg-paper-card p-6">
        <h2 className="mt-4 font-display text-[42px] leading-none">
          {subject?.name}
        </h2>
        <div className="mt-6 grid grid-cols-3 font-mono text-[15px] text-ink-soft"></div>
      </section>

      <div className="mt-8 flex items-center justify-between px-6">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Folders
        </p>
        <button className="flex items-center gap-2 text-[16px] text-ink">
          <ArrowDownUp className="size-4" strokeWidth={1.75} />
          Recent
        </button>
      </div>

      <ul className="mt-4 px-6 pb-28">
        {folders.map((folder) => (
          <li
            key={folder.id}
            onClick={() =>
              router.push(
                `/subject/${subjectID}/folder/${folder.id}?name=${encodeURIComponent(folder.name)}`,
              )
            }
            className="flex items-center gap-4 border-b border-rule py-5 cursor-pointer hover:bg-tag/30 transition-colors"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tag">
              <Folder className="size-6 text-brand" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[19px]">{folder.name}</p>
            </div>
            <ChevronRight
              className="size-5 text-ink-faint"
              strokeWidth={1.75}
            />
          </li>
        ))}
      </ul>

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 left-1/2 ml-[130px] flex size-12 -translate-x-1/5 items-center justify-center rounded-2xl bg-onyx text-paper hover:bg-onyx/90 transition-colors"
      >
        <Plus className="size-7" strokeWidth={1.75} />
      </button>

      {showCreateModal && (
        <CreateFolderModal
          subjectID={subjectID as string}
          accessToken={session?.accessToken}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleFolderCreated}
        />
      )}
    </Screen>
  );
}

function SubjectFoldersSkeleton() {
  return (
    <Screen className="relative">
      {/* Header skeleton */}
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="size-7 animate-pulse rounded bg-tag/70" />
        <div className="h-5 w-24 animate-pulse rounded bg-tag/70" />
        <div className="flex items-center gap-4">
          <div className="size-6 animate-pulse rounded bg-tag/70" />
          <div className="size-6 animate-pulse rounded bg-tag/70" />
        </div>
      </header>

      {/* Subject hero card skeleton */}
      <section className="mx-6 mt-6 rounded-2xl border border-rule bg-paper-card p-6">
        <div className="mt-4 h-[42px] w-[65%] animate-pulse rounded-lg bg-tag/70" />
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div
                className="h-[34px] w-[50%] animate-pulse rounded bg-tag/60"
                style={{ animationDelay: `${i * 80}ms` }}
              />
              <div
                className="mt-2 h-[15px] w-[70%] animate-pulse rounded bg-tag/40"
                style={{ animationDelay: `${i * 80 + 40}ms` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Section label skeleton */}
      <div className="mt-8 flex items-center justify-between px-6">
        <div className="h-[13px] w-16 animate-pulse rounded bg-tag/50" />
        <div className="h-[16px] w-20 animate-pulse rounded bg-tag/50" />
      </div>

      {/* Folder rows skeleton */}
      <ul className="mt-4 px-6 pb-28">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center gap-4 border-b border-rule py-5"
          >
            <div
              className="size-12 shrink-0 animate-pulse rounded-xl bg-tag/60"
              style={{ animationDelay: `${i * 120}ms` }}
            />
            <div className="min-w-0 flex-1">
              <div
                className="h-[19px] animate-pulse rounded bg-tag/70"
                style={{
                  width: `${55 + (i % 3) * 15}%`,
                  animationDelay: `${i * 120 + 40}ms`,
                }}
              />
              <div
                className="mt-2 h-[14px] animate-pulse rounded bg-tag/40"
                style={{
                  width: `${70 + (i % 2) * 10}%`,
                  animationDelay: `${i * 120 + 80}ms`,
                }}
              />
            </div>
            <div
              className="size-5 animate-pulse rounded bg-tag/40"
              style={{ animationDelay: `${i * 120 + 60}ms` }}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function CreateFolderModal({
  subjectID,
  accessToken,
  onClose,
  onCreated,
}: {
  subjectID: string;
  accessToken?: string;
  onClose: () => void;
  onCreated: (folder: FolderItem) => void;
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}/folders`,
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
        throw new Error(`Failed to create folder (${res.status})`);
      }

      const created: FolderItem = await res.json();
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
          <h2 className="font-display text-[22px]">New folder</h2>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full hover:bg-tag transition-colors"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="folder-name"
            className="font-mono text-[13px] tracking-[0.12em] text-ink-faint uppercase"
          >
            Folder name
          </label>
          <input
            ref={inputRef}
            id="folder-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chapter 1, Vocabulary…"
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
            {isSubmitting ? "Creating…" : "Create folder"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-display text-[34px] leading-none ${accent ? "text-brand" : "text-ink"}`}
      >
        {value}
      </p>
      <p className="mt-2">{label}</p>
    </div>
  );
}
