import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";
import { ApiError } from "@/lib/errors";
import { getRedis } from "@/lib/redis";

export async function DELETE(
  _request: Request,
  { params }: { params: { shortCode: string } }
) {
  try {
    const user = await requireAuth();
    const { shortCode } = params;

    const row = db
      .prepare("SELECT user_id FROM urls WHERE short_code = ?")
      .get(shortCode) as { user_id: string | null } | undefined;

    if (!row) {
      throw new ApiError(404, "URL_NOT_FOUND", "Short URL not found");
    }

    if (row.user_id !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You can only delete your own URLs");
    }

    db.prepare("DELETE FROM urls WHERE short_code = ?").run(shortCode);

    const redis = getRedis();
    if (redis) {
      try {
        await redis.del(`url:${shortCode}`);
      } catch {
        // best effort cache invalidation
      }
    }

    return new NextResponse(null, { status: 204 });
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
