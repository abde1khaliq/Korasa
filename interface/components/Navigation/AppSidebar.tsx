"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Settings,
  Plus,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface AppSidebarProps {
  onQuickCreate: () => void;
}

const NAV_ITEMS = [
  { href: "/app", label: "Subjects", icon: BookOpen, exact: true },
  { href: "/app/calendar", label: "Calendar", icon: Calendar, exact: false },
  { href: "/app/exams", label: "Exams", icon: ClipboardList, exact: false },
  { href: "/app/settings", label: "Settings", icon: Settings, exact: false },
];

export function AppSidebar({ onQuickCreate }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const userName = session?.user?.name || "Student";
  const userEmail = session?.user?.email || "";

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return (
        pathname === "/app" ||
        pathname.startsWith("/subject")
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-rule bg-paper min-h-screen sticky top-0 h-screen select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-rule/60">
        <Link href="/app" className="flex items-center gap-3 group">
          <div>
            <span className="font-display text-xl font-normal tracking-tight text-ink block leading-none">
              Korasa
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onQuickCreate}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-onyx px-4 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/85 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer"
        >
          <Plus className="size-4 text-paper group-hover:rotate-90 transition-transform duration-200" strokeWidth={2.2} />
          <span>Quick Create</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ease-out ${
                active
                  ? "bg-ink/[0.08] dark:bg-white/10 text-ink font-semibold"
                  : "text-ink-soft hover:text-ink hover:bg-ink/[0.04] dark:hover:bg-white/5"
              }`}
            >
              <Icon
                className={`size-4.5 shrink-0 text-ink transition-all duration-200 ease-out ${
                  active
                    ? "stroke-[2.2]"
                    : "opacity-70 group-hover:opacity-100"
                }`}
              />
              <span className="transition-colors duration-200">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Appearance Footer */}
      <div className="p-3 border-t border-rule/60 bg-paper-card/30 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/5 border border-rule/80 text-ink">
              <UserIcon className="size-4 text-ink" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink truncate capitalize">
                {userName}
              </p>
              <p className="text-[11px] text-ink-faint truncate font-mono">
                {userEmail}
              </p>
            </div>
          </div>

          {/* <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            className="group flex size-8 items-center justify-center rounded-lg text-ink hover:bg-ink/5 dark:hover:bg-white/5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-ink group-hover:rotate-45 transition-transform duration-200" strokeWidth={1.75} />
            ) : (
              <Moon className="size-4 text-ink group-hover:-rotate-12 transition-transform duration-200" strokeWidth={1.75} />
            )}
          </button> */}
        </div>

        <button
          onClick={() => setShowConfirmLogout(true)}
          className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-hard hover:bg-hard-soft/30 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <LogOut className="size-3.5 shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200" strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </div>

      {/* Logout confirmation dialog */}
      <ConfirmModal
        visible={showConfirmLogout}
        title="Sign out"
        message="You'll need to sign in again to access your subjects."
        confirmLabel="Sign out"
        onConfirm={() => {
          setShowConfirmLogout(false);
          signOut({ callbackUrl: "/login" });
        }}
        onCancel={() => setShowConfirmLogout(false)}
      />
    </aside>
  );
}
