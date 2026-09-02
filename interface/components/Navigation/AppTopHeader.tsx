"use client";

import {
  ChevronLeft,
  BookOpen,
  Calendar,
  ClipboardList,
  Settings,
  User as UserIcon,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface AppTopHeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  onQuickCreate?: () => void;
}

const NAV_ITEMS = [
  { href: "/app", label: "Subjects", icon: BookOpen, exact: true },
  { href: "/app/calendar", label: "Calendar", icon: Calendar, exact: false },
  { href: "/app/exams", label: "Exams", icon: ClipboardList, exact: false },
  { href: "/app/settings", label: "Settings", icon: Settings, exact: false },
  { href: "/app/profile", label: "Profile", icon: UserIcon, exact: false },
];

export function AppTopHeader({
  title,
  breadcrumbs,
  onQuickCreate,
}: AppTopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isRoot = pathname === "/app" || pathname === "/";
  const userName = session?.user?.name || "Student";
  const userEmail = session?.user?.email || "";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === "/app" || pathname.startsWith("/subject");
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-paper/90 backdrop-blur-md border-b border-rule">
      {/* Left side: Back Button & Breadcrumbs / Brand */}
      <div className="flex items-center gap-3 min-w-0">
        {!isRoot ? (
          <button
            onClick={() => router.back()}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-rule/80 text-ink hover:bg-tag/50 transition-colors cursor-pointer"
            title="Go back"
          >
            <ChevronLeft className="size-4.5" strokeWidth={2} />
          </button>
        ) : (
          <Link href="/app" className="flex items-center gap-2 mr-1">
            <span className="font-display text-2xl text-ink font-normal">Korasa</span>
          </Link>
        )}

        {/* Breadcrumb / Title Trail */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1.5 font-mono text-[13px] text-ink-soft truncate">
            {breadcrumbs.map((b, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={idx} className="flex items-center gap-1.5 truncate">
                  {idx > 0 && <span className="text-ink-faint">/</span>}
                  {b.href && !isLast ? (
                    <Link
                      href={b.href}
                      className="text-ink-soft hover:text-brand transition-colors truncate"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span
                      className={`truncate ${isLast ? "font-semibold text-ink" : "text-ink-soft"}`}
                    >
                      {b.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        ) : null}
      </div>

      {/* Right side: Mobile Menu Dropdown Trigger */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex size-9 items-center justify-center rounded-xl border border-rule/80 transition-all cursor-pointer ${
            showMenu ? "bg-onyx text-paper border-onyx" : "bg-paper-card text-ink hover:bg-tag/50"
          }`}
          title="Open menu"
        >
          {showMenu ? (
            <X className="size-4.5" strokeWidth={2} />
          ) : (
            <Menu className="size-4.5" strokeWidth={1.8} />
          )}
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-rule bg-paper p-2 shadow-2xl animate-in fade-in zoom-in-95 z-50">
            {/* User Identity header */}
            <div className="flex items-center gap-3 p-2.5 border-b border-rule/60">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/5 border border-rule text-ink">
                <UserIcon className="size-4 text-ink" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink capitalize truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-ink-faint truncate font-mono">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Quick Action */}
            {onQuickCreate && (
              <div className="p-1.5 border-b border-rule/60">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onQuickCreate();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-onyx px-3 py-2 text-[13px] font-medium text-paper hover:bg-onyx/90 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="size-4" strokeWidth={2.2} />
                  <span>Quick Create</span>
                </button>
              </div>
            )}

            {/* Navigation items */}
            <nav className="p-1 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                      active
                        ? "bg-ink/[0.08] dark:bg-white/10 text-ink font-semibold"
                        : "text-ink-soft hover:text-ink hover:bg-tag/40"
                    }`}
                  >
                    <Icon
                      className={`size-4.5 shrink-0 text-ink ${
                        active ? "stroke-[2.2]" : "opacity-75"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="p-1 pt-1 border-t border-rule/60">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowConfirmLogout(true);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-hard hover:bg-hard-soft/30 transition-colors cursor-pointer"
              >
                <LogOut className="size-4 shrink-0 text-hard" strokeWidth={1.75} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sign out confirm modal */}
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
    </header>
  );
}
