"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setError("");

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Store credentials temporarily so VerifyEmail can
      // automatically sign the user in after verification.
      sessionStorage.setItem(
        "pendingVerification",
        JSON.stringify({
          username,
          email,
          password,
        })
      );

      router.push("/verify-email");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
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

      <div className="flex flex-1 flex-col px-6 pt-10 pb-16">
        <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
          Get started
        </p>

        <h1 className="mt-3 font-display text-[48px] leading-[1.05] text-ink">
          Create account
        </h1>

        <p className="mt-3 text-[17px] text-ink-soft">
          Subjects, folders and questions all in one quiet place.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col flex-1">
          <p className="mt-6 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
            Username
          </p>

          <div className="mt-3 rounded-2xl border border-rule bg-paper-card px-5 py-1">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full text-[18px] text-ink placeholder:text-ink-faint bg-transparent outline-none py-3"
              disabled={loading}
            />
          </div>

          <p className="mt-7 font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
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

          <p className="mt-2 text-[15px] text-ink-faint">
            At least 8 characters.
          </p>

          <div
            className="mt-7 flex items-start gap-3 cursor-pointer"
            onClick={() => !loading && setAgreed(!agreed)}
          >
            <span
              className={`mt-0.5 flex size-6 items-center justify-center rounded-md border ${
                agreed
                  ? "bg-onyx border-onyx"
                  : "border-ink-faint bg-paper-card"
              } transition-colors`}
            >
              {agreed && (
                <Check
                  className="size-4 text-paper"
                  strokeWidth={2.25}
                />
              )}
            </span>

            <p className="text-[16px] leading-snug text-ink-soft select-none">
              I agree to the{" "}
              <span className="text-brand hover:underline">Terms</span> and{" "}
              <span className="text-brand hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Sending verification..." : "Create account"}

            <ArrowRight
              className="size-5"
              strokeWidth={1.75}
            />
          </button>
        </form>

        <p className="mt-auto pt-12 text-center text-[17px] text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}