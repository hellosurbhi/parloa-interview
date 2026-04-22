import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth-helpers";

interface NoteRow {
  id: string;
  content: string;
  created_at: string;
  expires_at: string | null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const note = db
      .prepare("SELECT * FROM notes WHERE id = ?")
      .get(params.id) as NoteRow | undefined;

    if (!note) {
      throw new ApiError(404, "NOTE_NOT_FOUND", "Note not found");
    }

    if (note.expires_at) {
      const expiresAt = new Date(note.expires_at + "Z");
      if (expiresAt <= new Date()) {
        db.prepare("DELETE FROM notes WHERE id = ?").run(note.id);
        throw new ApiError(410, "NOTE_EXPIRED", "Note has expired");
      }
    }

    return NextResponse.json({
      data: {
        id: note.id,
        content: note.content,
        created_at: note.created_at,
        expires_at: note.expires_at,
      },
    });
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    db.prepare("DELETE FROM notes WHERE id = ?").run(params.id);
    return new NextResponse(null, { status: 204 });
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
