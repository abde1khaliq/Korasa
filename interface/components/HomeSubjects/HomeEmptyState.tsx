import { LayoutGrid, LogOut, Plus, Search } from "lucide-react";
import { Screen } from "@/components/misc/Screen";
import { EmptyIllustration } from "@/components/HomeSubjects/EmptyIllustration";
import { signOut } from "next-auth/react";

export const HomeEmptyState = ({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) => {
  return (
    <Screen>
      <header className="flex items-center justify-between px-6 pt-6">
        <span className="font-display text-2xl leading-none">K</span>
        <div className="flex items-center gap-5 text-ink">
          <LogOut
            className="w-6 h-6 cursor-pointer text-red-500"
            strokeWidth={1.75}
            onClick={() => signOut()}
          />
        </div>
      </header>

      <div className="px-6 pt-8">
        <h1 className="font-display text-[56px] leading-[1.05]">Subjects</h1>
        <p className="mt-3 text-[17px] text-ink-soft">
          A quiet place for the questions worth remembering.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <EmptyIllustration />

        <h2 className="mt-10 font-display text-[32px] leading-tight">
          Begin with a subject
        </h2>
        <p className="mt-3 max-w-[19rem] text-center text-[17px] leading-relaxed text-ink-soft">
          English, Chemistry, or anything you're learning.
        </p>

        <button
          onClick={onCreateClick}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper hover:bg-onyx/90 transition-colors"
        >
          <Plus className="size-5" strokeWidth={1.75} />
          Create your first subject
        </button>
      </div>
    </Screen>
  );
};
