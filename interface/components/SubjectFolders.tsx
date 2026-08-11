"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  Folder,
  ArrowDownUp,
  Plus,
} from "lucide-react";
import { Screen } from "./Lib/Screen";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Subject } from "./HomeSubjects";
import { useParams } from "next/navigation";

interface Folder {
  id: number;
  name: string;
}

export function SubjectFolders() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const { data: session } = useSession();
  const { id: subjectID } = useParams();

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/${subjectID}`,
          { headers: { Authorization: `Bearer ${session?.accessToken}` } },
        );
        if (res.ok) {
          const subject: Subject = await res.json();
          setSubject(subject);
        }
      } catch (err) {
        console.error("Failed to fetch the subject:", err);
      }
    };

    const fetchFolders = async () => {
      try {
        const res = await fetch(`/api/subjects/${subjectID}/folders`);
        if (res.ok) {
          const data: Folder[] = await res.json();
          setFolders(data);
        }
      } catch (err) {
        console.error("Failed to fetch folders:", err);
      }
    };

    if (session && subjectID) {
      fetchSubject();
      fetchFolders();
    }
  }, [session, subjectID]);

  return (
    <Screen className="relative">
      <header className="flex items-center justify-between px-6 pt-6">
        <ChevronLeft className="size-7" strokeWidth={1.75} />
        <h1 className="text-[20px] font-semibold">{subject?.name}</h1>
        <div className="flex items-center gap-4">
          <Search className="size-6" strokeWidth={1.75} />
          <MoreHorizontal className="size-6" strokeWidth={1.75} />
        </div>
      </header>

      <section className="mx-6 mt-6 rounded-2xl border border-rule bg-paper-card p-6">
        <h2 className="mt-4 font-display text-[42px] leading-none">
          {subject?.name}
        </h2>
        <div className="mt-6 grid grid-cols-3 font-mono text-[15px] text-ink-soft">
          {/* <Stat value="-" label="folders" />
          <Stat value="-" label="questions" /> */}
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
        {folders.map((folder) => (
          <li
            key={folder.name}
            className="flex items-center gap-4 border-b border-rule py-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tag">
              <Folder className="size-6 text-brand" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[19px]">{folder.name}</p>
              {/* <p className="mt-1 flex items-center gap-2 font-mono text-[14px] text-ink-soft">
                <span>{f.qs} questions</span>
                <span className="text-ink-faint">·</span>
                <Count color="bg-easy" n={f.e} />
                <Count color="bg-medium" n={f.m} />
                <Count color="bg-hard" n={f.h} />
              </p> */}
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
