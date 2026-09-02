"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, ChevronRight, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { ConfirmModal } from "@/components/common/ConfirmModal";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userName = session?.user?.name || "Student";
  const userEmail = session?.user?.email || "";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-rule/60">
        <h1 className="font-display text-[34px] sm:text-[40px] font-normal leading-tight text-ink">
          Settings & Account
        </h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          Customize your study workspace and preferences.
        </p>
      </div>

      {/* Account Section */}
      <div className="space-y-3">
        <h2 className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
          Account
        </h2>

        <div className="rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-tag font-display text-xl font-normal text-ink">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-ink truncate capitalize">
                {userName}
              </p>
              <p className="text-[13px] font-mono text-ink-faint truncate">
                {userEmail}
              </p>
            </div>
          </div>

          <Link
            href="/app/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rule text-[13px] font-medium text-ink hover:bg-tag/40 transition-colors shrink-0"
          >
            <span>View Profile</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="space-y-3">
        <h2 className="font-mono text-[12px] tracking-widest text-ink-faint uppercase">
          Appearance & Theme
        </h2>

        <div className="divide-y divide-rule/60 rounded-2xl border border-rule bg-paper-card overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="size-5 text-brand" />
              ) : (
                <Sun className="size-5 text-brand" />
              )}
              <div>
                <p className="text-[15px] font-medium text-ink">Theme Mode</p>
                <p className="text-[13px] text-ink-soft">
                  {theme === "dark" ? "Dark Mode (Obsidian)" : "Light Mode (Warm Paper)"}
                </p>
              </div>
            </div>

            <div className="flex items-center rounded-xl border border-rule bg-paper p-1">
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-1 rounded-lg text-[13px] font-medium transition-all ${
                  theme !== "dark"
                    ? "bg-onyx text-paper font-semibold shadow-xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-1 rounded-lg text-[13px] font-medium transition-all ${
                  theme === "dark"
                    ? "bg-onyx text-paper font-semibold shadow-xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="pt-2">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-2 rounded-xl border border-hard/30 bg-hard-soft/20 px-4 py-2.5 text-[14px] font-medium text-hard hover:bg-hard-soft/40 transition-colors"
        >
          <LogOut className="size-4" />
          <span>Sign Out of Korasa</span>
        </button>
      </div>

      {/* Logout confirmation dialog */}
      <ConfirmModal
        visible={showLogoutConfirm}
        title="Sign out"
        message="You'll need to sign in again to access your subjects."
        confirmLabel="Sign out"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          signOut({ callbackUrl: "/login" });
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
