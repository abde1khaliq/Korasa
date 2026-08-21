"use client";

import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {!isAuthPage && <Header />}
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}