"use client";

import { useSession, signIn } from "next-auth/react";

export default function AuthPrompt() {
  const { status } = useSession();

  return (
    <div className="flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto animate-reveal">
      <h1 className="text-[clamp(2rem,6vw,4rem)] font-light leading-tight tracking-[-0.03em] mb-2">
        Shorten your URL
      </h1>
      <div className="h-px bg-neutral-300 w-16 mb-6" />
      <p className="text-neutral-500 text-sm mb-8 font-[family-name:var(--font-geist-mono)]">
        Sign in to create and manage short links.
      </p>
      <div>
        <button
          onClick={() => signIn("github")}
          disabled={status === "loading"}
          className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        >
          {status === "loading" ? "Loading..." : "Sign in with GitHub"}
        </button>
      </div>
    </div>
  );
}
