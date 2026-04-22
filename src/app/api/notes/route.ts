import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { ApiError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth-helpers";

interface NoteRow {
  id: string;
  content: string;
  created_at: string;
  expires_at: string | null;
}

const MAX_CONTENT_LENGTH = 10240;

export async function POST(request: Request) {
  try {
    await requireAuth();

    let body: { content?: string; expires_in?: number };
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const { content, expires_in } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      throw new ApiError(400, "CONTENT_REQUIRED", "Content is required");
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      throw new ApiError(400, "CONTENT_TOO_LONG", "Content must be under 10KB");
    }

    const id = generateId();
    let expiresAt: string | null = null;

    if (expires_in && typeof expires_in === "number" && expires_in > 0) {
      const expiry = new Date(Date.now() + expires_in * 1000);
      expiresAt = expiry.toISOString().replace("T", " ").slice(0, 19);
    }

    db.prepare("INSERT INTO notes (id, content, expires_at) VALUES (?, ?, ?)").run(
      id,
      content.trim(),
      expiresAt
    );

    const note = db
      .prepare("SELECT id, content, created_at FROM notes WHERE id = ?")
      .get(id) as NoteRow;

    return NextResponse.json({ data: note }, { status: 201 });
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
