import { unstable_rethrow } from "next/navigation";
import { type NextRequest } from "next/server";
import { apiError } from "@/lib/api-errors";
import {
  listAssetGroups,
  listAssets,
  parseAssetListParams,
} from "@/lib/asset-queries";
import { CACHE, cachedJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = await rateLimit(request);
  if (limited) return limited;
  try {
    const params = parseAssetListParams(request.nextUrl.searchParams);
    const body = params.type
      ? await listAssets(params)
      : await listAssetGroups(params);
    return cachedJson(body, CACHE.list);
  } catch (err) {
    unstable_rethrow(err);
    console.error("GET /api/v1/assets failed", err);
    const res = apiError("internal_error", "Something went wrong.", 500);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}