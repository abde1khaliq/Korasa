"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import type { Subject } from "@/components/HomeSubjects/HomeSubjects";
import type { Difficulty } from "@/components/misc/Screen";

interface FolderOption {
  id: number;
  name: string;
}

const MAX_LEN = 2000;
const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

export function QuickCreateModal({
  subjects,
  accessToken,
  onClose,
  onFolderCreated,
  onQuestionCreated,
}: {
  subjects: Subject[];
  accessToken?: string;
  onClose: () => void;
  onFolderCreated: (subjectId: number) => void;
  onQuestionCreated: (subjectId: number) => void;
}) {
  const [tab, setTab] = useState<"folder" | "question">("folder");
  const [subjectId, setSubjectId] = useState<number | "">(
    subjects[0]?.id ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Folder tab
  const [folderName, setFolderName] = useState("");

  // Question tab
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folderId, setFolderId] = useState<number | "new" | "">("");
  const [newFolderName, setNewFolderName] = useState("");
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (tab !== "question" || !subjectId) {
      setFolders([]);
      setFolderId("");
      return;
    }
    let cancelled = false;
    setLoadingFolders(true);
    setFolderId("");
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectId}/folders`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load folders");
        return res.json();
      })
      .then((data: FolderOption[]) => {
        if (!cancelled) setFolders(data);
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
  }, [tab, subjectId, accessToken]);

  const resetQuestionFields = () => {
    setText("");
    setAnswer("");
    setDifficulty("Medium");
    setNote("");
    setFolderId("");
    setNewFolderName("");
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed || !subjectId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectId}/folders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: trimmed }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || `Failed to create folder (${res.status})`,
        );
      }
      onFolderCreated(Number(subjectId));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const trimmedText = text.trim();
  const trimmedAnswer = answer.trim();
  const questionValid =
    !!subjectId &&
    (folderId === "new" ? newFolderName.trim().length > 0 : !!folderId) &&
    trimmedText.length > 0 &&
    trimmedText.length <= MAX_LEN &&
    trimmedAnswer.length > 0 &&
    trimmedAnswer.length <= MAX_LEN &&
    note.length <= MAX_LEN;

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      let targetFolderId: number | "new" | "" = folderId;

      if (folderId === "new") {
        const folderRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectId}/folders`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ name: newFolderName.trim() }),
          },
        );
        if (!folderRes.ok) {
          const data = await folderRes.json().catch(() => ({}));
          throw new Error(
            data.error || `Failed to create folder (${folderRes.status})`,
          );
        }
        const createdFolder = await folderRes.json();
        targetFolderId = createdFolder.id;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${targetFolderId}/questions`,
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

      onQuestionCreated(Number(subjectId));
      resetQuestionFields();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
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
      <div className="flex max-h-[90vh] w-full max-w-[440px] flex-col animate-[slideUp_0.25s_ease-out] rounded-t-3xl bg-paper sm:rounded-3xl">
        <header className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-rule">
          <X
            className="size-6 cursor-pointer text-ink-soft hover:text-ink transition-colors"
            strokeWidth={1.75}
            onClick={onClose}
          />
          <h1 className="text-[17px]">Quick add</h1>
          <div className="size-6" />
        </header>

        <div className="flex shrink-0 gap-2 px-6 pt-4">
          <button
            onClick={() => {
              setTab("folder");
              setError(null);
            }}
            className={`flex-1 rounded-full border py-2 text-[14px] font-medium transition-colors ${
              tab === "folder"
                ? "bg-onyx text-paper border-onyx"
                : "border-rule text-ink-soft"
            }`}
          >
            Folder
          </button>
          <button
            onClick={() => {
              setTab("question");
              setError(null);
            }}
            className={`flex-1 rounded-full border py-2 text-[14px] font-medium transition-colors ${
              tab === "question"
                ? "bg-onyx text-paper border-onyx"
                : "border-rule text-ink-soft"
            }`}
          >
            Question
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {subjects.length === 0 ? (
            <p className="text-[15px] text-ink-soft">
              Create a subject first before adding folders or questions.
            </p>
          ) : tab === "folder" ? (
            <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink outline-none focus:border-brand transition-colors"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Folder name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Chapter 1, Vocabulary…"
                  className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
                />
              </div>

              {error && <p className="text-[14px] text-hard">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting || !folderName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-onyx py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-onyx/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Plus className="size-4" strokeWidth={1.75} />
                )}
                {isSubmitting ? "Creating…" : "Create folder"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink outline-none focus:border-brand transition-colors"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Folder
                </label>
                {loadingFolders ? (
                  <div className="mt-2 flex items-center gap-2 text-[14px] text-ink-soft">
                    <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                    Loading folders…
                  </div>
                ) : (
                  <select
                    value={folderId}
                    onChange={(e) =>
                      setFolderId(
                        e.target.value === "new"
                          ? "new"
                          : Number(e.target.value),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink outline-none focus:border-brand transition-colors"
                  >
                    <option value="" disabled>
                      Select a folder…
                    </option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                    <option value="new">+ New folder…</option>
                  </select>
                )}
                {folderId === "new" && (
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New folder name"
                    className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Question
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type the question…"
                  maxLength={MAX_LEN}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type the answer…"
                  maxLength={MAX_LEN}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {levels.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setDifficulty(l)}
                      className={`rounded-xl border py-2.5 text-[14px] font-medium transition-colors ${
                        difficulty === l
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-rule bg-paper-card text-ink-soft hover:bg-tag"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
                  Notes (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add extra context or hints…"
                  maxLength={MAX_LEN}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
                />
              </div>

              {error && <p className="text-[14px] text-hard">{error}</p>}

              <button
                type="submit"
                disabled={!questionValid || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-onyx py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-onyx/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Plus className="size-4" strokeWidth={1.75} />
                )}
                {isSubmitting ? "Creating…" : "Create question"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}