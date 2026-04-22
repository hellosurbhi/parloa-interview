import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateId } from "@/lib/utils";

interface NoteRow {
  id: string;
  content: string;
  created_at: string;
  expires_at: string | null;
}

export async function POST(request: NextRequest) {
  let body: { content?: string; expires_in?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { content, expires_in } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const id = generateId();
  let expiresAt: string | null = null;

  if (expires_in && typeof expires_in === "number" && expires_in > 0) {
    const expiry = new Date(Date.now() + expires_in * 1000);
    expiresAt = expiry.toISOString().replace("T", " ").replace("Z", "");
  }

  const stmt = db.prepare(
    "INSERT INTO notes (id, content, expires_at) VALUES (?, ?, ?)"
  );
  stmt.run(id, content.trim(), expiresAt);

  const note = db
    .prepare("SELECT id, content, created_at FROM notes WHERE id = ?")
    .get(id) as NoteRow;

  return NextResponse.json(note, { status: 201 });
}
