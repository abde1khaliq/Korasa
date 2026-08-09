import { ArrowRight } from "lucide-react";
import { Screen } from "./Screen";

export function Login() {
  return (
    <Screen>
      <header className="px-6 pt-6">
        <span className="font-display text-2xl leading-none">K</span>
      </header>

      <div className="flex flex-1 flex-col px-6 pt-10 pb-16">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-[48px] leading-[1.05]">Sign in</h1>
        <p className="mt-3 text-[17px] text-ink-soft">
          Pick up where your questions left off.
        </p>

        <p className="mt-10 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
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

        <p className="mt-4 text-[16px] text-brand">Forgot password?</p>

        <button className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper">
          Sign in
          <ArrowRight className="size-5" strokeWidth={1.75} />
        </button>

        <div className="mt-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-rule" />
          <span className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
            or
          </span>
          <span className="h-px flex-1 bg-rule" />
        </div>

        <button className="mt-6 w-full rounded-full border border-rule bg-paper-card px-8 py-4 text-[17px]">
          Continue with Google
        </button>

        <p className="mt-auto pt-12 text-center text-[17px] text-ink-soft">
          New here? <span className="text-brand">Create an account</span>
        </p>
      </div>
    </Screen>
  );
}