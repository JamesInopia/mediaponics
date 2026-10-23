export type LinkStatus = "ok" | "gone" | "unknown";

/**
 * Generic link checker for sources without a batch "does this still exist" API.
 * Only a definite 404/410 counts as "gone". Timeouts, 5xx, 429, 403 and network errors are
 * "unknown" so a flaky afternoon never removes records.
 */
export async function checkUrl(
  url: string,
  opts: { userAgent: string; fetchFn?: typeof fetch; timeoutMs?: number },
): Promise<LinkStatus> {
  const fetchFn = opts.fetchFn ?? fetch;
  const init = (method: "HEAD" | "GET"): RequestInit => ({
    method,
    redirect: "follow",
    headers: { "User-Agent": opts.userAgent },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
  });
  try {
    let res = await fetchFn(url, init("HEAD"));
    // Some servers reject HEAD; confirm with GET before judging.
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetchFn(url, init("GET"));
      void res.body?.cancel();
    }
    if (res.status === 404 || res.status === 410) return "gone";
    if (res.status >= 200 && res.status < 400) return "ok";
    return "unknown";
  } catch {
    return "unknown";
  }
}
