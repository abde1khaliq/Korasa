import type { ReactNode } from "react";

export type Difficulty = "Easy" | "Medium" | "Hard";

export const difficultyStyles: Record<
  Difficulty,
  { dot: string; pill: string; text: string }
> = {
  Easy: { dot: "bg-easy", pill: "bg-easy-soft", text: "text-easy" },
  Medium: { dot: "bg-medium", pill: "bg-medium-soft", text: "text-medium" },
  Hard: { dot: "bg-hard", pill: "bg-hard-soft", text: "text-hard" },
};

export function DifficultyPill({ level }: { level: Difficulty }) {
  const s = difficultyStyles[level];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[15px] ${s.pill} ${s.text}`}
    >
      <span className={`size-[7px] rounded-full ${s.dot}`} />
      {level}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
      {children}
    </p>
  );
}

export function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <p className="font-mono text-[15px] text-ink-soft">
      <span className="text-brand">{parts[0]}</span>
      {parts.slice(1).map((p) => (
        <span key={p}>
          <span className="text-ink-faint"> / </span>
          {p}
        </span>
      ))}
    </p>
  );
}
