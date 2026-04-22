import { nanoid } from "nanoid";
import { getRedis } from "./redis";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COUNTER_KEY = "url:id_counter";
const COUNTER_START = 100000;

export function generateId(): string {
  return nanoid(10);
}

export function base62Encode(num: number): string {
  if (num === 0) return BASE62[0];
  let result = "";
  while (num > 0) {
    result = BASE62[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

export async function generateShortCode(): Promise<string> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Redis is required for short code generation");
  }
  await redis.setnx(COUNTER_KEY, COUNTER_START);
  const count = await redis.incr(COUNTER_KEY);
  return base62Encode(count);
}
