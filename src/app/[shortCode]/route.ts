import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/redis";

const SHORT_CODE_PATTERN = /^[a-zA-Z0-9_-]{1,30}$/;

interface CachedUrl {
  original_url: string;
  expires_at: string | null;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt + (expiresAt.endsWith("Z") ? "" : "Z"));
  return expiry <= new Date();
}

export async function GET(
  _request: Request,
  { params }: { params: { shortCode: string } }
) {
  const { shortCode } = params;

  if (!SHORT_CODE_PATTERN.test(shortCode)) {
    return NextResponse.json(
      { error: { code: "URL_NOT_FOUND", message: "Short URL not found" } },
      { status: 404 }
    );
  }

  const redis = getRedis();
  const cacheKey = `url:${shortCode}`;

  // Check Redis cache first
  if (redis) {
    try {
      const cached = await redis.get<CachedUrl>(cacheKey);
      if (cached) {
        if (isExpired(cached.expires_at)) {
          db.prepare("DELETE FROM urls WHERE short_code = ?").run(shortCode);
          await redis.del(cacheKey);
          return NextResponse.json(
            {
              error: {
                code: "URL_EXPIRED",
                message: "This short URL has expired",
              },
            },
            { status: 410 }
          );
        }
        return NextResponse.redirect(cached.original_url, 302);
      }
    } catch {
      // Redis error — fall through to SQLite
    }
  }

  // Fall back to SQLite
  const row = db
    .prepare("SELECT original_url, expires_at FROM urls WHERE short_code = ?")
    .get(shortCode) as
    | { original_url: string; expires_at: string | null }
    | undefined;

  if (!row) {
    return NextResponse.json(
      { error: { code: "URL_NOT_FOUND", message: "Short URL not found" } },
      { status: 404 }
    );
  }

  if (isExpired(row.expires_at)) {
    db.prepare("DELETE FROM urls WHERE short_code = ?").run(shortCode);
    return NextResponse.json(
      {
        error: { code: "URL_EXPIRED", message: "This short URL has expired" },
      },
      { status: 410 }
    );
  }

  // Populate cache
  if (redis) {
    try {
      const ttl = row.expires_at
        ? Math.max(
            1,
            Math.floor(
              (new Date(row.expires_at + "Z").getTime() - Date.now()) / 1000
            )
          )
        : 3600;
      await redis.set(
        cacheKey,
        { original_url: row.original_url, expires_at: row.expires_at },
        { ex: ttl }
      );
    } catch {
      // best effort
    }
  }

  return NextResponse.redirect(row.original_url, 302);
}
