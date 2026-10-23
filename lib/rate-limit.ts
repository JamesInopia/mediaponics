import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-errors";

/**
 * Per-IP sliding window. In-memory counters don't work on serverless (each instance has its own),
 * so the counter lives in Upstash Redis. If the env vars are absent (local dev) or Redis is down,
 * requests are allowed: rate limiting must never take the API down.
 */
const limiter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "mediaponics:api",
      })
    : null;

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
  if (!limiter) return null;
  try {
    const r = await limiter.limit(clientIp(request));
    if (r.success) return null;
    const res = apiError("rate_limited", "Too many requests. Please slow down.", 429);
    res.headers.set("Retry-After", String(Math.max(1, Math.ceil((r.reset - Date.now()) / 1000))));
    res.headers.set("X-RateLimit-Limit", String(r.limit));
    res.headers.set("X-RateLimit-Remaining", "0");
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    console.error("rate limiter unavailable, allowing request", err);
    return null;
  }
}
