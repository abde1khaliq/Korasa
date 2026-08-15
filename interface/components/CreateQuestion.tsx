"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Screen,
  difficultyStyles,
  type Difficulty,
} from "@/components/misc/Screen";

const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

const MAX_LEN = 2000;

export function CreateQuestion() {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const { id: subjectId, folderId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const folderName = searchParams.get("name") ?? "Folder";

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
            Authorization: `Bearer ${session?.accessToken}`,
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

      router.push(
        `/subject/${subjectId}/folder/${folderId}?name=${encodeURIComponent(folderName)}&created=1`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5">
        <X
          className="size-6 cursor-pointer"
          strokeWidth={1.75}
          onClick={() => router.back()}
        />
        <h1 className="text-[17px] font-semibold">New question</h1>
        <button
          onClick={handleSave}
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2 rounded-full bg-onyx px-5 py-2.5 text-[14px] text-paper disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting && (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          )}
          {isSubmitting ? "Saving…" : "Save"}
        </button>
      </header>

      <div className="px-4 pt-5 pb-12">
        <p className="font-mono text-[13px] text-ink-soft">
          <span className="text-brand">{folderName}</span>
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-hard-soft px-4 py-3 text-[14px] text-hard">
            {error}
          </p>
        )}

        <p className="mt-5 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Question
          <span className="normal-case tracking-normal text-ink-faint">
            {text.length}/{MAX_LEN}
          </span>
        </p>
        <div className="mt-2 min-h-[90px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type the question…"
            maxLength={MAX_LEN}
            rows={3}
            className="w-full resize-none bg-transparent font-display text-[19px] leading-snug outline-none placeholder:text-ink-faint"
          />
        </div>

        <p className="mt-5 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Answer
          <span className="normal-case tracking-normal text-ink-faint">
            {answer.length}/{MAX_LEN}
          </span>
        </p>
        <div className="mt-2 min-h-[100px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the answer…"
            maxLength={MAX_LEN}
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-ink-faint"
          />
        </div>

        <p className="mt-5 font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
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
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-4 text-[14px] transition-colors ${
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

        <p className="mt-5 flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase">
          Notes
          <span className="normal-case tracking-normal text-ink-faint">
            {note.length}/{MAX_LEN}
          </span>
        </p>
        <div className="mt-2 min-h-[80px] rounded-2xl border border-rule bg-paper-card p-4 focus-within:border-brand">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional context, mnemonics, or exam tips…"
            maxLength={MAX_LEN}
            rows={2}
            className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-ink-faint"
          />
        </div>
      </div>
    </Screen>
  );
}
