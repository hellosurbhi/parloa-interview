import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{5,7}$/;

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

  const row = db.prepare(
    "SELECT original_url FROM urls WHERE short_code = ?"
  ).get(shortCode) as { original_url: string } | undefined;

  if (!row) {
    return NextResponse.json(
      { error: { code: "URL_NOT_FOUND", message: "Short URL not found" } },
      { status: 404 }
    );
  }

  return NextResponse.redirect(row.original_url, 301);
}
