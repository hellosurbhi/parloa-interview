"use client";

import { useState, FormEvent } from "react";
import type { ShortenedUrl } from "@/lib/types";

const EXPIRY_OPTIONS = [
  { label: "No expiry", value: 0 },
  { label: "1 hour", value: 3600 },
  { label: "24 hours", value: 86400 },
  { label: "7 days", value: 604800 },
  { label: "30 days", value: 2592000 },
];

interface UrlFormProps {
  onCreated: (url: ShortenedUrl) => void;
  onError: (message: string) => void;
}

export default function UrlForm({ onCreated, onError }: UrlFormProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onError("");

    const trimmed = inputUrl.trim();
    if (!trimmed) {
      onError("Please enter a URL");
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
          onError(json.error?.message ?? "Something went wrong");
        } catch {
          onError(`Server error (${res.status})`);
        }
        return;
      }

      const json = await res.json();
      onCreated(json.data);
      setInputUrl("");
      setCustomAlias("");
      setExpiresIn(0);
    } catch {
      onError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <div className="flex gap-3">
        <label htmlFor="url-input" className="sr-only">URL to shorten</label>
        <input
          id="url-input"
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://example.com/some/long/url?with=params"
          className="flex-1 px-4 py-3 rounded-lg border border-neutral-200 bg-white text-sm font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        >
          {isLoading ? "..." : "Shorten"}
        </button>
      </div>

      <div className="flex gap-3">
        <label htmlFor="alias-input" className="sr-only">Custom alias</label>
        <input
          id="alias-input"
          type="text"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
          placeholder="Custom alias (optional)"
          className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
          disabled={isLoading}
        />
        <label htmlFor="expiry-select" className="sr-only">Expiration</label>
        <select
          id="expiry-select"
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
  );
}
