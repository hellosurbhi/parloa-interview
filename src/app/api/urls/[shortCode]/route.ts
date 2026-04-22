import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { ApiError } from "@/lib/errors";
import { deleteUrl } from "@/lib/url-store";

export async function DELETE(
  _request: Request,
  { params }: { params: { shortCode: string } }
) {
  try {
    const user = await requireAuth();
    await deleteUrl(params.shortCode, user.id);
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
