import UrlShortener from "@/components/UrlShortener";
import UserMenu from "@/components/UserMenu";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col px-8 py-10 sm:px-16 sm:py-14 font-[family-name:var(--font-geist-sans)]">
      <nav className="flex items-center justify-between animate-reveal">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 font-[family-name:var(--font-geist-mono)]">
          par.loa &mdash; URL Shortener
        </p>
        <UserMenu />
      </nav>

      <UrlShortener />

      <footer className="animate-reveal-delay-2 pt-10">
        <p className="text-xs text-neutral-400 font-[family-name:var(--font-geist-mono)]">
          Next.js 14 &middot; TypeScript &middot; Redis &middot; NextAuth
        </p>
      </footer>
    </main>
  );
}
