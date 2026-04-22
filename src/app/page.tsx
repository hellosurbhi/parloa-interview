export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between px-8 py-10 sm:px-16 sm:py-14 font-[family-name:var(--font-geist-sans)]">
      <nav className="animate-reveal">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 font-[family-name:var(--font-geist-mono)]">
          Parloa &mdash; Interview Project
        </p>
      </nav>

      <div className="flex-1 flex items-center">
        <div className="max-w-3xl">
          <h1 className="text-[clamp(2.5rem,8vw,6.5rem)] font-extralight leading-[0.95] tracking-[-0.03em] animate-reveal">
            Hello, Parloa
          </h1>
          <div className="h-px bg-neutral-300 mt-8 mb-8 animate-line" />
          <p className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-light text-neutral-500 leading-relaxed animate-reveal-delay">
            Let&apos;s get <span className="text-neutral-900 font-normal">Surbhi</span> hired.
          </p>
        </div>
      </div>

      <footer className="animate-reveal-delay-2">
        <p className="text-xs text-neutral-400 font-[family-name:var(--font-geist-mono)]">
          Next.js 14 &middot; TypeScript &middot; SQLite
        </p>
      </footer>
    </main>
  );
}
