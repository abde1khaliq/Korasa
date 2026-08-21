"use client";

import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Header/>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
