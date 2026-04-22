import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateShortCode } from "@/lib/utils";
import { ApiError } from "@/lib/errors";
import type { ShortenedUrl } from "@/lib/types";

function validateUrl(url: unknown): string {
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    throw new ApiError(400, "URL_REQUIRED", "URL is required");
  }

  const trimmed = url.trim();

  if (trimmed.length > 2048) {
    throw new ApiError(400, "URL_TOO_LONG", "URL must be under 2048 characters");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ApiError(400, "INVALID_URL", "The provided string is not a valid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ApiError(400, "INVALID_PROTOCOL", "Only HTTP and HTTPS URLs are allowed");
  }

  return trimmed;
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const originalUrl = validateUrl(body.url);

    let shortCode = generateShortCode();
    let attempts = 0;
    const existing = db.prepare("SELECT 1 FROM urls WHERE short_code = ?");
    while (existing.get(shortCode) && attempts < 3) {
      shortCode = generateShortCode();
      attempts++;
    }

    const stmt = db.prepare(
      "INSERT INTO urls (short_code, original_url) VALUES (?, ?)"
    );
    stmt.run(shortCode, originalUrl);

    const row = db.prepare(
      "SELECT short_code, original_url, created_at FROM urls WHERE short_code = ?"
    ).get(shortCode) as { short_code: string; original_url: string; created_at: string };

    const headers = new Headers(request.headers);
    const proto = headers.get("x-forwarded-proto") ?? "https";
    const host = headers.get("host") ?? new URL(request.url).host;

    const data: ShortenedUrl = {
      short_code: row.short_code,
      original_url: row.original_url,
      short_url: `${proto}://${host}/${row.short_code}`,
      created_at: row.created_at,
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
