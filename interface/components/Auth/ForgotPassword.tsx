"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("pendingResetEmail", email);
      router.push(`/verify-reset?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <header className="px-6 pt-6">
        <span className="font-display text-2xl leading-none text-ink">
          Korasa
        </span>
      </header>

      <div className="flex flex-1 flex-col px-6 pt-10 pb-16 max-w-md mx-auto w-full">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Forgot password
        </p>

        <h1 className="mt-3 font-display text-[48px] leading-[1.05] text-ink">
          Reset password
        </h1>

        <p className="mt-3 text-[17px] text-ink-soft">
          Enter your email and we&apos;ll send you a code to reset your password.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSendCode} className="flex flex-col flex-1 mt-6">
          <p className="font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
            Email
          </p>

          <div className="mt-3 rounded-2xl border border-rule bg-paper-card px-5 py-1 focus-within:border-brand">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-[18px] text-ink placeholder:text-ink-faint bg-transparent outline-none py-3"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Sending code..." : "Send reset code"}
            <ArrowRight className="size-5" strokeWidth={1.75} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-ink-faint hover:text-ink transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </>
  );
}
