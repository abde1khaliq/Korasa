"use client";

import { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

interface PhoneMockupProps {
  children: ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div
      className="relative mx-auto flex w-full max-w-[310px] items-center justify-center sm:max-w-[330px]"
      style={{ perspective: "1200px" }}
    >
      <div className="relative w-full">
        <div
          className="relative w-full aspect-[9/19.5] rounded-[52px] p-[2px]"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 30%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.20) 100%)",
          }}
        >
          <div
            className="relative h-full w-full rounded-[50px] p-[9px]"
            style={{
              background:
                "linear-gradient(165deg, #2d2d32 0%, #1c1c20 35%, #131316 70%, #0e0e11 100%)",
            }}
          >
            <div
              className="absolute -left-[1px] top-[72px] h-[18px] w-[3px] rounded-l-sm"
              style={{
                background: "linear-gradient(180deg, #48484e, #2a2a2e)",
              }}
            />
            <div
              className="absolute -left-[1px] top-[104px] h-[32px] w-[3px] rounded-l-sm"
              style={{
                background: "linear-gradient(180deg, #48484e, #2a2a2e)",
              }}
            />
            <div
              className="absolute -left-[1px] top-[144px] h-[32px] w-[3px] rounded-l-sm"
              style={{
                background: "linear-gradient(180deg, #48484e, #2a2a2e)",
              }}
            />

            <div
              className="absolute -right-[1px] top-[120px] h-[40px] w-[3px] rounded-r-sm"
              style={{
                background: "linear-gradient(180deg, #3a3a3e, #222226)",
              }}
            />

            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px]">
              <div className="relative flex h-full w-full flex-col bg-paper">
                <div className="relative z-30 flex h-12 w-full items-end justify-between px-7 pb-1.5 select-none">
                  <span className="text-[13px] font-semibold tracking-tight text-ink">
                    9:41
                  </span>

                  <div
                    className="absolute left-1/2 top-3 -translate-x-1/2"
                    style={{ width: "92px", height: "28px" }}
                  >
                    <div
                      className="h-full w-full rounded-full"
                      style={{ background: "#0a0a0c" }}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-ink">
                    <Signal className="size-3" strokeWidth={2.2} />
                    <Wifi className="size-3" strokeWidth={2.2} />
                    <BatteryFull className="size-[15px]" strokeWidth={1.8} />
                  </div>
                </div>

                <div className="relative flex-1 overflow-hidden">
                  {children}
                </div>

                <div className="pointer-events-none relative z-30 flex justify-center pb-2 pt-0.5">
                  <div className="h-[4px] w-[120px] rounded-full bg-ink/25" />
                </div>
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 rounded-[42px]"
                style={{
                  background:
                    "linear-gradient(130deg, rgba(255,255,255,0.10) 0%, transparent 30%, transparent 100%)",
                }}
              />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 top-0 h-[1.5px] rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 inset-y-20 w-[1.5px] rounded-full"
            style={{
              background:
                "linear-gradient(180deg, transparent 10%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.08) 70%, transparent 90%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
