import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col px-8 py-10 sm:px-16 sm:py-14 font-[family-name:var(--font-geist-sans)]">
      <nav className="animate-reveal">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 font-[family-name:var(--font-geist-mono)]">
          par.loa &mdash; URL Shortener
        </p>
      </nav>

      <div className="flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto animate-reveal-delay">
        <h1 className="text-[clamp(3rem,10vw,6rem)] font-light leading-none tracking-[-0.04em] mb-2">
          404
        </h1>
        <div className="h-px bg-neutral-300 w-16 mb-6 animate-line" />
        <p className="text-neutral-400 text-sm mb-8 font-[family-name:var(--font-geist-mono)]">
          This page doesn&apos;t exist.
        </p>
        <div>
          <Link
            href="/"
            className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors inline-block"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
