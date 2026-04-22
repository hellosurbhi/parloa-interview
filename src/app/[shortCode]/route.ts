import { NextResponse } from "next/server";
import { ApiError } from "@/lib/errors";
import { getUrlForRedirect } from "@/lib/url-store";

const SHORT_CODE_PATTERN = /^[a-zA-Z0-9_-]{1,30}$/;

export async function GET(
  _request: Request,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;

    if (!SHORT_CODE_PATTERN.test(shortCode)) {
      return NextResponse.json(
        { error: { code: "URL_NOT_FOUND", message: "Short URL not found" } },
        { status: 404 }
      );
    }

    const result = await getUrlForRedirect(shortCode);

    if (!result) {
      return NextResponse.json(
        { error: { code: "URL_NOT_FOUND", message: "Short URL not found" } },
        { status: 404 }
      );
    }

    return NextResponse.redirect(result.original_url, 302);
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
