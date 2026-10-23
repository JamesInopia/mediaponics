import { NextResponse } from "next/server";
import type { ApiError, ApiErrorCode } from "@/lib/api-types";

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json<ApiError>({ error: { code, message } }, { status });
}
