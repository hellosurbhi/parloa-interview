import { getRedis } from "./redis";
import { ApiError } from "./errors";
import type { ShortenedUrl } from "./types";

interface StoredUrl {
  original_url: string;
  user_id: string;
  created_at: string;
  expires_at: string | null;
}

function redis() {
  const r = getRedis();
  if (!r) throw new ApiError(503, "REDIS_UNAVAILABLE", "Storage is unavailable");
  return r;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt + "Z") <= new Date();
}

export async function createUrl(
  shortCode: string,
  originalUrl: string,
  userId: string,
  expiresAt: string | null
): Promise<StoredUrl> {
  const r = redis();
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  const data: StoredUrl = {
    original_url: originalUrl,
    user_id: userId,
    created_at: now,
    expires_at: expiresAt,
  };

  const existing = await r.get(`url:${shortCode}`);
  if (existing) {
    throw new ApiError(409, "ALIAS_TAKEN", "This alias is already in use");
  }

  await r.set(`url:${shortCode}`, JSON.stringify(data));

  if (expiresAt) {
    const ttl = Math.max(
      1,
      Math.floor((new Date(expiresAt + "Z").getTime() - Date.now()) / 1000)
    );
    await r.expire(`url:${shortCode}`, ttl);
  }

  await r.zadd(`user:${userId}:urls`, {
    score: Date.now(),
    member: shortCode,
  });

  return data;
}

export async function getUrlForRedirect(
  shortCode: string
): Promise<{ original_url: string } | null> {
  const r = redis();
  const raw = await r.get<string>(`url:${shortCode}`);
  if (!raw) return null;

  const data: StoredUrl = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as StoredUrl);

  if (isExpired(data.expires_at)) {
    await r.del(`url:${shortCode}`);
    if (data.user_id) {
      await r.zrem(`user:${data.user_id}:urls`, shortCode);
    }
    throw new ApiError(410, "URL_EXPIRED", "This short URL has expired");
  }

  return { original_url: data.original_url };
}

export async function listUserUrls(
  userId: string,
  origin: string
): Promise<ShortenedUrl[]> {
  const r = redis();
  const shortCodes = await r.zrange(`user:${userId}:urls`, 0, -1, {
    rev: true,
  });

  if (!shortCodes.length) return [];

  const pipeline = r.pipeline();
  for (const code of shortCodes) {
    pipeline.get(`url:${code}`);
  }
  const results = await pipeline.exec();

  const urls: ShortenedUrl[] = [];
  const toRemove: string[] = [];

  for (let i = 0; i < shortCodes.length; i++) {
    const raw = results[i];
    if (!raw) {
      toRemove.push(shortCodes[i] as string);
      continue;
    }

    const data: StoredUrl = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as StoredUrl);

    urls.push({
      short_code: shortCodes[i] as string,
      original_url: data.original_url,
      short_url: `${origin}/${shortCodes[i]}`,
      created_at: data.created_at,
      expires_at: data.expires_at,
    });
  }

  if (toRemove.length) {
    await r.zrem(`user:${userId}:urls`, ...toRemove);
  }

  return urls;
}

export async function deleteUrl(
  shortCode: string,
  userId: string
): Promise<void> {
  const r = redis();
  const raw = await r.get<string>(`url:${shortCode}`);

  if (!raw) {
    throw new ApiError(404, "URL_NOT_FOUND", "Short URL not found");
  }

  const data: StoredUrl = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as StoredUrl);

  if (!data.user_id || data.user_id !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You can only delete your own URLs");
  }

  await r.del(`url:${shortCode}`);
  await r.zrem(`user:${userId}:urls`, shortCode);
}
