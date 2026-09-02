"use client";

import { useState } from "react";
import { User as UserIcon, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { ConfirmModal } from "@/components/common/ConfirmModal";

export function ProfileView() {
  const { data: session } = useSession();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      {/* Title */}
      <div className="pt-2">
        <h1 className="font-display text-[34px] sm:text-[40px] font-normal leading-tight text-ink">
          Profile
        </h1>
      </div>

      {/* Center Avatar and Info */}
      <div className="mt-8 flex flex-col items-center px-6 text-center">
        <div
          className="flex size-[72px] items-center justify-center rounded-full bg-ink/10 dark:bg-white/10"
        >
          <UserIcon size={32} className="text-ink" strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 text-[20px] text-ink font-normal">
          {userName ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : ""}
        </h2>
        <p className="mt-1 text-[14px] text-ink-faint">
          {userEmail}
        </p>
      </div>

      {/* Sign Out Action Button */}
      <div className="mt-10 px-6 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setConfirmingLogout(true)}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-rule py-3.5 text-hard hover:bg-hard-soft/30 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <LogOut size={16} className="text-hard" strokeWidth={1.75} />
          <span className="text-[15px] font-medium text-hard">
            Sign out
          </span>
        </button>
      </div>

      <ConfirmModal
        visible={confirmingLogout}
        title="Sign out"
        message="You'll need to sign in again to access your subjects."
        confirmLabel="Sign out"
        onConfirm={() => {
          setConfirmingLogout(false);
          signOut({ callbackUrl: "/login" });
        }}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
