import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Exam } from "@/types/exam";

interface RenameExamModalProps {
  exam: Exam;
  onClose: () => void;
  onUpdated: (exam: Exam) => void;
}

export function RenameExamModal({
  exam,
  onClose,
  onUpdated,
}: RenameExamModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(exam.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${exam.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name: name.trim() }),
        },
      );

      if (!res.ok) throw new Error("Failed to rename exam");
      const updated: Exam = await res.json();
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename exam");
    } finally {
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
      <div className="w-full max-w-sm rounded-t-3xl md:rounded-3xl border border-rule bg-paper p-6 shadow-xl animate-[slideUp_0.25s_ease-out] md:animate-in md:fade-in md:zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-rule/60">
          <h3 className="font-display text-[18px] font-normal text-ink">Rename Exam</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-faint hover:text-ink transition-colors"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <p className="text-[13px] text-hard bg-hard-soft/30 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
              Exam Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-rule bg-paper-card px-3 py-2 text-[14px] text-ink outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-rule text-[13px] text-ink hover:bg-tag/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-onyx px-4 py-2 text-[13px] font-medium text-paper hover:bg-onyx/90 active:scale-95 disabled:opacity-40 transition-all"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
