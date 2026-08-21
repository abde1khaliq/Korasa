"use client";

import { ChevronRight, Folder, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Notification } from "@/components/misc/Notification";
import { SubjectFoldersSkeleton } from "@/components/SubjectFolders/SubjectFolderSkeleton";
import { SubjectFoldersError } from "@/components/SubjectFolders/SubjectFoldersError";
import { CreateFolderModal } from "@/components/SubjectFolders/CreateFolderModal";
import { useSubjectFolders } from "@/app/hooks/useSubjectFolders";
import { useNotification } from "@/app/hooks/useNotification";
import { useState } from "react";
import { FolderItem } from "@/types/folder";

export function SubjectFolders() {
  const { id: subjectID } = useParams();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const { subject, folders, isLoading, error, fetchData, addFolder } =
    useSubjectFolders(subjectID);

  const { notification, showNotification } = useNotification();

  const handleFolderCreated = (newFolder: FolderItem) => {
    addFolder(newFolder);
    showNotification(`"${newFolder.name}" created`);
  };

  if (isLoading) {
    return <SubjectFoldersSkeleton />;
  }

  if (error) {
    return <SubjectFoldersError error={error} onRetry={fetchData} />;
  }

  return (
    <>
      <div className="px-6 pt-6 bg-paper">
        <h2 className="mt-2 font-display text-[46px] leading-none text-ink">
          {subject?.name}
        </h2>
        <p className="mt-3 font-mono text-[15px] text-ink-soft">
          {subject?.folder_count} folders{" "}
          <span className="text-ink-faint">·</span> {subject?.question_count}{" "}
          questions
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between px-6">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Folders
        </p>
      </div>

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
                <span className="capitalize">
                  {folder.difficulty || "Mixed"}
                </span>
              </div>
            </div>

            <ChevronRight
              className="size-5 text-ink-faint/60"
              strokeWidth={2}
            />
          </li>
        ))}
      </ul>

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
          onClose={() => setShowCreateModal(false)}
          onCreated={handleFolderCreated}
        />
      )}

      <Notification message={notification} />
    </>
  );
}
