import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface NoteRow {
  id: string;
  content: string;
  created_at: string;
  expires_at: string | null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const note = db
    .prepare("SELECT * FROM notes WHERE id = ?")
    .get(params.id) as NoteRow | undefined;

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (note.expires_at) {
    const expiresAt = new Date(note.expires_at + "Z");
    if (expiresAt <= new Date()) {
      db.prepare("DELETE FROM notes WHERE id = ?").run(note.id);
      return NextResponse.json({ error: "Note has expired" }, { status: 410 });
    }
  }

  return NextResponse.json({
    id: note.id,
    content: note.content,
    created_at: note.created_at,
    expires_at: note.expires_at,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  db.prepare("DELETE FROM notes WHERE id = ?").run(params.id);
  return new NextResponse(null, { status: 204 });
}
