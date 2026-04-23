"use client";

import { useState } from "react";
import type { ShortenedUrl } from "@/lib/types";

function prettyUrl(fullUrl: string): string {
  try {
    const u = new URL(fullUrl);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${host}${path}${u.search}`;
  } catch {
    return fullUrl;
  }
}

function timeUntil(expiresAt: string): string {
  const diff = new Date(expiresAt + "Z").getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.ceil(diff / 60000)}m left`;
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

interface UrlListProps {
  urls: ShortenedUrl[];
  onDelete: (shortCode: string) => void;
  onError: (message: string) => void;
}

export default function UrlList({ urls, onDelete, onError }: UrlListProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(shortUrl: string, shortCode: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(shortCode);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      onError("Failed to copy to clipboard");
    }
  }

  return (
    <div className="w-full mt-8 animate-reveal-delay">
      <div className="h-px bg-neutral-200 mb-6" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-500 font-[family-name:var(--font-geist-mono)]">
          Your links ({urls.length})
        </h2>
      </div>

      {urls.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-8 font-[family-name:var(--font-geist-mono)]">
          No shortened URLs yet
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-2.5 text-xs tracking-[0.15em] uppercase text-neutral-500 font-medium font-[family-name:var(--font-geist-mono)]">
                  Short URL
                </th>
                <th className="text-left px-4 py-2.5 text-xs tracking-[0.15em] uppercase text-neutral-500 font-medium font-[family-name:var(--font-geist-mono)] hidden sm:table-cell">
                  Original
                </th>
                <th className="text-left px-4 py-2.5 text-xs tracking-[0.15em] uppercase text-neutral-500 font-medium font-[family-name:var(--font-geist-mono)]">
                  Expiry
                </th>
                <th className="text-right px-4 py-2.5 text-xs tracking-[0.15em] uppercase text-neutral-500 font-medium font-[family-name:var(--font-geist-mono)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url, i) => {
                const expiryText = url.expires_at
                  ? timeUntil(url.expires_at)
                  : null;
                const isExpired = expiryText === "Expired";

                return (
                  <tr
                    key={url.short_code}
                    className={`border-b border-neutral-100 last:border-0 ${
                      i % 2 === 1 ? "bg-neutral-50/50" : "bg-white"
                    } ${isExpired ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <a
                        href={url.short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-neutral-900 font-[family-name:var(--font-geist-mono)] hover:underline"
                      >
                        /{url.short_code}
                      </a>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] text-neutral-500 hidden sm:table-cell">
                      <a
                        href={url.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={url.original_url}
                        aria-label={`Open original URL: ${url.original_url}`}
                        className="block truncate hover:text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-sm"
                      >
                        {prettyUrl(url.original_url)}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {expiryText ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-[family-name:var(--font-geist-mono)] ${
                            isExpired
                              ? "bg-red-50 text-red-500"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {expiryText}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-[family-name:var(--font-geist-mono)]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            handleCopy(url.short_url, url.short_code)
                          }
                          className="w-[4.5rem] text-center text-xs px-3 py-2 rounded border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors font-[family-name:var(--font-geist-mono)] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                        >
                          {copied === url.short_code ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => onDelete(url.short_code)}
                          className="text-xs px-3 py-2 rounded border border-neutral-200 text-red-500 hover:text-red-600 hover:border-red-300 transition-colors font-[family-name:var(--font-geist-mono)] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
