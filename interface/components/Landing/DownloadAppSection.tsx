"use client";

import {
  Smartphone,
  Download,
  Camera,
  WifiOff,
  Sparkles,
  ShieldCheck,
  QrCode,
} from "lucide-react";

export function DownloadAppSection() {
  const downloadUrl = "https://download854.mediafire.com/cnskjkkzkqsgIGD8ECiG-XHVtPsMYzvYDygbZ5dMgS-bCFcF2b4ieck3cL0hHZoCJSE6mL3HFOnDcU-xEVLyD3d9_BGJYUi2TEUDhEP2-3dJDBh4IWX1KkvgzBPRwrkIjD2a-C-W94o_OmQu1egwEb7vm1Q6xSBO5ar-D48UiFHXfA/mx5jqtcbomzpdfh/Korasa.apk";

  return (
    <section id="download" className="border-t border-rule bg-paper-card py-20 md:py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-rule bg-paper p-8 shadow-xl sm:p-12 lg:p-16">
          {/* Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-brand/10 blur-3xl"
          />

          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">

              <h2 className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">
                Download the Korasa Android App.
              </h2>

              <p className="mt-4 text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
                Take your question bank everywhere. Snap questions in class with
                your camera, practice on your commute, and
                revise whenever you have 5 minutes.
              </p>


              {/* Download Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-onyx px-6 py-3.5 text-[15px] font-medium text-paper shadow-sm transition-all hover:bg-onyx/90 hover:shadow"
                >
                  <Download className="size-4" />
                  Download Android APK
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl border border-rule bg-paper-card p-6 shadow-inner text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Smartphone className="size-7" />
                </div>

                <h3 className="mt-4 font-display text-xl font-medium text-ink">
                  Direct Install on Android
                </h3>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Download the APK directly to your phone or tablet to start studying immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
