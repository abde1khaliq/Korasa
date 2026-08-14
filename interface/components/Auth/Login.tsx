"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Screen } from "@/components/misc/Screen";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Screen>
      <header className="px-6 pt-6">
        <span className="font-display text-2xl leading-none">K</span>
      </header>

      <div className="flex flex-1 flex-col px-6 pt-10 pb-16">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-[48px] leading-[1.05]">
          Sign in
        </h1>
        <p className="mt-3 text-[17px] text-ink-soft">
          Pick up where your questions left off.
        </p>

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col flex-1">
          <p className="mt-6 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
            Email
          </p>
          <div className="mt-3 rounded-2xl border border-rule bg-paper-card px-5 py-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-[18px] text-ink placeholder:text-ink-faint bg-transparent outline-none py-3"
              disabled={loading}
            />
          </div>

          <p className="mt-7 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
            Password
          </p>
          <div className="mt-3 flex items-center justify-between rounded-2xl border focus-within:border-brand border-rule bg-paper-card px-5 py-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full font-mono text-[20px] tracking-[0.1em] text-ink placeholder:tracking-normal placeholder:text-ink-faint bg-transparent outline-none py-3"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="font-mono text-[14px] tracking-[0.14em] text-ink-faint uppercase hover:text-ink ml-2 shrink-0"
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <p className="mt-4 text-[16px] text-brand hover:underline cursor-pointer">
            Forgot password?
          </p>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight className="size-5" strokeWidth={1.75} />
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-rule" />
          <span className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
            or
          </span>
          <span className="h-px flex-1 bg-rule" />
        </div>

        <button className="mt-6 w-full rounded-full border border-rule bg-paper-card px-8 py-4 text-[17px] hover:bg-rule/50 transition-colors">
          Continue with Google
        </button>

        <p className="mt-auto pt-12 text-center text-[17px] text-ink-soft">
          New here?{" "}
          <Link href="/register" className="text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </Screen>
  );
}
