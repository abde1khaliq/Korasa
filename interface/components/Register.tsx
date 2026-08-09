import { ArrowRight, Check } from "lucide-react";
import { Screen } from "./Screen";

export function Register() {
  return (
    <Screen>
      <header className="px-6 pt-6">
        <span className="font-display text-2xl leading-none">K</span>
      </header>

      <div className="flex flex-1 flex-col px-6 pt-10 pb-16">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Get started
        </p>
        <h1 className="mt-3 font-display text-[48px] leading-[1.05]">
          Create account
        </h1>
        <p className="mt-3 text-[17px] text-ink-soft">
          Subjects, folders and questions all in one quiet place.
        </p>

        <p className="mt-10 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
          Username
        </p>
        <div className="mt-3 rounded-2xl border border-rule bg-paper-card px-5 py-4">
          <p className="text-[18px] text-ink-faint">Your username</p>
        </div>

        <p className="mt-7 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
          Email
        </p>
        <div className="mt-3 rounded-2xl border border-rule bg-paper-card px-5 py-4">
          <p className="text-[18px] text-ink-faint">you@example.com</p>
        </div>

        <p className="mt-7 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
          Password
        </p>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-brand bg-paper-card px-5 py-4">
          <p className="font-mono text-[20px] tracking-[0.3em] text-ink">••••••••</p>
          <span className="font-mono text-[14px] tracking-[0.14em] text-ink-faint uppercase">
            Show
          </span>
        </div>
        <p className="mt-2 text-[15px] text-ink-faint">At least 8 characters.</p>

        <div className="mt-7 flex items-start gap-3">
          <span className="mt-0.5 flex size-6 items-center justify-center rounded-md bg-onyx">
            <Check className="size-4 text-paper" strokeWidth={2.25} />
          </span>
          <p className="text-[16px] leading-snug text-ink-soft">
            I agree to the <span className="text-brand">Terms</span> and{" "}
            <span className="text-brand">Privacy Policy</span>.
          </p>
        </div>

        <button className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper">
          Create account
          <ArrowRight className="size-5" strokeWidth={1.75} />
        </button>

        <p className="mt-auto pt-12 text-center text-[17px] text-ink-soft">
          Already have an account? <span className="text-brand">Sign in</span>
        </p>
      </div>
    </Screen>
  );
}