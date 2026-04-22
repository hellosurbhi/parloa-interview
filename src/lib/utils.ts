import { nanoid } from "nanoid";

export function generateId(): string {
  return nanoid(10);
}

export function generateShortCode(): string {
  return nanoid(7);
}
