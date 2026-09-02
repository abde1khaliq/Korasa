"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Folder, Plus, MoreVertical, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Notification } from "@/components/misc/Notification";
import { SubjectFoldersSkeleton } from "@/components/SubjectFolders/SubjectFolderSkeleton";
import { SubjectFoldersError } from "@/components/SubjectFolders/SubjectFoldersError";
import { CreateFolderModal } from "@/components/SubjectFolders/CreateFolderModal";
import { EditFolderModal } from "@/components/SubjectFolders/EditFolderModal";
import { useSubjectFolders } from "@/app/hooks/useSubjectFolders";
import { useNotification } from "@/app/hooks/useNotification";
import { FolderItem } from "@/types/folder";

export function SubjectFolders() {
  const { id: subjectID } = useParams();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FolderItem | null>(null);

  const {
    subject,
    folders,
    isLoading,
    error,
    fetchData,
    addFolder,
    updateFolderState,
    deleteFolder,
  } = useSubjectFolders(subjectID);

  const { notification, showNotification } = useNotification();

  const handleFolderCreated = (newFolder: FolderItem) => {
    addFolder(newFolder);
    showNotification(`"${newFolder.name}" created`);
  };

  const handleFolderUpdated = (updated: FolderItem) => {
    updateFolderState(updated);
    showNotification(`"${updated.name}" updated`);
  };

  const handleDeleteFolder = async (folder: FolderItem) => {
    setConfirmDelete(null);
    try {
      await deleteFolder(folder.id);
      showNotification(`"${folder.name}" deleted`);
    } catch {
      showNotification("Failed to delete folder");
    }
  };

  if (isLoading) return <SubjectFoldersSkeleton />;
  if (error) return <SubjectFoldersError error={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Desktop Breadcrumb Navigation */}
      <div className="hidden md:flex items-center gap-2 text-[13px] font-mono text-ink-faint">
        <Link href="/app" className="flex items-center gap-1 hover:text-brand transition-colors">
          <ArrowLeft className="size-3.5" />
          <span>Subjects</span>
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{subject?.name || "Folders"}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rule/60">
        <div>
          <h1 className="font-display text-[36px] sm:text-[42px] font-normal leading-tight text-ink">
            {subject?.name}
          </h1>
          <p className="mt-1 font-mono text-[14px] text-ink-soft">
            {subject?.folder_count || folders.length} folders{" "}
            <span className="text-ink-faint">·</span> {subject?.question_count || 0}{" "}
            questions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-onyx px-4 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          <span>Add Folder</span>
        </button>
      </div>

      {/* Folders List or Empty State */}
      {folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-rule text-center my-6 bg-paper-card/40">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-tag text-brand mb-3">
            <Folder className="size-7" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-normal text-ink">
            No folders in this subject
          </h3>
          <p className="mt-1 text-[14px] text-ink-soft max-w-sm">
            Create folders to group your flashcards by chapter, topic, or module.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-onyx px-4 py-2.5 text-[14px] font-medium text-paper"
          >
            <Plus className="size-4" />
            <span>Create Folder</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="group relative flex items-center justify-between gap-4 rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 hover:border-brand/70 hover:shadow-xs transition-all select-none"
            >
              <div
                onClick={() =>
                  router.push(
                    `/subject/${subjectID}/folder/${folder.id}?name=${encodeURIComponent(folder.name)}`,
                  )
                }
                className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-tag text-brand group-hover:scale-105 transition-transform">
                  <Folder className="size-6" strokeWidth={1.75} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] font-medium text-ink truncate group-hover:text-brand transition-colors">
                    {folder.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[12px] text-ink-soft">
                    <span>{folder.question_count || 0} questions</span>
                    <span className="text-ink-faint">·</span>
                    <span className="capitalize text-brand">
                      {folder.difficulty || "Mixed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Folder Actions */}
              <div className="relative shrink-0 flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                  }}
                  className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-tag/50 transition-colors"
                >
                  <MoreVertical className="size-4" />
                </button>

                {activeMenuId === folder.id && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setActiveMenuId(null)}
                    />
                    <div className="absolute right-0 top-8 z-30 w-36 rounded-xl border border-rule bg-paper p-1 shadow-lg animate-in fade-in zoom-in-95">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                          setEditingFolder(folder);
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-ink hover:bg-tag/40 transition-colors"
                      >
                        <Pencil className="size-3.5" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                          setConfirmDelete(folder);
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-hard hover:bg-hard-soft/30 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}

                <ChevronRight
                  className="size-5 text-ink-faint/60 group-hover:text-ink group-hover:translate-x-0.5 transition-all cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/subject/${subjectID}/folder/${folder.id}?name=${encodeURIComponent(folder.name)}`,
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateFolderModal
          subjectID={subjectID as string}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleFolderCreated}
        />
      )}

      {editingFolder && (
        <EditFolderModal
          subjectID={subjectID as string}
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onUpdated={handleFolderUpdated}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/30 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-rule bg-paper p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display text-xl font-normal text-ink">
              Delete Folder
            </h3>
            <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
              Are you sure you want to delete &ldquo;{confirmDelete.name}&rdquo;? All questions inside this folder will be deleted.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-rule text-[13px] text-ink hover:bg-tag/40"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFolder(confirmDelete)}
                className="px-4 py-2 rounded-xl bg-hard text-[13px] font-medium text-white hover:bg-hard/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Notification message={notification} />
    </div>
  );
}
