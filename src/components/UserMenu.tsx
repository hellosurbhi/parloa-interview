"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-7 w-7 rounded-full bg-neutral-200 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("github")}
        className="text-xs tracking-wide text-neutral-500 hover:text-neutral-900 transition-colors font-[family-name:var(--font-geist-mono)]"
      >
        Sign in with GitHub
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <img
          src={session.user.image}
          alt=""
          className="h-7 w-7 rounded-full"
        />
      )}
      <span className="text-xs text-neutral-500 font-[family-name:var(--font-geist-mono)]">
        {session.user.name}
      </span>
      <button
        onClick={() => signOut()}
        className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-[family-name:var(--font-geist-mono)]"
      >
        Sign out
      </button>
    </div>
  );
}
