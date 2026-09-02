import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FolderItem } from "@/types/folder";
import { useSession } from "next-auth/react";

export const CreateFolderModal = ({
  subjectID,
  onClose,
  onCreated,
}: {
  subjectID: string;
  accessToken?: string;
  onClose: () => void;
  onCreated: (folder: FolderItem) => void;
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}/folders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name: trimmed }),
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to create folder (${res.status})`);
      }

      const created: FolderItem = await res.json();
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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-onyx/40 backdrop-blur-sm p-0 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[440px] md:max-w-md animate-[slideUp_0.25s_ease-out] md:animate-in md:fade-in md:zoom-in-95 rounded-t-3xl md:rounded-3xl bg-paper px-6 pb-8 pt-5 md:p-7 md:border md:border-rule md:shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-[22px] md:text-[24px] font-normal text-ink">New Folder</h2>
            <p className="mt-0.5 text-[13px] text-ink-soft hidden md:block">
              Group questions by chapter, topic, or module.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-tag/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="folder-name"
            className="font-mono text-[12px] tracking-widest text-ink-faint uppercase"
          >
            Folder Name
          </label>
          <input
            ref={inputRef}
            id="folder-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chapter 1: Introduction…"
            className="mt-2 w-full rounded-xl border border-rule bg-paper-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors"
          />

          {error && <p className="mt-3 text-[14px] text-hard">{error}</p>}

          <div className="mt-6 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="hidden md:inline-flex px-4 py-2.5 rounded-xl border border-rule text-[14px] text-ink hover:bg-tag/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-onyx px-5 py-3 md:py-2.5 text-[14px] font-medium text-paper transition-all hover:bg-onyx/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : (
                <Plus className="size-4" strokeWidth={2.2} />
              )}
              <span>{isSubmitting ? "Creating…" : "Create Folder"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
