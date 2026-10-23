import { unstable_rethrow } from "next/navigation";
import { type NextRequest } from "next/server";
import { apiError } from "@/lib/api-errors";
import { getAsset } from "@/lib/asset-queries";
import { CACHE, cachedJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await rateLimit(request);
  if (limited) return limited;
  try {
    const { id } = await params;
    const asset = await getAsset(id);
    if (!asset) {
      const res = apiError("not_found", "Asset not found.", 404);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
    return cachedJson(asset, CACHE.item);
  } catch (err) {
    unstable_rethrow(err);
    console.error("GET /api/v1/assets/[id] failed", err);
    const res = apiError("internal_error", "Something went wrong.", 500);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}