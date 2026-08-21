"use client";

import { Search, Plus, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  difficultyLabels,
  highlightText,
  getQuestionMatchType,
} from "@/app/utils/questionUtils";
import { Question } from "@/types/question";

export function FolderQuestions() {
  const { id: subjectId, folderId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const folderName = searchParams.get("name") ?? "Folder";

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

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  if (isLoading) return <FolderQuestionsSkeleton />;

  if (error) {
    return <FolderQuestionsError error={error} onRetry={fetchQuestions} />;
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-5">
        <h2 className="mt-2 font-display text-[34px] leading-tight text-ink">
          {folderName}
        </h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          {visibleQuestions.length} of {questions.length}{" "}
          {questions.length === 1 ? "question" : "questions"}
          {searchQuery && (
            <span className="ml-2 text-ink-faint">
              matching "{searchQuery}"
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <div className="mt-4 px-4">
        <div className="flex items-center gap-2 rounded-xl border border-rule bg-paper-card px-3 py-2 focus-within:border-brand transition-colors">
          <Search
            className="size-4 text-ink-faint shrink-0"
            strokeWidth={1.75}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-faint min-w-0"
          />
          {searchQuery && (
            <X
              className="size-4 cursor-pointer text-ink-faint hover:text-ink shrink-0"
              strokeWidth={1.75}
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2 px-4">
        <button
          onClick={() => setFilter("All")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
            filter === "All"
              ? "bg-onyx text-paper border-onyx"
              : "border-rule text-ink hover:bg-tag/50"
          }`}
        >
          All
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

      {/* Questions List or Empty State */}
      {visibleQuestions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
          <p className="text-[16px] text-ink-soft text-center">
            {questions.length === 0
              ? "No questions yet. Add your first question!"
              : searchQuery
                ? `No questions match "${searchQuery}"`
                : "No questions match this filter."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 px-4 pb-28">
          {visibleQuestions.map((q, i) => {
            const label = difficultyLabels[q.difficulty];
            const s = difficultyStyles[label];
            const highlightedText = hasActiveSearch
              ? highlightText(q.text, searchQuery)
              : q.text;
            const matchType = getQuestionMatchType(q, searchQuery);

            return (
              <li
                key={q.id}
                onClick={() =>
                  router.push(
                    `/subject/${subjectId}/folder/${folderId}/question/${q.id}`,
                  )
                }
                className="flex gap-4 rounded-xl px-2 py-4 cursor-pointer hover:bg-tag/40 transition-colors"
              >
                <span className="pt-0.5 font-mono text-[13px] text-ink-faint shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-relaxed text-ink line-clamp-2">
                    {highlightedText}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ${s.pill} ${s.text}`}
                    >
                      <span className={`size-[5px] rounded-full ${s.dot}`} />
                      {label}
                    </span>
                    {q.note && (
                      <>
                        <span className="h-[3px] w-[3px] rounded-full bg-ink-faint/50"></span>
                        <span className="text-[12px] text-ink-faint">
                          Has notes
                        </span>
                      </>
                    )}
                    {matchType && (
                      <>
                        <span className="h-[3px] w-[3px] rounded-full bg-ink-faint/50"></span>
                        <span className="text-[12px] text-ink-faint">
                          Match in {matchType}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add Question Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full bg-onyx px-6 py-3.5 text-[16px] font-medium text-paper shadow-lg shadow-onyx/20 transition-transform active:scale-95"
      >
        <Plus className="size-5" strokeWidth={2} />
        Add question
      </button>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuestionModal
          folderId={folderId as string}
          folderName={folderName}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleQuestionCreated}
        />
      )}
      <Notification message={notification} />
    </>
  );
}
