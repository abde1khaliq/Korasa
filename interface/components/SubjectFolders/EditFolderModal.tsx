import { useEffect, useState } from "react";
import { X, Loader2, Pencil } from "lucide-react";
import { FolderItem } from "@/types/folder";
import { useSession } from "next-auth/react";

interface EditFolderModalProps {
  subjectID: string;
  folder: FolderItem;
  onClose: () => void;
  onUpdated: (folder: FolderItem) => void;
}

export function EditFolderModal({
  subjectID,
  folder,
  onClose,
  onUpdated,
}: EditFolderModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(folder.name);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}/folders/${folder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name: name.trim() }),
        },
      );

      if (!res.ok) throw new Error("Failed to update folder");
      const updated: FolderItem = await res.json();
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update folder");
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
      <div className="w-full max-w-[420px] md:max-w-md rounded-t-3xl md:rounded-3xl border border-rule bg-paper p-6 md:p-7 shadow-xl animate-[slideUp_0.25s_ease-out] md:animate-in md:fade-in md:zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-rule/60">
          <div className="flex items-center gap-2">
            <Pencil className="size-4 text-brand" />
            <h3 className="font-display text-[19px] font-normal text-ink">
              Rename Folder
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-tag/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && <p className="text-[13px] text-hard">{error}</p>}

          <div>
            <label className="block font-mono text-[11px] tracking-widest text-ink-faint uppercase mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-rule bg-paper-card px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-rule text-[13px] text-ink hover:bg-tag/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 rounded-xl bg-onyx px-5 py-2 text-[13px] font-medium text-paper hover:bg-onyx/90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
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
