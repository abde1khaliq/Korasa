import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Subject } from "@/types/subject";

export const CreateSubjectModal = ({
  accessToken,
  onClose,
  onCreated,
}: {
  accessToken?: string;
  onClose: () => void;
  onCreated: (subject: Subject) => void;
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/`,
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
        throw new Error(`Failed to create subject (${res.status})`);
      }

      const created: Subject = await res.json();
      onCreated(created);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-onyx/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[420px] animate-[slideUp_0.25s_ease-out] rounded-t-3xl bg-paper px-6 pb-8 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] text-ink">New subject</h2>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full hover:bg-tag transition-colors"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="subject-name"
            className="font-mono text-[13px] tracking-[0.12em] text-ink-faint uppercase"
          >
            Subject name
          </label>
          <input
            ref={inputRef}
            id="subject-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. English, Chemistry…"
            className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3.5 text-[16px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
          />

          {error && <p className="mt-3 text-[14px] text-hard">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-onyx py-3.5 text-[16px] font-medium text-paper transition-colors hover:bg-onyx/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Plus className="size-5" strokeWidth={1.75} />
            )}
            {isSubmitting ? "Creating…" : "Create subject"}
          </button>
        </form>
      </div>
    </div>
  );
};
