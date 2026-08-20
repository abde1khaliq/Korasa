"use client";

import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Folder,
  X,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Screen,
  difficultyStyles,
  type Difficulty,
} from "@/components/misc/Screen";
import { Notification } from "@/components/misc/Notification";
import { FolderQuestionsSkeleton } from "@/components/FolderQuestions/FolderQuestionsSkeleton";
import { FilterChip } from "./FilterChip";
import { Camera } from "lucide-react";
import { QuestionOCRCapture } from "./QuestionOCRCapture";

interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  note: string;
  folder_id: number;
}

const difficultyLabels: Record<Question["difficulty"], Difficulty> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

const MAX_LEN = 2000;

// Helper function to highlight text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200/60 text-ink px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function FolderQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Difficulty | "All">("All");
  const [notification, setNotification] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();
  const { id: subjectId, folderId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const folderName = searchParams.get("name") ?? "Folder";

  const showNotification = (message: string) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${folderId}/questions`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );

      if (!res.ok) {
        throw new Error(`Failed to load questions (${res.status})`);
      }

      const data: Question[] = await res.json();
      setQuestions(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Failed to fetch questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && folderId) {
      fetchQuestions();
    }
  }, [session, folderId]);

  useEffect(() => {
    // Focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleQuestionCreated = (newQuestion: Question) => {
    setQuestions((prev) => [...prev, newQuestion]);
    showNotification("Question added");
  };

  const counts = {
    Easy: questions.filter((q) => q.difficulty === "easy").length,
    Medium: questions.filter((q) => q.difficulty === "medium").length,
    Hard: questions.filter((q) => q.difficulty === "hard").length,
  };

  // Filter questions by difficulty and search query
  const filteredByDifficulty =
    filter === "All"
      ? questions
      : questions.filter((q) => difficultyLabels[q.difficulty] === filter);

  const searchLower = searchQuery.toLowerCase().trim();
  const visibleQuestions = searchLower
    ? filteredByDifficulty.filter(
        (q) =>
          q.text.toLowerCase().includes(searchLower) ||
          q.answer.toLowerCase().includes(searchLower) ||
          q.note.toLowerCase().includes(searchLower)
      )
    : filteredByDifficulty;

  if (isLoading) return <FolderQuestionsSkeleton />;

  if (error) {
    return (
      <Screen className="relative">
        <header className="flex items-center justify-between px-4 pt-5">
          <ChevronLeft
            className="size-6 cursor-pointer"
            strokeWidth={1.75}
            onClick={() => router.back()}
          />
          <h1 className="text-[17px] font-semibold">{folderName}</h1>
          <div className="flex items-center gap-3">
            <Search className="size-5" strokeWidth={1.75} />
            <SlidersHorizontal className="size-5" strokeWidth={1.75} />
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-hard-soft">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="mt-6 font-display text-[24px] leading-tight text-center">
            Couldn&apos;t load questions
          </h2>
          <p className="mt-3 max-w-[19rem] text-center text-[16px] leading-relaxed text-ink-soft">
            {error}
          </p>
          <button
            onClick={fetchQuestions}
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
        <header className="flex items-center justify-between px-4 pt-5">
          <ChevronLeft
            className="size-6 cursor-pointer shrink-0"
            strokeWidth={1.75}
            onClick={() => router.back()}
          />
          <h1 className="text-[17px] font-semibold truncate px-2">{folderName}</h1>
          <div className="flex items-center gap-3 shrink-0">
            <RotateCcw 
              className="size-5 cursor-pointer text-ink-soft hover:text-ink transition-colors" 
              strokeWidth={1.75}
              onClick={fetchQuestions}
            />
          </div>
        </header>

        <div className="px-4 pt-5">
          <h2 className="mt-2 font-display text-[34px] leading-tight">
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

        {/* Search Bar - Always Visible */}
        <div className="mt-4 px-4">
          <div className="flex items-center gap-2 rounded-xl border border-rule bg-paper-card px-3 py-2 focus-within:border-brand transition-colors">
            <Search className="size-4 text-ink-faint shrink-0" strokeWidth={1.75} />
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
          {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
            <FilterChip
              key={level}
              level={level}
              n={counts[level]}
              active={filter === level}
              onClick={() => setFilter(level)}
            />
          ))}
        </div>

        {/* Questions List */}
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
              const highlightedText = searchQuery.trim() 
                ? highlightText(q.text, searchQuery)
                : q.text;
              
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
                      {searchQuery.trim() && 
                        (q.answer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         q.note.toLowerCase().includes(searchQuery.toLowerCase())) && (
                        <>
                          <span className="h-[3px] w-[3px] rounded-full bg-ink-faint/50"></span>
                          <span className="text-[12px] text-ink-faint">
                            Match in {q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ? 'answer' : 'notes'}
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

        {/* Create Question Modal */}
        {showCreateModal && (
          <CreateQuestionModal
            folderId={folderId as string}
            folderName={folderName}
            accessToken={session?.accessToken}
            onClose={() => setShowCreateModal(false)}
            onCreated={handleQuestionCreated}
          />
        )}
      </Screen>

      <Notification message={notification} />
    </>
  );
}

function CreateQuestionModal({
  folderId,
  folderName,
  accessToken,
  onClose,
  onCreated,
}: {
  folderId: string;
  folderName: string;
  accessToken?: string;
  onClose: () => void;
  onCreated: (q: Question) => void;
}) {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOCR, setShowOCR] = useState(false);

  const handleOCRText = (recognized: string) => {
    if (text.trim().length > 0) {
      const confirmed = window.confirm(
        "This will replace what you've already typed in the question field. Continue?",
      );
      if (!confirmed) {
        setShowOCR(false);
        return;
      }
    }
    setText(recognized);
    setShowOCR(false);
  };

  const trimmedText = text.trim();
  const trimmedAnswer = answer.trim();
  const isValid =
    trimmedText.length > 0 &&
    trimmedText.length <= MAX_LEN &&
    trimmedAnswer.length > 0 &&
    trimmedAnswer.length <= MAX_LEN &&
    note.length <= MAX_LEN;

  const handleSave = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${folderId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            text: trimmedText,
            answer: trimmedAnswer,
            difficulty: difficultyToApi[difficulty],
            note: note.trim(),
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || `Failed to create question (${res.status})`,
        );
      }

      const createdQuestion = await res.json();
      onCreated(createdQuestion);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-onyx/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-[420px] flex-col max-h-[90vh] animate-[slideUp_0.25s_ease-out] rounded-t-3xl bg-paper sm:rounded-3xl">
        {/* Modal Header */}
        <header className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-rule">
          <X
            className="size-6 cursor-pointer text-ink-soft hover:text-ink transition-colors"
            strokeWidth={1.75}
            onClick={onClose}
          />
          <h1 className="text-[17px] font-semibold">New question</h1>
          <button
            onClick={handleSave}
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-2 rounded-full bg-onyx px-5 py-2 text-[14px] font-medium text-paper disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            )}
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </header>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto px-6 py-6 pb-12">
          {error && (
            <p className="mt-4 rounded-xl bg-hard-soft px-4 py-3 text-[14px] text-hard">
              {error}
            </p>
          )}
          <p className="mt-6 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Question
            <span className="flex items-center gap-3 normal-case tracking-normal text-ink-faint">
              <Camera
                className="size-4 cursor-pointer text-ink-soft hover:text-ink transition-colors"
                strokeWidth={1.75}
                onClick={() => setShowOCR(true)}
              />
              {text.length}/{MAX_LEN}
            </span>
          </p>
          <div className="mt-2 min-h-[90px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand transition-colors">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type the question…"
              maxLength={MAX_LEN}
              rows={3}
              className="w-full resize-none bg-transparent font-display text-[19px] leading-snug outline-none placeholder:text-ink-faint"
            />
          </div>

          <p className="mt-6 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Answer
            <span className="normal-case tracking-normal text-ink-faint">
              {answer.length}/{MAX_LEN}
            </span>
          </p>
          <div className="mt-2 min-h-[100px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand transition-colors">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type the answer…"
              maxLength={MAX_LEN}
              rows={3}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-ink-faint"
            />
          </div>

          <p className="mt-6 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Difficulty
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {levels.map((l) => {
              const s = difficultyStyles[l];
              const on = l === difficulty;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setDifficulty(l)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-[14px] transition-colors ${
                    on
                      ? `${s.pill} ${s.text} border-current`
                      : "border-rule bg-paper-card text-ink"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>

          <p className="mt-6 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
            Notes
            <span className="normal-case tracking-normal text-ink-faint">
              {note.length}/{MAX_LEN}
            </span>
          </p>
          <div className="mt-2 min-h-[80px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand transition-colors">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional context, mnemonics, or exam tips…"
              maxLength={MAX_LEN}
              rows={2}
              className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-ink-faint"
            />
          </div>
          {showOCR && (
            <QuestionOCRCapture
              onClose={() => setShowOCR(false)}
              onTextRecognized={handleOCRText}
            />
          )}
        </div>
      </div>
    </div>
  );
}