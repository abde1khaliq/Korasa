"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  X,
  HelpCircle,
  FileText,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { difficultyStyles } from "@/components/misc/Screen";
import { Notification } from "@/components/misc/Notification";
import { FolderQuestionsSkeleton } from "@/components/FolderQuestions/FolderQuestionsSkeleton";
import { FolderQuestionsError } from "@/components/FolderQuestions/FolderQuestionsError";
import { FilterChip } from "./FilterChip";
import { CreateQuestionModal } from "./CreateQuestionModal";
import { useFolderQuestions } from "@/app/hooks/useFolderQuestions";
import { useQuestionFilter } from "@/app/hooks/useQuestionFilter";
import { useNotification } from "@/app/hooks/useNotification";
import {
  getDifficultyLabel,
  highlightText,
  getQuestionMatchType,
} from "@/app/utils/questionUtils";
import { Question } from "@/types/question";

interface FolderQuestionsProps {
  subjectId?: string;
  folderId?: string;
  folderName?: string;
}

export function FolderQuestions({
  subjectId: propSubjectId,
  folderId: propFolderId,
  folderName: propFolderName,
}: FolderQuestionsProps = {}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const subjectId =
    propSubjectId ||
    (Array.isArray(params?.id) ? params.id[0] : params?.id) ||
    "";
  const folderId =
    propFolderId ||
    (Array.isArray(params?.folderId) ? params.folderId[0] : params?.folderId) ||
    "";
  const folderName =
    propFolderName || searchParams?.get("name") || "Folder";

  const [showCreateModal, setShowCreateModal] = useState(false);

  const { questions, isLoading, error, fetchQuestions, addQuestion } =
    useFolderQuestions(folderId);

  const {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    counts,
    visibleQuestions,
    hasActiveSearch,
  } = useQuestionFilter(questions);

  const { notification, showNotification } = useNotification();

  const handleQuestionCreated = (newQuestion: Question) => {
    addQuestion(newQuestion);
    showNotification("Question added");
  };

  if (isLoading) return <FolderQuestionsSkeleton />;
  if (error) {
    return <FolderQuestionsError error={error} onRetry={fetchQuestions} />;
  }

  return (
    <div className="space-y-6">
      {/* Desktop Breadcrumb Navigation */}
      <div className="hidden md:flex items-center gap-2 text-[13px] font-mono text-ink-faint">
        <Link
          href="/app"
          className="flex items-center gap-1 hover:text-brand transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Subjects</span>
        </Link>
        <span>/</span>
        <Link
          href={`/subject/${subjectId}`}
          className="hover:text-brand transition-colors"
        >
          Folders
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{folderName}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rule/60">
        <div>
          <h1 className="font-display text-[34px] sm:text-[40px] font-normal leading-tight text-ink">
            {folderName}
          </h1>
          <p className="mt-1 font-mono text-[14px] text-ink-soft">
            {visibleQuestions.length} of {questions.length}{" "}
            {questions.length === 1 ? "question" : "questions"}
            {searchQuery && (
              <span className="text-ink-faint">
                {" "}
                matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-onyx px-4 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          <span>Add Question</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-rule bg-paper-card px-3.5 py-2.5 focus-within:border-brand transition-colors flex-1 shadow-xs">
          <Search className="size-4 text-ink-faint shrink-0" strokeWidth={1.75} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-0.5 rounded-md text-ink-faint hover:text-ink cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter("All")}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all cursor-pointer ${
              filter === "All"
                ? "bg-onyx text-paper border-onyx shadow-xs font-semibold"
                : "border-rule text-ink hover:bg-tag/50"
            }`}
          >
            <span>All</span>
            <span className="font-mono text-[11px] opacity-70">
              {questions.length}
            </span>
          </button>

          {(["Easy", "Medium", "Hard"] as const).map((level) => (
            <FilterChip
              key={level}
              level={level}
              n={counts[level]}
              active={filter === level}
              onClick={() => setFilter(level)}
            />
          ))}
        </div>
      </div>

      {/* Questions Grid or Empty State */}
      {visibleQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-rule text-center my-6 bg-paper-card/40">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-tag text-brand mb-3">
            <HelpCircle className="size-7 text-brand" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-normal text-ink">
            {questions.length === 0
              ? "No questions in this folder"
              : searchQuery
                ? `No questions match "${searchQuery}"`
                : "No questions match this filter"}
          </h3>
          <p className="mt-1 text-[14px] text-ink-soft max-w-sm leading-relaxed">
            {questions.length === 0
              ? "Click below to add your first flashcard question with answers, notes, and diagrams."
              : "Try adjusting your search query or choosing another filter chip."}
          </p>
          {questions.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="size-4" strokeWidth={2.2} />
              <span>Create Question</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {visibleQuestions.map((q, i) => {
            const label = getDifficultyLabel(q?.difficulty);
            const s = difficultyStyles[label] || difficultyStyles.Medium;
            const highlightedText = hasActiveSearch
              ? highlightText(q.text, searchQuery)
              : q.text;
            const matchType = getQuestionMatchType(q, searchQuery);
            const hasNotes = !!q.note?.trim();
            const hasText = !!q.text?.trim();

            return (
              <div
                key={q.id}
                onClick={() =>
                  router.push(
                    `/subject/${subjectId}/folder/${folderId}/question/${q.id}`,
                  )
                }
                className="group flex flex-col justify-between rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 hover:border-brand/70 hover:shadow-sm cursor-pointer transition-all select-none min-h-[190px]"
              >
                <div>
                  {/* Top Header: Index & Difficulty badge */}
                  <div className="flex items-center justify-between pb-2.5">
                    <span className="font-mono text-[12px] font-bold text-ink-faint">
                      #{String(i + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.pill} ${s.text}`}
                    >
                      <span className={`size-1.5 rounded-full ${s.dot}`} />
                      {label}
                    </span>
                  </div>

                  {/* Image container if available */}
                  {q.image_url ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-tag/40 border border-rule/50 my-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.image_url}
                        alt="Question preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : null}

                  {/* Question snippet */}
                  {hasText ? (
                    <p className="font-display text-[17px] text-ink font-normal line-clamp-3 leading-snug mt-1">
                      {highlightedText}
                    </p>
                  ) : !q.image_url ? (
                    <p className="text-[14px] text-ink-faint italic mt-1">
                      (No question text provided)
                    </p>
                  ) : null}
                </div>

                {/* Bottom metadata & Arrow */}
                <div className="mt-4 pt-2.5 border-t border-rule/50 flex items-center justify-between text-[12px] text-ink-soft">
                  <div className="flex items-center gap-2">
                    {hasNotes && (
                      <span className="inline-flex items-center gap-1 text-ink-faint font-medium">
                        <FileText className="size-3" />
                        <span>Has Notes</span>
                      </span>
                    )}

                    {matchType && (
                      <span className="text-brand font-medium">
                        In {matchType}
                      </span>
                    )}
                  </div>

                  <div className="flex size-6 items-center justify-center rounded-full bg-tag text-ink-faint group-hover:text-ink group-hover:bg-tag/80 transition-colors">
                    <ArrowUpRight className="size-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateQuestionModal
          folderId={folderId}
          folderName={folderName}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleQuestionCreated}
        />
      )}

      <Notification message={notification} />
    </div>
  );
}

