import Link from "next/link";
import {
  ArrowRight,
  Apple,
  Smartphone,
} from "lucide-react";

interface ChangelogEntry {
  date: string;
  tag: "New" | "Improved" | "Fixed";
  title: string;
  description: string;
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: "Aug 24 2026",
    tag: "New",
    title: "Photo-based question capture",
    description:
      "Questions are now created by capturing and cropping an image instead of typing everything by hand.",
  },
];

const tagStyles: Record<ChangelogEntry["tag"], string> = {
  New: "bg-easy-soft text-easy",
  Improved: "bg-medium-soft text-medium",
  Fixed: "bg-hard-soft text-hard",
};

export function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  const primaryHref = isAuthenticated ? "/app" : "/login";
  const primaryLabel = isAuthenticated ? "Go to your subjects" : "Open in browser";

  return (
    <div className="flex flex-1 flex-col bg-paper">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-display text-2xl leading-none text-ink">Korasa</span>
        <div className="flex items-center gap-6">
          <Link
            href={primaryHref}
            className="rounded-full bg-onyx px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-onyx/90 transition-colors"
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-10 pb-16 sm:px-10 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mt-4 font-display text-[44px] leading-[1.05] text-ink sm:text-[64px]">
            Study in your way
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-soft sm:text-[19px]">
            Korasa organizes the questions worth remembering into subjects and
            folders , capture them from a photo, tag a difficulty, and review
            them whenever you're ready.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-onyx px-8 py-4 text-[16px] text-paper hover:bg-onyx/90 transition-colors sm:w-auto"
            >
              {primaryLabel}
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features
      <section id="features" className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
            Features
          </p>
          <h2 className="mt-3 font-display text-[32px] leading-tight text-ink sm:text-[40px]">
            Everything you need, nothing you don't
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-rule bg-paper-card p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-tag">
                    <Icon className="size-5 text-brand" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-snug text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      <section id="changelog" className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-[13px] tracking-[0.18em] text-ink-faint uppercase">
            Changelog
          </p>
          <h2 className="mt-3 font-display text-[32px] leading-tight text-ink sm:text-[40px]">
            What's new
          </h2>

          <ul className="mt-10 flex flex-col gap-6">
            {CHANGELOG.map((entry) => (
              <li
                key={entry.title}
                className="flex gap-4 border-l-2 border-rule pl-5"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tagStyles[entry.tag]}`}
                    >
                      {entry.tag}
                    </span>
                    <span className="font-mono text-[12px] text-ink-faint">
                      {entry.date}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[16px] font-medium text-ink">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                    {entry.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rule bg-onyx px-8 py-12 text-center text-paper">
          <p className="font-mono text-[13px] tracking-[0.18em] text-paper/60 uppercase">
            Take Korasa with you
          </p>
          <h2 className="mt-3 font-display text-[30px] leading-tight sm:text-[36px]">
            Get the mobile application
          </h2>
          <p className="mt-3 text-[15px] text-paper/70">
            The native app is in progress. Continue in your browser for now,
            we'll add real store links here once it ships.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
<a 
  href="https://mega.nz/file/w2QSTKpL#6uvafOjPHLumIb4dLbbOQQk9U-WpIuKBHjo_JLHUzEU" 
  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-paper px-6 py-3.5 text-[15px] text-onyx hover:bg-paper/90 transition-colors sm:w-auto"
>
  <Smartphone className="size-4" strokeWidth={1.75} />
  Korasa App (90MBs)
</a>

          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center sm:px-10">
        <p className="text-[13px] text-ink-faint">
          © {new Date().getFullYear()} Korasa. Study in your way.
        </p>
      </footer>
    </div>
  );
}