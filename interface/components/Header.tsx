import { ChevronLeft, LogOut, Menu, Moon, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "";
  const isRoot = pathname === "/";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 pt-6 bg-paper">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          {!isRoot && (
            <button
              onClick={() => router.back()}
              className="absolute left-0 flex items-center justify-center transition-all duration-300 ease-out animate-in slide-in-from-left-2"
            >
              <ChevronLeft className="size-5 text-ink" strokeWidth={1.75} />
            </button>
          )}
          <span
            className="font-display text-2xl leading-none text-ink transition-all duration-300 ease-out"
            style={{
              marginLeft: !isRoot ? "32px" : "0px",
            }}
          >
            K
          </span>
        </div>
      </div>
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex size-9 items-center justify-center rounded-full transition-colors"
        >
          <Menu className="size-5 text-ink" strokeWidth={1.75} />
        </button>
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 z-10 rounded-2xl border border-rule bg-paper shadow-lg overflow-hidden animate-[slideDown_0.15s_ease-out]">
            <div className="px-4 py-3 border-b border-rule">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-onyx/10">
                  <User className="size-5 text-ink-soft" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium truncate text-ink">
                    {userName.charAt(0).toUpperCase() +
                      userName.slice(1).toLowerCase()}
                  </p>
                  <p className="text-[12px] text-ink-faint truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-hard hover:bg-hard-soft/20 transition-colors"
              >
                <LogOut className="size-4" strokeWidth={1.75} />
                Sign out
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink"
              >
                <Moon className="size-4" strokeWidth={1.75} />
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
