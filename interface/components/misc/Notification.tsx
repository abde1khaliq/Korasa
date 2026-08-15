import { Check } from "lucide-react";
import { useEffect, useState } from "react";

export const Notification = ({ message }: { message: string | null }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => {
        setDisplayMessage(null);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [message]);

  if (!displayMessage) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-40 flex w-[calc(100%-3rem)] max-w-[360px] -translate-x-1/2 items-center gap-3 rounded-full bg-onyx px-5 py-3.5 text-[15px] text-paper shadow-sm transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
      }`}
    >
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-paper/20">
        <Check className="size-3.5" strokeWidth={2.5} />
      </div>
      <span className="truncate">{displayMessage}</span>
    </div>
  );
};