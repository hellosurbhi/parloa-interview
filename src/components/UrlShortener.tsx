"use client";

import { useState, useEffect, FormEvent } from "react";
import type { ShortenedUrl } from "@/lib/types";

const STORAGE_KEY = "par.loa:urls";

function loadUrls(): ShortenedUrl[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ShortenedUrl[];
  } catch {
    return [];
  }
}

function saveUrls(urls: ShortenedUrl[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

export default function UrlShortener() {
  const [inputUrl, setInputUrl] = useState("");
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUrls(loadUrls());
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Something went wrong");
        return;
      }

      const shortened: ShortenedUrl = json.data;
      const updated = [shortened, ...urls];
      setUrls(updated);
      saveUrls(updated);
      setInputUrl("");
    } catch {
      setError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="w-full animate-reveal">
        <h1 className="text-[clamp(2rem,6vw,4rem)] font-extralight leading-tight tracking-[-0.03em] mb-2">
          Shorten your URL
        </h1>
        <p className="text-neutral-400 text-sm mb-8 font-[family-name:var(--font-geist-mono)]">
          Paste a link and get a short one back.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://example.com/some/long/url?with=params"
            className="flex-1 px-4 py-3 rounded-lg border border-neutral-200 bg-white text-sm font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "..." : "Shorten"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
      </div>

      {urls.length > 0 && (
        <div className="w-full mt-8 animate-reveal-delay">
          <div className="h-px bg-neutral-200 mb-6" />
          <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4 font-[family-name:var(--font-geist-mono)]">
            Your links
          </h2>
          <ul className="space-y-3">
            {urls.map((url) => (
              <li
                key={url.short_code}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 rounded-lg bg-white border border-neutral-100"
              >
                <a
                  href={url.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-neutral-900 font-[family-name:var(--font-geist-mono)] hover:underline shrink-0"
                >
                  {url.short_url.replace(/^https?:\/\//, "")}
                </a>
                <span className="text-sm text-neutral-400 truncate">
                  {url.original_url}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
