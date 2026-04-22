import { NextResponse } from "next/server";
import { generateShortCode } from "@/lib/utils";
import { ApiError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth-helpers";
import { createUrl, listUserUrls } from "@/lib/url-store";
import type { ShortenedUrl } from "@/lib/types";

const ALIAS_PATTERN = /^[a-zA-Z0-9-]{3,30}$/;
const RESERVED = ["api", "auth", "login", "logout", "admin"];

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
    throw new ApiError(
      400,
      "INVALID_PROTOCOL",
      "Only HTTP and HTTPS URLs are allowed"
    );
  }

  return trimmed;
}

function validateAlias(alias: unknown): string {
  if (typeof alias !== "string") {
    throw new ApiError(400, "INVALID_ALIAS", "Alias must be a string");
  }
  const trimmed = alias.trim().toLowerCase();
  if (!ALIAS_PATTERN.test(trimmed)) {
    throw new ApiError(
      400,
      "INVALID_ALIAS_FORMAT",
      "Alias must be 3-30 characters, alphanumeric and hyphens only"
    );
  }
  if (RESERVED.includes(trimmed)) {
    throw new ApiError(400, "RESERVED_ALIAS", "This alias is reserved");
  }
  return trimmed;
}

function parseExpiration(expiresIn: unknown): string | null {
  if (!expiresIn || typeof expiresIn !== "number" || expiresIn <= 0) return null;
  const d = new Date(Date.now() + expiresIn * 1000);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function buildOrigin(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? new URL(request.url).host;
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const originalUrl = validateUrl(body.url);
    const expiresAt = parseExpiration(body.expires_in);

    let shortCode: string;
    if (body.custom_alias) {
      shortCode = validateAlias(body.custom_alias);
    } else {
      shortCode = await generateShortCode();
    }

    const stored = await createUrl(shortCode, originalUrl, user.id, expiresAt);

    const origin = buildOrigin(request);
    const data: ShortenedUrl = {
      short_code: shortCode,
      original_url: stored.original_url,
      short_url: `${origin}/${shortCode}`,
      created_at: stored.created_at,
      expires_at: stored.expires_at,
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
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const origin = buildOrigin(request);
    const data = await listUserUrls(user.id, origin);

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
