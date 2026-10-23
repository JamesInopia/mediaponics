import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api-errors";
import {
  listAssetGroups,
  listAssets,
  parseAssetListParams,
} from "@/lib/asset-queries";

export async function GET(request: NextRequest) {
  try {
    const params = parseAssetListParams(request.nextUrl.searchParams);
    const body = params.type
      ? await listAssets(params)
      : await listAssetGroups(params);
    return NextResponse.json(body);
  } catch (err) {
    console.error("GET /api/v1/assets failed", err);
    return apiError("internal_error", "Something went wrong.", 500);
  }
}
