"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, ArrowRight, Trash2, Zap, X, Loader2 } from "lucide-react";
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
      // Use capture phase to catch the event before it bubbles
      document.addEventListener("mousedown", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [menuSubject]);

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

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Position the menu near the click, but keep it in viewport
    const menuWidth = 260;
    const menuHeight = 150;
    const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

    setMenuPosition({ x: adjustedX, y: adjustedY });
    setMenuSubject(subject);
  };

  const handleLongPress = (subject: Subject) => {
    // On mobile, center the menu
    setMenuPosition(null);
    setMenuSubject(subject);
  };

  const closeMenu = () => {
    setMenuSubject(null);
    setMenuPosition(null);
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
    <>
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

      <div className="px-6 pt-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
            {getGreeting()}
          </span>
        </div>
        <h1 className="mt-2 font-display text-[48px] leading-[1.05] text-ink">
          {getFormattedName(userName)}
        </h1>
        <p className="mt-2 text-[17px] text-ink-soft">
          Ready to pick up where you left off?
        </p>
      </div>

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

      <div className="px-6 pt-8">
        <h2 className="font-display text-[30px] leading-tight text-ink">
          Subjects
        </h2>
        <p className="mt-1 text-[17px] text-ink-soft">
          {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-6 pb-24">
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
              className="relative flex h-[190px] flex-col rounded-2xl border border-rule bg-paper-card p-4 hover:border-brand cursor-pointer transition-colors select-none"
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

              <span
                className={`inline-flex w-fit rounded-lg px-3 py-1.5 font-mono text-[13px] tracking-widest ${chip}`}
              >
                {code}
              </span>
              <h2 className="mt-auto font-display text-[26px] leading-[1.15] truncate text-ink">
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

      <button
        onClick={() => setShowQuickCreate(true)}
        className="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-onyx text-paper shadow-lg shadow-onyx/30 hover:bg-onyx/90 transition-all active:scale-95 border border-rule/20"
      >
        <Zap className="size-6" strokeWidth={0} fill="currentColor" />
      </button>

      {/* Absolute positioned delete modal */}
      {menuSubject && (
        <div
          className="fixed inset-0 z-50"
          onClick={(e) => {
            // Close only if clicking the backdrop itself (not the menu)
            if (e.target === e.currentTarget) {
              closeMenu();
            }
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-onyx/20 backdrop-blur-sm" />

          {/* Menu positioned absolutely */}
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
            <div className="rounded-2xl border border-rule bg-paper shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-rule">
                <h3 className="font-display text-[16px] text-ink truncate">
                  {menuSubject.name}
                </h3>
              </div>

              <div className="p-2">
                <button
                  onClick={() => handleDeleteSubject(menuSubject)}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-hard hover:bg-hard-soft/20 transition-colors disabled:opacity-40"
                >
                  {isDeleting ? (
                    <Loader2
                      className="size-4 animate-spin"
                      strokeWidth={1.75}
                    />
                  ) : (
                    <Trash2 className="size-4" strokeWidth={1.75} />
                  )}
                  {isDeleting ? "Deleting..." : "Delete subject"}
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
    </>
  );
}
