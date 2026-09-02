import { useEffect, useRef, useState } from "react";
import { Difficulty, difficultyStyles } from "../misc/Screen";
import { Question } from "@/types/question";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { QuestionCapture } from "./QuestionOCRCapture";
import { useSession } from "next-auth/react";

const levels: Difficulty[] = ["Easy", "Medium", "Hard"];
const difficultyToApi: Record<Difficulty, "easy" | "medium" | "hard"> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

const MAX_LEN = 2000;

// Generates a clean branded card image if no image file is provided
async function generateTextCardBlob(questionText: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background
  ctx.fillStyle = "#FDFBF7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = "#E4DED4";
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Brand header
  ctx.fillStyle = "#A8703F";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("KORASA FLASHCARD", 60, 90);

  // Question text
  ctx.fillStyle = "#2B2724";
  ctx.font = "38px serif";

  const words = (questionText.trim() || "Question").split(" ");
  let line = "";
  let y = 170;
  const maxWidth = 1080;
  const lineHeight = 54;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 60, y);
      line = words[n] + " ";
      y += lineHeight;
      if (y > canvas.height - 80) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 60, y);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas blob creation failed"));
    }, "image/png");
  });
}

export const CreateQuestionModal = ({
  folderId,
  onClose,
  onCreated,
}: {
  folderId: string;
  folderName: string;
  accessToken?: string;
  onClose: () => void;
  onCreated: (q: Question) => void;
}) => {
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOCR, setShowOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    (trimmedText.length > 0 || !!imageFile) &&
    trimmedAnswer.length > 0 &&
    trimmedAnswer.length <= MAX_LEN &&
    note.length <= MAX_LEN;

  const handleSave = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        const textBlob = await generateTextCardBlob(trimmedText);
        formData.append("image", textBlob, "question.png");
      }

      formData.append("text", trimmedText);
      formData.append("answer", trimmedAnswer);
      formData.append("difficulty", difficultyToApi[difficulty]);
      formData.append("note", note.trim());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/folders/${folderId}/questions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: formData,
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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-onyx/40 backdrop-blur-sm p-0 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-[480px] md:max-w-2xl flex-col max-h-[90vh] animate-[slideUp_0.25s_ease-out] md:animate-in md:fade-in md:zoom-in-95 rounded-t-3xl md:rounded-3xl bg-paper md:border md:border-rule md:shadow-xl overflow-hidden">
        {/* Modal Header */}
        <header className="flex shrink-0 items-center justify-between px-6 py-4 md:py-5 border-b border-rule/60">
          <div>
            <h2 className="font-display text-[20px] md:text-[22px] font-normal text-ink">
              New Question
            </h2>
            <p className="text-[12px] text-ink-soft hidden md:block">
              Add a flashcard with image diagram, question prompt, answer key, and notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-tag/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </header>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto px-6 py-6 pb-12 space-y-5">
          {error && (
            <p className="rounded-xl bg-hard-soft px-4 py-3 text-[14px] text-hard">
              {error}
            </p>
          )}

          {/* Image Upload / Attachment Section */}
          <div>
            <div className="flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase mb-2">
              <span>Question Image / Diagram</span>
              <span className="normal-case tracking-normal text-ink-faint text-[11px]">
                JPEG, PNG, WebP (Max 5MB)
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-tag/40 border border-rule flex items-center justify-center group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Selected upload"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 rounded-full bg-onyx/80 text-white hover:bg-hard transition-colors shadow-md cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-2xl border border-dashed border-rule/90 hover:border-brand/70 bg-paper-card/40 hover:bg-tag/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-tag text-ink-faint">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <span className="text-[13px] font-medium text-ink">
                    Click to attach diagram or photo
                  </span>
                  <span className="text-[12px] text-ink-faint block">
                    or leave empty to auto-format text
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div>
            <div className="flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase mb-2">
              <span>Question Text</span>
              <div className="flex items-center gap-3 normal-case tracking-normal text-ink-faint">
                <button
                  type="button"
                  onClick={() => setShowOCR(true)}
                  className="flex items-center gap-1 text-ink-soft hover:text-ink transition-colors cursor-pointer text-xs"
                >
                  <Camera className="size-3.5" />
                  <span>Scan OCR</span>
                </button>
                <span>
                  {text.length}/{MAX_LEN}
                </span>
              </div>
            </div>
            <div className="min-h-[85px] rounded-2xl border border-rule bg-paper-card p-3.5 focus-within:border-brand transition-colors">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type question prompt or topic…"
                maxLength={MAX_LEN}
                rows={3}
                className="text-ink w-full resize-none bg-transparent font-display text-[17px] leading-snug outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>

          {/* Answer Section */}
          <div>
            <div className="flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase mb-2">
              <span>Answer (Required)</span>
              <span className="normal-case tracking-normal text-ink-faint text-xs">
                {answer.length}/{MAX_LEN}
              </span>
            </div>
            <div className="min-h-[95px] rounded-2xl border border-rule bg-paper-card p-3.5 focus-within:border-brand transition-colors">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type the answer key or explanation…"
                maxLength={MAX_LEN}
                rows={3}
                className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>

          {/* Difficulty Chips */}
          <div>
            <p className="font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase mb-2">
              Difficulty
            </p>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l) => {
                const s = difficultyStyles[l];
                const on = l === difficulty;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setDifficulty(l)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
                      on
                        ? `${s.pill} ${s.text} border-current font-semibold`
                        : "border-rule bg-paper-card text-ink hover:bg-tag/40"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${s.dot}`} />
                    <span>{l}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between font-mono text-[12px] tracking-[0.15em] text-ink-faint uppercase mb-2">
              <span>Study Notes (Optional)</span>
              <span className="normal-case tracking-normal text-ink-faint text-xs">
                {note.length}/{MAX_LEN}
              </span>
            </div>
            <div className="min-h-[70px] rounded-2xl border border-rule bg-paper-card p-3.5 focus-within:border-brand transition-colors">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional mnemonics, hints, or formula tips…"
                maxLength={MAX_LEN}
                rows={2}
                className="text-ink w-full resize-none bg-transparent text-[13px] outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>

          {showOCR && (
            <QuestionCapture
              onClose={() => setShowOCR(false)}
              onTextRecognized={handleOCRText}
            />
          )}

          {/* Action Footer */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-rule/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-rule text-[14px] text-ink hover:bg-tag/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid || isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper transition-all hover:bg-onyx/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {isSubmitting && (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              )}
              <span>{isSubmitting ? "Saving…" : "Save Question"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

