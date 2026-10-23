import { NextResponse } from "next/server";

/**
 * Data only changes when the ingestion job runs (daily), so a short shared-cache window is safe:
 * the CDN serves repeats without hitting the database (or the rate limiter), and
 * stale-while-revalidate hides the refresh latency.
 */
export const CACHE = {
  list: "public, max-age=30, s-maxage=300, stale-while-revalidate=3600",
  item: "public, max-age=60, s-maxage=600, stale-while-revalidate=86400",
  status: "public, max-age=15, s-maxage=60, stale-while-revalidate=300",
} as const;

export function cachedJson<T>(body: T, cacheControl: string, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", cacheControl);
  return res;
}
