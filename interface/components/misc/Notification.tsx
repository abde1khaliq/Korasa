import { Check } from "lucide-react";

export const Notification = ({ message }: { message: string | null }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 animate-[slideUp_0.25s_ease-out] items-center gap-3 rounded-full bg-onyx px-5 py-3.5 text-[15px] text-paper shadow-sm">
      <div className="flex size-5 items-center justify-center rounded-full bg-paper/20">
        <Check className="size-3.5" strokeWidth={2.5} />
      </div>
      {message}
    </div>
  );
}