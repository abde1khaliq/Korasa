import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Check,
  ChevronDown,
  Layers,
  Clock,
  HelpCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useEligibleCount } from "@/app/hooks/useEligibleCount";
import { Difficulty, difficultyStyles } from "@/components/misc/Screen";
import { examTypeLabels, examTypeDescriptions } from "@/app/utils/examUtils";
import { Exam, ExamType } from "@/types/exam";

interface FolderOption {
  id: number;
  name: string;
  question_count?: number;
}

const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

const examTypes: ExamType[] = ["practice", "timed", "full"];
const allDifficulties: Difficulty[] = ["Easy", "Medium", "Hard"];

interface CreateExamModalProps {
  onClose: () => void;
  onCreated: (exam: Exam) => void;
}

export function CreateExamModal({ onClose, onCreated }: CreateExamModalProps) {
  const { data: session } = useSession();
  const { subjects, isLoading: subjectsLoading } = useSubjects();

  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [scopeMode, setScopeMode] = useState<"subject" | "folder">("subject");
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderId, setFolderId] = useState<number | "">("");
  const [type, setType] = useState<ExamType>("practice");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([
    "Easy",
    "Medium",
    "Hard",
  ]);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("15");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected subject once loaded
  useEffect(() => {
    if (!subjectId && subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  // Fetch folders dynamically when scope mode is folder or subject changes
  useEffect(() => {
    setFolderId("");
    if (scopeMode !== "folder" || !subjectId || !session?.accessToken) {
      setFolders([]);
      return;
    }

    let cancelled = false;
    setLoadingFolders(true);

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectId}/folders`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data: FolderOption[]) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setFolders(list);
          if (list.length > 0) {
            setFolderId(list[0].id);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setFolders([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFolders(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scopeMode, subjectId, session?.accessToken]);

  const apiScopeId =
    scopeMode === "subject" ? (subjectId || null) : (folderId || null);

  const { count: eligibleCount, isLoading: countLoading } = useEligibleCount(
    apiScopeId ? scopeMode : null,
    apiScopeId,
    difficulties,
  );

  useEffect(() => {
    if (
      eligibleCount !== null &&
      eligibleCount > 0 &&
      questionCount > eligibleCount
    ) {
      setQuestionCount(eligibleCount);
    }
  }, [eligibleCount, questionCount]);

  const toggleDifficulty = (d: Difficulty) => {
    setDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const scopeReady = scopeMode === "subject" ? !!subjectId : !!folderId;
  const trimmedName = name.trim();
  const timeValid = type !== "timed" || Number(timeLimitMinutes) >= 1;
  const countValid =
    type === "full" ||
    (questionCount >= 1 &&
      eligibleCount !== null &&
      questionCount <= eligibleCount);

  const isValid =
    trimmedName.length > 0 &&
    scopeReady &&
    difficulties.length > 0 &&
    eligibleCount !== null &&
    eligibleCount > 0 &&
    countValid &&
    timeValid &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !session?.accessToken) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        name: trimmedName,
        type,
        scope_type: scopeMode,
        scope_id: scopeMode === "subject" ? subjectId : folderId,
        difficulties: difficulties.map((d) => difficultyToApi[d]),
      };
      if (type !== "full") body.question_count = questionCount;
      if (type === "timed") body.time_limit_minutes = Number(timeLimitMinutes);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to create exam (${res.status})`);
      }

      const created: Exam = await res.json();
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-onyx/40 backdrop-blur-sm p-0 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[500px] md:max-w-xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.25s_ease-out] md:animate-in md:fade-in md:zoom-in-95 rounded-t-3xl md:rounded-3xl bg-paper px-6 pb-8 pt-5 md:p-7 md:border md:border-rule md:shadow-xl my-0 md:my-8">
        <div className="flex items-start justify-between pb-4 border-b border-rule/60">
          <div>
            <h2 className="font-display text-[20px] md:text-[22px] font-normal text-ink">
              New Exam
            </h2>
            <p className="text-[12px] text-ink-soft hidden md:block">
              Set quiz scope, question pool, time limit, and difficulty filter.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-tag/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        {subjects.length === 0 && !subjectsLoading ? (
          <div className="py-12 text-center">
            <p className="text-[15px] text-ink-soft">
              You need at least one subject with flashcard questions before creating an exam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="rounded-xl bg-hard-soft/40 border border-hard/30 p-3 text-[13px] text-hard">
                {error}
              </div>
            )}

            {/* Exam Name */}
            <div>
              <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
                Exam Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midterm Flashcard Review"
                required
                className="w-full rounded-xl border border-rule bg-paper-card px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-brand transition-colors"
              />
            </div>

            {/* Scope Level (Entire Subject vs Single Folder) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
                  Scope Level
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-rule bg-paper-card">
                  <button
                    type="button"
                    onClick={() => setScopeMode("subject")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      scopeMode === "subject"
                        ? "bg-onyx text-paper font-semibold"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeMode("folder")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      scopeMode === "folder"
                        ? "bg-onyx text-paper font-semibold"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    Folder
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSubjectId(id);
                  }}
                  className="w-full rounded-xl border border-rule bg-paper-card px-3 py-2.5 text-[14px] text-ink outline-none focus:border-brand"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Folder Dropdown if Scope is Folder */}
            {scopeMode === "folder" && (
              <div>
                <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
                  Folder Target
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(Number(e.target.value))}
                  disabled={loadingFolders}
                  className="w-full rounded-xl border border-rule bg-paper-card px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-brand"
                >
                  {loadingFolders ? (
                    <option value="">Loading folders...</option>
                  ) : folders.length === 0 ? (
                    <option value="">No folders available in this subject</option>
                  ) : (
                    folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Exam Type Selector */}
            <div>
              <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1.5">
                Exam Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {examTypes.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                      type === t
                        ? "bg-onyx text-paper font-semibold shadow-xs"
                        : "bg-paper-card border border-rule text-ink-soft hover:bg-tag/50"
                    }`}
                  >
                    <p className="text-[13px] capitalize">{examTypeLabels[t]}</p>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-ink-soft italic">
                {examTypeDescriptions[type]}
              </p>
            </div>

            {/* Difficulties Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
                  Difficulties
                </label>
                {/* Live Eligible Count Pill */}
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  {countLoading ? (
                    <span className="flex items-center gap-1 text-ink-faint">
                      <Loader2 className="size-3 animate-spin" />
                      <span>Checking pool...</span>
                    </span>
                  ) : eligibleCount !== null ? (
                    <span
                      className={`font-semibold ${
                        eligibleCount > 0 ? "text-brand" : "text-hard"
                      }`}
                    >
                      {eligibleCount}{" "}
                      {eligibleCount === 1 ? "question" : "questions"} eligible
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {allDifficulties.map((d) => {
                  const active = difficulties.includes(d);
                  const s = difficultyStyles[d];
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDifficulty(d)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
                        active
                          ? `${s.pill} ${s.text} border-current font-semibold`
                          : "border-rule bg-paper-card text-ink hover:bg-tag/40"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${s.dot}`} />
                      <span>{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count & Time Limit */}
            <div className="grid grid-cols-2 gap-3">
              {type !== "full" && (
                <div>
                  <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
                    Question Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={eligibleCount && eligibleCount > 0 ? eligibleCount : 100}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-rule bg-paper-card px-3 py-2 text-[14px] text-ink outline-none focus:border-brand"
                  />
                  {eligibleCount !== null && eligibleCount > 0 && (
                    <span className="text-[11px] text-ink-faint mt-1 block font-mono">
                      Max: {eligibleCount} Qs
                    </span>
                  )}
                </div>
              )}

              {type === "timed" && (
                <div>
                  <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-full rounded-xl border border-rule bg-paper-card px-3 py-2 text-[14px] text-ink outline-none focus:border-brand"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-rule/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-rule text-[14px] text-ink hover:bg-tag/40 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                <span>Create Exam</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

