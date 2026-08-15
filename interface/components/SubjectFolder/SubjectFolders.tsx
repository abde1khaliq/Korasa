"use client";

import {
  ChevronLeft,
  ChevronRight,
  Folder,
  ArrowDownUp,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Screen } from "@/components/misc/Screen";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Subject } from "@/components/HomeSubjects/HomeSubjects";
import { useParams, useRouter } from "next/navigation";
import { Notification } from "@/components/misc/Notification";
import { SubjectFoldersSkeleton } from "@/components/SubjectFolder/SubjectFolderSkeleton";
import { CreateFolderModal } from "@/components/SubjectFolder/CreateFolderModal";

export interface FolderItem {
  id: number;
  name: string;
}

export function SubjectFolders() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

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

      <Notification message={notification} />
    </>
  );
}
