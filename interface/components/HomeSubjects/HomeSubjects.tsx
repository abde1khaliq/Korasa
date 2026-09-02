"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Notification } from "@/components/misc/Notification";
import { HomeSubjectsSkeleton } from "@/components/HomeSubjects/HomeSubjectsSkeleton";
import { HomeSubjectsError } from "@/components/HomeSubjects/HomeSubjectsError";
import { HomeEmptyState } from "@/components/HomeSubjects/HomeEmptyState";
import { QuickCreateModal } from "@/components/HomeSubjects/QuickCreateModal";
import { CreateSubjectModal } from "./CreateSubjectModal";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useNotification } from "@/app/hooks/useNotification";
import { useLongPress } from "@/app/hooks/useLongPress";
import {
  getSubjectMeta,
  getGreeting,
  getFormattedName,
} from "@/app/utils/subjectUtils";
import { Subject } from "@/types/subject";

export function HomeSubjects() {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [menuSubject, setMenuSubject] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    subjects,
    isLoading,
    error,
    recentSubject,
    fetchSubjects,
    deleteSubject,
    addSubject,
    updateSubjectCounts,
  } = useSubjects();

  const { notification, showNotification } = useNotification();
  const {
    longPressSubjectId,
    isLongPressRef,
    handlePointerDown,
    handlePointerUpOrCancel,
    resetLongPress,
  } = useLongPress();

  const closeMenu = useCallback(() => {
    setMenuSubject(null);
    setMenuPosition(null);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuSubject) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [menuSubject]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (menuSubject) {
      document.addEventListener("mousedown", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [menuSubject, closeMenu]);

  const handleSubjectCreated = (newSubject: Subject) => {
    addSubject(newSubject);
    showNotification(`"${newSubject.name}" created`);
  };

  const handleQuickFolderCreated = (subjectId: number) => {
    updateSubjectCounts(subjectId, "folder");
    showNotification("Folder created");
  };

  const handleQuickQuestionCreated = (subjectId: number) => {
    updateSubjectCounts(subjectId, "question");
    showNotification("Question created");
  };

  const handleDeleteSubject = async (subject: Subject) => {
    setIsDeleting(true);
    const result = await deleteSubject(subject.id);
    if (result.success) {
      showNotification(`"${subject.name}" deleted`);
      closeMenu();
    } else {
      showNotification(result.error || "Failed to delete subject");
    }
    setIsDeleting(false);
  };

  const handleSubjectClick = (e: React.MouseEvent, subjectId: number) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      resetLongPress();
      return;
    }
    router.push(`/subject/${subjectId}`);
  };

  const handleContextMenu = (e: React.MouseEvent, subject: Subject) => {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const y = e.clientY;

    const menuWidth = 260;
    const menuHeight = 150;
    const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

    setMenuPosition({ x: adjustedX, y: adjustedY });
    setMenuSubject(subject);
  };

  const handleLongPress = (subject: Subject) => {
    setMenuPosition(null);
    setMenuSubject(subject);
  };

  if (isLoading) {
    return <HomeSubjectsSkeleton />;
  }

  if (error) {
    return <HomeSubjectsError error={error} onRetry={fetchSubjects} />;
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
    <div className="space-y-6">
      <style>{`
        @keyframes drawBorder {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* Greeting Header */}
      <div>
        <span className="font-mono text-[13px] tracking-widest text-ink-faint uppercase">
          {getGreeting()}
        </span>
        <h1 className="mt-1 font-display text-[40px] leading-[44px] sm:text-[46px] sm:leading-[50px] font-normal text-ink">
          {getFormattedName(userName)}
        </h1>
        <p className="mt-1.5 text-[16px] text-ink-soft">
          Ready to pick up where you left off?
        </p>
      </div>

      {/* Continue Studying Banner */}
      {recentSubject && (
        <div className="relative overflow-hidden rounded-2xl border border-rule bg-onyx p-6 text-paper shadow-md">
          <div className="relative z-10">
            <span className="font-mono text-[12px] tracking-widest text-paper/70 uppercase">
              Continue Studying
            </span>
            <h2 className="mt-1.5 font-display text-[26px] leading-[30px] font-normal text-paper">
              {recentSubject.name}
            </h2>
            <button
              onClick={() => router.push(`/subject/${recentSubject.id}`)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-[14px] font-medium text-onyx hover:bg-paper/90 active:scale-95 transition-all shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="pointer-events-none absolute -right-6 -top-6 opacity-10">
            <svg width="180" height="180" viewBox="0 0 160 160" fill="none">
              <circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="2" />
              <circle cx="80" cy="80" r="44" stroke="currentColor" strokeWidth="2" />
              <circle cx="80" cy="80" r="28" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )}

      {/* Subjects Section Title */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[30px] leading-[34px] font-normal text-ink">
            Subjects
          </h2>
          <p className="text-[14px] text-ink-soft mt-0.5">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-onyx px-4 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-xs"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          <span>New Subject</span>
        </button>
      </div>

      {/* Subjects Grid (2 items per row) */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4.5">
        {subjects.map((subject) => {
          const { code, chip } = getSubjectMeta(subject.id, subject.name);
          const isLongPressing = longPressSubjectId === subject.id;

          return (
            <article
              key={subject.id}
              onPointerDown={(e) =>
                handlePointerDown(subject, e, handleLongPress)
              }
              onPointerUp={handlePointerUpOrCancel}
              onPointerCancel={handlePointerUpOrCancel}
              onPointerLeave={handlePointerUpOrCancel}
              onClick={(e) => handleSubjectClick(e, subject.id)}
              onContextMenu={(e) => handleContextMenu(e, subject)}
              className="group relative flex h-[195px] flex-col justify-between rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 hover:border-brand/70 hover:shadow-xs cursor-pointer transition-all select-none"
            >
              {isLongPressing && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none">
                  <svg className="absolute inset-0 w-full h-full">
                    <rect
                      x="1"
                      y="1"
                      rx="15"
                      ry="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="text-brand"
                      pathLength="100"
                      strokeDasharray="100"
                      style={{
                        width: "calc(100% - 2px)",
                        height: "calc(100% - 2px)",
                        animation: "drawBorder 500ms linear forwards",
                      }}
                    />
                  </svg>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex rounded-lg px-2.5 py-1 font-mono text-[11px] sm:text-[12px] font-bold tracking-widest ${chip}`}
                >
                  {code}
                </span>

                <span className="text-[10px] sm:text-[11px] font-mono text-ink-faint group-hover:text-brand transition-colors hidden xs:inline">
                  Menu
                </span>
              </div>

              <div>
                <h3 className="font-display text-[20px] sm:text-[25px] leading-[24px] sm:leading-[29px] font-normal truncate text-ink group-hover:text-brand transition-colors">
                  {subject.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-[12px] text-ink-soft">
                  <span>{subject.folder_count || 0} folders</span>
                  <span className="text-ink-faint">·</span>
                  <span>{subject.question_count || 0} questions</span>
                </div>
              </div>
            </article>
          );
        })}

        {/* In-grid Create button: Mobile only (hidden on desktop/PC) */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex md:hidden h-[195px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule hover:bg-tag/30 hover:border-brand/60 transition-all text-ink cursor-pointer"
        >
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-full border border-ink-faint text-ink-soft">
            <Plus className="size-5" strokeWidth={1.75} />
          </div>
          <span className="text-[14px] sm:text-[15px] font-medium text-ink-soft">
            Create new subject
          </span>
        </button>
      </div>

      {/* Context Action Menu */}
      {menuSubject && (
        <div
          className="fixed inset-0 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div className="absolute inset-0 bg-onyx/20 backdrop-blur-xs" />

          <div
            ref={menuRef}
            className="absolute animate-[popIn_0.2s_ease-out]"
            style={{
              top: menuPosition ? menuPosition.y : "50%",
              left: menuPosition ? menuPosition.x : "50%",
              transform: menuPosition ? "none" : "translate(-50%, -50%)",
              minWidth: "220px",
              maxWidth: "280px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl border border-rule bg-paper shadow-2xl overflow-hidden p-1">
              <div className="px-3 py-2 border-b border-rule">
                <h3 className="font-display text-[15px] font-normal text-ink truncate">
                  {menuSubject.name}
                </h3>
              </div>

              <div className="p-1 space-y-1">
                <button
                  onClick={() => {
                    router.push(`/subject/${menuSubject.id}`);
                    closeMenu();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-ink hover:bg-tag/40"
                >
                  <ArrowRight className="size-4 text-ink-soft" />
                  <span>Open Subject</span>
                </button>

                <button
                  onClick={() => handleDeleteSubject(menuSubject)}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-hard hover:bg-hard-soft/30 disabled:opacity-40"
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  <span>{isDeleting ? "Deleting..." : "Delete Subject"}</span>
                </button>
              </div>
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

      {showQuickCreate && (
        <QuickCreateModal
          subjects={subjects}
          accessToken={session?.accessToken}
          onClose={() => setShowQuickCreate(false)}
          onFolderCreated={handleQuickFolderCreated}
          onQuestionCreated={handleQuickQuestionCreated}
        />
      )}

      <Notification message={notification} />
    </div>
  );
}
