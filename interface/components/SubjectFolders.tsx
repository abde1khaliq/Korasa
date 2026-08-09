import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  Folder,
  ArrowDownUp,
  Plus,
} from "lucide-react";
import { Screen } from "./Screen";

const folders: { name: string; qs: number; e: number; m: number; h: number }[] = [
  { name: "Pure Math", qs: 5, e: 2, m: 2, h: 1 },
  { name: "Applied Math", qs: 5, e: 1, m: 1, h: 3 },
];

export function SubjectFolders() {
  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-6 pt-6">
        <ChevronLeft className="size-7" strokeWidth={1.75} />
        <h1 className="text-[20px] font-semibold">Mathematics</h1>
        <div className="flex items-center gap-4">
          <Search className="size-6" strokeWidth={1.75} />
          <MoreHorizontal className="size-6" strokeWidth={1.75} />
        </div>
      </header>

      <section className="mx-6 mt-6 rounded-2xl border border-rule bg-paper-card p-6">
        <h2 className="mt-4 font-display text-[42px] leading-none">
          Mathematics
        </h2>
        <div className="mt-6 grid grid-cols-3 font-mono text-[15px] text-ink-soft">
          <Stat value="2" label="folders" />
          <Stat value="10" label="questions" />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between px-6">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Folders
        </p>
        <button className="flex items-center gap-2 text-[16px] text-ink">
          <ArrowDownUp className="size-4" strokeWidth={1.75} />
          Recent
        </button>
      </div>

      <ul className="mt-4 px-6 pb-28">
        {folders.map((f) => (
          <li
            key={f.name}
            className="flex items-center gap-4 border-b border-rule py-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tag">
              <Folder className="size-6 text-brand" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[19px]">{f.name}</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-[14px] text-ink-soft">
                <span>{f.qs} questions</span>
                <span className="text-ink-faint">·</span>
                <Count color="bg-easy" n={f.e} />
                <Count color="bg-medium" n={f.m} />
                <Count color="bg-hard" n={f.h} />
              </p>
            </div>
            <ChevronRight
              className="size-5 text-ink-faint"
              strokeWidth={1.75}
            />
          </li>
        ))}
      </ul>

      <button className="fixed bottom-8 left-1/2 ml-[130px] flex size-12 -translate-x-1/5 items-center justify-center rounded-2xl bg-onyx text-paper">
        <Plus className="size-7" strokeWidth={1.75} />
      </button>
    </Screen>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-display text-[34px] leading-none ${accent ? "text-brand" : "text-ink"}`}
      >
        {value}
      </p>
      <p className="mt-2">{label}</p>
    </div>
  );
}

function Count({ color, n }: { color: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`size-[7px] rounded-full ${color}`} />
      {n}
    </span>
  );
}
