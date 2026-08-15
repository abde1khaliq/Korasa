import { Difficulty, difficultyStyles } from "@/components/misc/Screen";

export const FilterChip = ({
  level,
  n,
  active,
  onClick,
}: {
  level: Difficulty;
  n: number;
  active: boolean;
  onClick: () => void;
}) => {
  const s = difficultyStyles[level];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
        active ? `border-current ${s.text}` : "border-rule"
      }`}
    >
      <span className={s.text}>{level}</span>
      <span className="text-ink-soft">{n}</span>
    </button>
  );
};
