import type { Asset, AssetType } from "@/lib/assets";
import { mapCommonsLicense, requiresAttribution } from "../licenses.ts";
import type { Skip } from "../types.ts";

/**
 * Wikimedia Commons adapter.
 * Source rules (https://www.mediawiki.org/wiki/API:Etiquette and
 * https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia):
 */

const API = "https://commons.wikimedia.org/w/api.php";
const SOURCE = "commons" as const;

export const DEFAULT_CATEGORIES = [
  "Category:Featured media",
  "Category:Featured pictures on Wikimedia Commons",
];


type MetaField = { value?: string };
export type WikiPage = {
  pageid: number;
  title: string;
  imageinfo?: {
    url?: string;
    descriptionurl?: string;
    thumburl?: string;
    mime?: string;
    mediatype?: string;
    timestamp?: string;
    duration?: number;
    extmetadata?: Record<string, MetaField>;
  }[];
};

type ApiResponse = {
  continue?: Record<string, string>;
  query?: { pages?: WikiPage[] };
  error?: { code: string; info?: string };
};


const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const HIDDEN = /<(\w+)\b[^>]*style\s*=\s*"[^"]*display\s*:\s*none[^"]*"[^>]*>[\s\S]*?<\/\1>/gi;

export function htmlToText(html: string | undefined): string {
  if (!html) return "";
  let h = html;
  for (let i = 0; i < 5; i++) {
    const next = h.replace(HIDDEN, " ");
    if (next === h) break;
    h = next;
  }
  return h
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

const MARKUP_JUNK = /QS:[A-Za-z]|\([A-Z][a-z]+:|^[A-Z][a-z]{2,}(?: [a-z]+)?:\s/;

const MAX_TITLE = 120;

function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:-]+$/, "") + "…";
}

function titleFromFile(fileTitle: string): string {
  return fileTitle
    .replace(/^File:/i, "")
    .replace(/\.[A-Za-z0-9]{2,5}$/, "")
    .replace(/_/g, " ")
    .trim();
}

const UNKNOWN_CREATOR = /^(unknown|anonymous|n\/a|none|\?+|unknown (author|photographer|artist))\b/i;
const MAX_CREATOR = 300;
const MAX_TAGS = 8;

function classify(
  mediatype: string | undefined,
  mime: string | undefined,
  categories: string[],
): { type: AssetType } | { skip: "unsupported_media_type" | "audio_type_unclear" } {
  const m = (mime ?? "").toLowerCase();

  if (mediatype === "DRAWING" || m === "image/svg+xml") return { type: "Vectors" };
  if (m === "image/gif") return { type: "GIFs" };
  if (mediatype === "BITMAP" && ["image/jpeg", "image/png", "image/webp"].includes(m)) {
    return { type: "Images" };
  }
  if (mediatype === "VIDEO" && ["video/webm", "video/ogg", "application/ogg", "video/mp4"].includes(m)) {
    return { type: "Stock Footage" };
  }
  if (mediatype === "AUDIO") {
    const cats = categories.join(" | ").toLowerCase();
    if (/sound effect|sfx|foley/.test(cats)) return { type: "Sound Effects" };
    if (/\bmusic\b|musical|\bsongs?\b|\binstrument/.test(cats)) return { type: "Music" };
    return { skip: "audio_type_unclear" }; // Commons has no Music vs SFX field; do not guess
  }
  return { skip: "unsupported_media_type" };
}

export function normalizePage(
  page: WikiPage,
  fetchedAt: string,
): { asset: Asset } | { skip: Skip } {
  const sourceId = String(page.pageid);
  const fallbackTitle = titleFromFile(page.title);
  const skip = (reason: Skip["reason"], detail?: string): { skip: Skip } => ({
    skip: { source: SOURCE, sourceId, title: fallbackTitle, reason, detail },
  });

  const info = page.imageinfo?.[0];
  if (!info) return skip("no_imageinfo");
  const meta = info.extmetadata ?? {};
  const val = (k: string) => meta[k]?.value;

  const restrictions = htmlToText(val("Restrictions"));
  if (restrictions) return skip("restricted", restrictions);

  const lic = mapCommonsLicense(val("LicenseShortName"));
  if (!lic.ok) return skip(lic.reason, lic.detail);

  let creator = htmlToText(val("Artist")).replace(/^File:[^:]*?\.[A-Za-z0-9]{2,5}:\s*/i, "");
  if (!creator || UNKNOWN_CREATOR.test(creator)) {
    if (requiresAttribution(lic.license)) return skip("missing_creator");
    creator = "Unknown";
  }
  if (creator.length > MAX_CREATOR) return skip("creator_unusable", `${creator.length} chars`);
  if (MARKUP_JUNK.test(creator)) return skip("creator_unusable", creator.slice(0, 80));

  const categories = (val("Categories") ?? "").split("|").map((c) => c.trim()).filter(Boolean);
  const cls = classify(info.mediatype, info.mime, categories);
  if ("skip" in cls) return skip(cls.skip, `${info.mediatype ?? "?"} ${info.mime ?? "?"}`);

  const sourceUrl = info.descriptionurl;
  if (!sourceUrl) return skip("no_preview", "missing descriptionurl");

  const previewUrl = cls.type === "Music" || cls.type === "Sound Effects" ? info.url : info.thumburl;
  if (!previewUrl) return skip("no_preview");

  const objectName = htmlToText(val("ObjectName"));
  const title = shorten(objectName && !MARKUP_JUNK.test(objectName) ? objectName : fallbackTitle, MAX_TITLE);
  const hasDuration = typeof info.duration === "number" && info.duration > 0;

  const asset: Asset = {
    id: `${SOURCE}:${sourceId}`,
    source: SOURCE,
    sourceId,
    title,
    creator,
    type: cls.type,
    ...(hasDuration ? { durationSec: Math.round(info.duration!) } : {}),
    license: lic.license,
    ...(lic.version ? { licenseVersion: lic.version } : {}),
    sourceUrl,
    previewUrl,
    tags: categories.slice(0, MAX_TAGS),
    addedAt: info.timestamp ?? fetchedAt,
    fetchedAt,
  };
  return { asset };
}


