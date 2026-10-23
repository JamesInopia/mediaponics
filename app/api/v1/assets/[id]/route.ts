import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api-errors";
import { getAsset } from "@/lib/asset-queries";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const asset = await getAsset(id);
    if (!asset) return apiError("not_found", "Asset not found.", 404);
    return NextResponse.json(asset);
  } catch (err) {
    console.error("GET /api/v1/assets/[id] failed", err);
    return apiError("internal_error", "Something went wrong.", 500);
  }
}
