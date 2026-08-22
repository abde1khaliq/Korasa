"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  Check,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export const VerifyEmailPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const storedVerification = sessionStorage.getItem(
      "pendingVerification"
    );

    if (!storedVerification) {
      router.push("/register");
      return;
    }

    try {
      const pending = JSON.parse(storedVerification);

      if (!pending.email || !pending.password) {
        sessionStorage.removeItem("pendingVerification");
        router.push("/register");
        return;
      }

      setEmail(pending.email);
      setPassword(pending.password);
    } catch (err) {
      console.error(
        "Failed to read pending verification:",
        err
      );

      sessionStorage.removeItem("pendingVerification");
      router.push("/register");
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Verification failed. Please try again."
        );
        setLoading(false);
        return;
      }

      setSuccess(
        "Email verified successfully! Logging you in..."
      );

      // Automatically authenticate with NextAuth
      // using the credentials saved during registration.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error(
          "Auto-login failed:",
          result.error
        );

        // Credentials are no longer needed.
        sessionStorage.removeItem(
          "pendingVerification"
        );

        setTimeout(() => {
          router.push("/login");
        }, 1500);

        return;
      }

      // Login succeeded. Remove the temporary credentials.
      sessionStorage.removeItem(
        "pendingVerification"
      );

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Failed to resend code. Please try again."
        );
        setResending(false);
        return;
      }

      setSuccess(
        "New verification code sent to your email!"
      );

      setTimer(60);
      setCanResend(false);

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setCode(value);
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
          Verify your email
        </p>

        <h1 className="mt-3 font-display text-[48px] leading-[1.05] text-ink">
          Check your inbox
        </h1>

        <p className="mt-3 text-[17px] text-ink-soft">
          We sent a 6-digit verification code to{" "}
          <span className="font-medium text-ink">
            {email}
          </span>
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm flex items-center gap-2">
            <Check className="size-4" />
            {success}
          </div>
        )}

        <form
          onSubmit={handleVerify}
          className="flex flex-col flex-1 mt-6"
        >
          <p className="font-mono text-[14px] tracking-[0.18em] text-ink-faint uppercase">
            Verification Code
          </p>

          <div className="mt-3 rounded-2xl border border-rule bg-paper-card px-5 py-1">
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              className="w-full text-[24px] tracking-[0.2em] text-ink placeholder:text-ink-faint bg-transparent outline-none py-3 text-center font-mono"
              disabled={loading}
              maxLength={6}
              autoFocus
            />
          </div>

          <p className="mt-2 text-[15px] text-ink-faint text-center">
            Enter the code sent to your email address
          </p>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-8 py-4 text-[17px] text-paper disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Verifying..." : "Verify email"}

            <ArrowRight
              className="size-5"
              strokeWidth={1.75}
            />
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div>
            {canResend ? (
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="inline-flex items-center gap-2 text-sm text-brand hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`size-4 ${
                    resending ? "animate-spin" : ""
                  }`}
                />

                {resending
                  ? "Sending..."
                  : "Resend verification code"}
              </button>
            ) : (
              <p className="text-sm text-ink-faint">
                Resend available in {timer} seconds
              </p>
            )}
          </div>

          <div>
            <Link
              href="/register"
              className="text-sm text-ink-faint hover:text-ink transition-colors"
            >
              ← Back to registration
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}