export type FetchOptions = {
  userAgent: string;
  categories?: string[];
  limit: number;
  maxRequestsPerCategory?: number;
  delayMs?: number;
  fetchFn?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => Date;
  onProgress?: (msg: string) => void;
};

export type FetchResult = {
  assets: Asset[];
  skips: Skip[];
  requests: number;
  perCategory: Record<string, { seen: number; accepted: number }>;
};

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function apiGet(
  params: Record<string, string>,
  o: Required<Pick<FetchOptions, "userAgent" | "fetchFn" | "sleep">>,
): Promise<ApiResponse> {
  const url = `${API}?${new URLSearchParams(params)}`;
  let wait = 5000;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await o.fetchFn(url, {
      headers: { "User-Agent": o.userAgent, Accept: "application/json" },
    });
    const retryAfter = Number(res.headers.get("retry-after"));
    if (res.status === 429 || res.status === 503) {
      await o.sleep(retryAfter > 0 ? retryAfter * 1000 : wait);
      wait *= 2;
      continue;
    }
    if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
    const body = (await res.json()) as ApiResponse;
    if (body.error?.code === "maxlag" || body.error?.code === "ratelimited") {
      await o.sleep(retryAfter > 0 ? retryAfter * 1000 : wait);
      wait *= 2;
      continue;
    }
    if (body.error) throw new Error(`Commons API error ${body.error.code}: ${body.error.info ?? ""}`);
    return body;
  }
  throw new Error("Commons API still lagging or rate limited after 5 attempts");
}

export async function fetchWikimediaAssets(opts: FetchOptions): Promise<FetchResult> {
  const categories = opts.categories?.length ? opts.categories : DEFAULT_CATEGORIES;
  const delayMs = opts.delayMs ?? 1000;
  const maxReq = opts.maxRequestsPerCategory ?? 40;
  const sleep = opts.sleep ?? realSleep;
  const now = opts.now ?? (() => new Date());
  const io = { userAgent: opts.userAgent, fetchFn: opts.fetchFn ?? fetch, sleep };

  const result: FetchResult = { assets: [], skips: [], requests: 0, perCategory: {} };
  const seenIds = new Set<string>();

  for (const [index, category] of categories.entries()) {
    const perCategoryLimit = Math.ceil((opts.limit - result.assets.length) / (categories.length - index));
    const stats = { seen: 0, accepted: 0 };
    result.perCategory[category] = stats;
    let cont: Record<string, string> | undefined;
    let requestsHere = 0;

    while (stats.accepted < perCategoryLimit && requestsHere < maxReq) {
      const body = await apiGet(
        {
          action: "query",
          format: "json",
          formatversion: "2",
          maxlag: "5",
          generator: "categorymembers",
          gcmtitle: category,
          gcmtype: "file",
          gcmlimit: "50",
          prop: "imageinfo",
          iiprop: "url|size|mime|mediatype|timestamp|extmetadata",
          iiurlwidth: "640",
          iiextmetadatafilter:
            "ObjectName|Artist|LicenseShortName|Restrictions|Categories",
          ...cont,
        },
        io,
      );
      result.requests++;
      requestsHere++;

      const fetchedAt = now().toISOString();
      for (const page of body.query?.pages ?? []) {
        const id = String(page.pageid);
        if (seenIds.has(id)) continue; 
        seenIds.add(id);
        stats.seen++;
        const out = normalizePage(page, fetchedAt);
        if ("skip" in out) {
          result.skips.push(out.skip);
        } else if (stats.accepted < perCategoryLimit) {
          result.assets.push(out.asset);
          stats.accepted++;
        }
      }
      opts.onProgress?.(
        `${category}: ${stats.accepted}/${perCategoryLimit} accepted, ${stats.seen} seen`,
      );

      cont = body.continue;
      if (!cont) break;
      await sleep(delayMs);
    }
  }
  return result;
}
