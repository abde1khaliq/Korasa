"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-onyx/40 backdrop-blur-sm p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-3xl border border-rule bg-paper p-6 shadow-xl animate-in fade-in zoom-in-95">
        <h3 className="text-[18px] font-semibold text-ink">
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          {message}
        </p>

        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 items-center justify-center rounded-xl border border-rule py-3 text-[15px] font-medium text-ink hover:bg-tag/40 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 items-center justify-center rounded-xl py-3 text-[15px] font-medium text-white transition-all active:scale-95 cursor-pointer shadow-xs ${
              destructive
                ? "bg-hard hover:bg-hard/90"
                : "bg-onyx hover:bg-onyx/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
