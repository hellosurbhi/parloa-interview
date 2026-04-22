"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import type { ShortenedUrl } from "@/lib/types";

const EXPIRY_OPTIONS = [
  { label: "No expiry", value: 0 },
  { label: "1 hour", value: 3600 },
  { label: "24 hours", value: 86400 },
  { label: "7 days", value: 604800 },
  { label: "30 days", value: 2592000 },
];

function timeUntil(expiresAt: string): string {
  const diff = new Date(expiresAt + "Z").getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.ceil(diff / 60000)}m left`;
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

export default function UrlShortener() {
  const { data: session, status } = useSession();
  const [inputUrl, setInputUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    try {
      const res = await fetch("/api/urls");
      if (!res.ok) return;
      const json = await res.json();
      setUrls(json.data ?? []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (session) fetchUrls();
  }, [session, fetchUrls]);

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
      const body: Record<string, unknown> = { url: trimmed };
      if (customAlias.trim()) body.custom_alias = customAlias.trim();
      if (expiresIn > 0) body.expires_in = expiresIn;

      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        try {
          const json = await res.json();
          setError(json.error?.message ?? "Something went wrong");
        } catch {
          setError(`Server error (${res.status})`);
        }
        return;
      }

      const json = await res.json();
      setUrls((prev) => [json.data, ...prev]);
      setInputUrl("");
      setCustomAlias("");
      setExpiresIn(0);
    } catch {
      setError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(shortCode: string) {
    try {
      const res = await fetch(`/api/urls/${shortCode}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setUrls((prev) => prev.filter((u) => u.short_code !== shortCode));
      }
    } catch {
      // silent
    }
  }

  async function handleCopy(shortUrl: string, shortCode: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(shortCode);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // silent
    }
  }

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto animate-reveal">
        <h1 className="text-[clamp(2rem,6vw,4rem)] font-extralight leading-tight tracking-[-0.03em] mb-2">
          Shorten your URL
        </h1>
        <p className="text-neutral-400 text-sm mb-8 font-[family-name:var(--font-geist-mono)]">
          Sign in to create and manage short links.
        </p>
        <button
          onClick={() => signIn("github")}
          className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start w-full max-w-2xl mx-auto pt-16">
      <div className="w-full animate-reveal">
        <h1 className="text-[clamp(2rem,6vw,4rem)] font-extralight leading-tight tracking-[-0.03em] mb-2">
          Shorten your URL
        </h1>
        <p className="text-neutral-400 text-sm mb-8 font-[family-name:var(--font-geist-mono)]">
          Paste a link, optionally set an alias and expiry.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div className="flex gap-3">
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
              className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {isLoading ? "..." : "Shorten"}
            </button>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="Custom alias (optional)"
              className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              disabled={isLoading}
            />
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(Number(e.target.value))}
              className="px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              disabled={isLoading}
            >
              {EXPIRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-lg bg-white border border-neutral-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={url.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-neutral-900 font-[family-name:var(--font-geist-mono)] hover:underline"
                    >
                      {url.short_url.replace(/^https?:\/\//, "")}
                    </a>
                    {url.expires_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-[family-name:var(--font-geist-mono)]">
                        {timeUntil(url.expires_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-400 truncate">
                    {url.original_url}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(url.short_url, url.short_code)}
                    className="text-xs px-3 py-1.5 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors font-[family-name:var(--font-geist-mono)]"
                  >
                    {copied === url.short_code ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleDelete(url.short_code)}
                    className="text-xs px-3 py-1.5 rounded border border-neutral-200 text-red-400 hover:text-red-600 hover:border-red-300 transition-colors font-[family-name:var(--font-geist-mono)]"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
