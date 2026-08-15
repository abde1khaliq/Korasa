"use client";

import {
  ChevronLeft,
  ChevronRight,
  Folder,
  ArrowDownUp,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Screen } from "@/components/misc/Screen";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getSubjectMeta,
  Subject,
} from "@/components/HomeSubjects/HomeSubjects";
import { useParams, useRouter } from "next/navigation";
import { Notification } from "@/components/misc/Notification";
import { SubjectFoldersSkeleton } from "@/components/SubjectFolders/SubjectFolderSkeleton";
import { CreateFolderModal } from "@/components/SubjectFolders/CreateFolderModal";

export interface FolderItem {
  id: number;
  name: string;
  question_count?: number;
  folder_count?: number;
  difficulty?: string;
}

export function SubjectFolders() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [chip, setChip] = useState<string | null>();
  const [code, setCode] = useState<string | null>();

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

      const { code, chip } = getSubjectMeta(subjectData.id, subjectData.name);

      setChip(chip);
      setCode(code);

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

  const showNotification = (message: string) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleFolderCreated = (newFolder: FolderItem) => {
    setFolders((prev) => [...prev, newFolder]);
    showNotification(`"${newFolder.name}" created`);
  };

  useEffect(() => {
    if (session && subjectID) {
      fetchData();
    }

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
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
    <>
      <Screen className="relative">
        {/* Header */}
        <header className="flex items-center justify-between px-4 pt-5">
          <ChevronLeft
            className="size-6 cursor-pointer"
            strokeWidth={1.75}
            onClick={() => router.back()}
          />
          <h1 className="text-[17px]">{subject?.name}</h1>
          <div className="flex items-center gap-3">
            <RotateCcw className="size-5" strokeWidth={1.75} />
          </div>
        </header>

      <div className="px-6 pt-6">
        <h2 className="mt-2 font-display text-[46px] leading-none">{subject?.name}</h2>
        <p className="mt-3 font-mono text-[15px] text-ink-soft">
          {subject?.folder_count} folders <span className="text-ink-faint">·</span> {subject?.question_count} questions
        </p>
      </div>

        {/* Folders List Header */}
        <div className="mt-8 flex items-center justify-between px-6">
          <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
            Folders
          </p>
          {/* <button className="flex items-center gap-2 text-[15px] text-ink">
            <ArrowDownUp className="size-4" strokeWidth={1.75} />
            Recent
          </button> */}
        </div>

        {/* Folders List */}
        <ul className="mt-3 px-5 pb-28">
          {folders.map((folder) => (
            <li
              key={folder.id}
              onClick={() =>
                router.push(
                  `/subject/${subjectID}/folder/${folder.id}?name=${encodeURIComponent(folder.name)}`,
                )
              }
              className="flex items-center gap-4 rounded-xl px-2 py-4 cursor-pointer hover:bg-tag/40 transition-colors"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-tag">
                <Folder className="size-6 text-brand" strokeWidth={1.5} />
              </span>
              
              <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-medium text-ink">
                  {folder.name}
                </p>
                <div className="mt-1 flex items-center gap-2.5 font-mono text-[13px] text-ink-soft">
                  <span>{folder.question_count || 0} questions</span>
                  <span className="h-[3px] w-[3px] rounded-full bg-ink-faint/50"></span>
                  <span className="capitalize">{folder.difficulty || "Mixed"}</span>
                </div>
              </div>
              
              <ChevronRight
                className="size-5 text-ink-faint/60"
                strokeWidth={2}
              />
            </li>
          ))}
        </ul>

        {/* Add Folder Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full bg-onyx px-6 py-3.5 text-[16px] font-medium text-paper shadow-lg shadow-onyx/20 transition-transform active:scale-95"
        >
          <Plus className="size-5" strokeWidth={2} />
          Add Folder
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

      <Notification message={notification} />
    </>
  );
}