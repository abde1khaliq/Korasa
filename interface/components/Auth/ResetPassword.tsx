"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const queryEmail = searchParams.get("email");
    const queryCode = searchParams.get("code");
    const storedEmail = sessionStorage.getItem("pendingResetEmail");
    const storedCode = sessionStorage.getItem("pendingResetCode");

    const activeEmail = queryEmail || storedEmail || "";
    const activeCode = queryCode || storedCode || "";

    if (!activeEmail || !activeCode) {
      router.replace("/forgot-password");
      return;
    }

    setEmail(activeEmail);
    setCode(activeCode);
  }, [searchParams, router]);

  const handleReset = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      sessionStorage.removeItem("pendingResetEmail");
      sessionStorage.removeItem("pendingResetCode");

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (!email || !code) return null;

  return (
    <>
      <header className="px-6 pt-6">
        <span className="font-display text-2xl leading-none text-ink">
          Korasa
        </span>
      </header>

      <div className="flex flex-1 flex-col px-6 pt-10 pb-16 max-w-md mx-auto w-full">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Final step
        </p>

        <h1 className="mt-3 font-display text-[48px] leading-[1.05] text-ink">
          New password
        </h1>

        <p className="mt-3 text-[17px] text-ink-soft">
          Choose a new password for your account.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm flex items-center gap-2">
            <Check className="size-4" />
            Password reset! Redirecting to sign in…
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col flex-1 mt-6">
          <p className="font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
            New Password
          </p>

          <div className="mt-3 flex items-center justify-between rounded-2xl border focus-within:border-brand border-rule bg-paper-card px-5 py-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full font-mono text-[20px] tracking-[0.1em] text-ink placeholder:tracking-normal placeholder:text-ink-faint bg-transparent outline-none py-3"
              disabled={loading || success}
              autoFocus
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="font-mono text-[14px] tracking-[0.14em] text-ink-faint uppercase hover:text-ink ml-2 shrink-0"
              disabled={loading || success}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <p className="mt-2 text-[15px] text-ink-faint">
            At least 8 characters.
          </p>

          <p className="mt-7 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
            Confirm Password
          </p>

          <div className="mt-3 flex items-center justify-between rounded-2xl border focus-within:border-brand border-rule bg-paper-card px-5 py-1">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full font-mono text-[20px] tracking-[0.1em] text-ink placeholder:tracking-normal placeholder:text-ink-faint bg-transparent outline-none py-3"
              disabled={loading || success}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="font-mono text-[14px] tracking-[0.14em] text-ink-faint uppercase hover:text-ink ml-2 shrink-0"
              disabled={loading || success}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Updating..." : success ? "Done!" : "Reset password"}
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
