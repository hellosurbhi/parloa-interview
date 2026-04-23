"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { ShortenedUrl } from "@/lib/types";
import AuthPrompt from "./AuthPrompt";
import UrlForm from "./UrlForm";
import UrlList from "./UrlList";

export default function UrlShortener() {
  const { data: session, status } = useSession();
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    try {
      const res = await fetch("/api/urls");
      if (!res.ok) return;
      const json = await res.json();
      setUrls(json.data ?? []);
    } catch {
      setError("Failed to load your URLs");
    }
  }, []);

  useEffect(() => {
    if (session) fetchUrls();
  }, [session, fetchUrls]);

  if (status === "loading" || !session) {
    return <AuthPrompt />;
  }

  function handleError(message: string) {
    setError(message || null);
  }

  function handleCreated(url: ShortenedUrl) {
    setUrls((prev) => [url, ...prev]);
  }

  async function handleDelete(shortCode: string) {
    try {
      const res = await fetch(`/api/urls/${shortCode}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setUrls((prev) => prev.filter((u) => u.short_code !== shortCode));
      }
    } catch {
      setError("Failed to delete link");
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-start w-full max-w-2xl mx-auto pt-16">
      <div className="w-full animate-reveal">
        <h1 className="text-[clamp(2rem,6vw,4rem)] font-light leading-tight tracking-[-0.03em] mb-2">
          Shorten your URL
        </h1>
        <div className="h-px bg-neutral-300 w-16 mb-6" />
        <p className="text-neutral-500 text-sm mb-8 font-[family-name:var(--font-geist-mono)]">
          Paste a link, optionally set an alias and expiry.
        </p>

        <UrlForm onCreated={handleCreated} onError={handleError} />

        {error && (
          <p className="text-red-500 text-sm mb-4 animate-row-enter" role="alert">
            {error}
          </p>
        )}
      </div>

      <UrlList urls={urls} onDelete={handleDelete} onError={handleError} />
    </div>
  );
}
