"use client";

import { ReactNode } from "react";
import { Wifi } from "lucide-react";

interface PhoneMockupProps {
  children: ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-[310px] items-center justify-center sm:max-w-[330px]">
      {/* Outer Phone Frame / Chassis */}
      <div className="relative w-full aspect-[9/19] rounded-[48px] border-[10px] border-onyx bg-onyx p-1.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-black/20">
        {/* Left Side Physical Buttons (Volume Rocker) */}
        <div className="absolute -left-[13px] top-24 h-9 w-[3px] rounded-l-sm bg-onyx" />
        <div className="absolute -left-[13px] top-36 h-9 w-[3px] rounded-l-sm bg-onyx" />

        {/* Right Side Physical Button (Power) */}
        <div className="absolute -right-[13px] top-28 h-12 w-[3px] rounded-r-sm bg-onyx" />

        {/* Inner Phone Display Container */}
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[38px] bg-paper">
          {/* Top Status Bar & Dynamic Island */}
          <div className="relative z-30 flex h-8 w-full items-center justify-between px-6 pt-1 text-ink select-none">
            {/* Clock */}
            <span className="font-mono text-[11px] font-semibold tracking-tight">
              9:41
            </span>

            {/* Dynamic Island / Speaker cutout */}
            <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-onyx" />

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-ink">
              <span className="font-mono text-[9px] font-bold">5G</span>
              <Wifi className="size-2.5" strokeWidth={2.5} />
              {/* Battery Icon */}
              <div className="flex h-2.5 w-4 items-center rounded-xs border border-ink p-0.5">
                <div className="h-full w-full rounded-2xs bg-ink" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="relative flex-1 overflow-hidden">{children}</div>

          {/* Bottom Home Indicator Bar */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-ink/30" />
        </div>
      </div>
    </div>
  );
}
