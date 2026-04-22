"use client";

import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-7 w-7 rounded-full bg-neutral-200 animate-pulse" />
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={`${session.user.name ?? "User"} avatar`}
          width={28}
          height={28}
          className="h-7 w-7 rounded-full"
        />
      )}
      <span className="text-xs text-neutral-500 font-[family-name:var(--font-geist-mono)]">
        {session.user.name}
      </span>
      <button
        onClick={() => signOut()}
        className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors font-[family-name:var(--font-geist-mono)] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded"
      >
        Sign out
      </button>
    </div>
  );
}
