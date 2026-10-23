import { type NextRequest } from "next/server";
import { apiError } from "@/lib/api-errors";
import { CACHE, cachedJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { getStatus } from "@/lib/status-queries";

export async function GET(request: NextRequest) {
  const limited = await rateLimit(request);
  if (limited) return limited;
  try {
    return cachedJson(await getStatus(), CACHE.status);
  } catch (err) {
    console.error("GET /api/v1/status failed", err);
    const res = apiError("internal_error", "Something went wrong.", 500);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
