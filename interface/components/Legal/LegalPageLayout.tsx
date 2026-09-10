import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-brand/20 selection:text-brand">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-rule/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-2xl font-medium tracking-tight text-ink transition-opacity hover:opacity-90"
          >
            Korasa
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="border-b border-rule/60 pb-8">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-[14px] text-ink-faint">
            Last updated: {lastUpdated}
          </p>
        </div>

        <article className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-soft [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:space-y-1.5 [&_li]:leading-relaxed [&_strong]:text-ink [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </article>

        {/* Bottom Navigation */}
        <div className="mt-16 flex items-center justify-between border-t border-rule/60 pt-8 text-[14px]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-brand transition-colors hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center gap-4 text-ink-faint text-[13px]">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <span>·</span>
            <Link href="/cookies" className="hover:text-ink">
              Cookies
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
