import assert from "node:assert/strict";
import { test } from "node:test";
import { mapCommonsLicense } from "./licenses.ts";
import { summarizeSkips } from "./skip-log.ts";
import { contentHash } from "./hash.ts";
import { fetchWikimediaAssets, htmlToText, normalizePage } from "./adapters/wikimedia.ts";
import type { WikiPage } from "./adapters/wikimedia.ts";
import type { SkipReason } from "./types.ts";

const FETCHED = "2026-10-23T00:00:00.000Z";

function page(over: {
  pageid?: number;
  title?: string;
  mime?: string;
  mediatype?: string;
  duration?: number;
  meta?: Record<string, string>;
  noInfo?: boolean;
}): WikiPage {
  const id = over.pageid ?? 1;
  if (over.noInfo) return { pageid: id, title: over.title ?? "File:X.jpg" };
  const meta: Record<string, { value: string }> = {};
  for (const [k, v] of Object.entries({
    ObjectName: "Sunset over bay",
    Artist: '<a href="//commons.wikimedia.org/wiki/User:Ann" title="User:Ann">Ann &amp; Co</a>',
    LicenseShortName: "CC BY-SA 4.0",
    Categories: "Sunsets|Bays|Featured pictures",
    ...over.meta,
  })) {
    if (v !== "__omit__") meta[k] = { value: v };
  }
  return {
    pageid: id,
    title: over.title ?? "File:Sunset_over_bay.jpg",
    imageinfo: [
      {
        url: `https://upload.wikimedia.org/wikipedia/commons/a/ab/F${id}`,
        descriptionurl: `https://commons.wikimedia.org/wiki/File:F${id}`,
        thumburl: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F${id}/640px-F${id}`,
        mime: over.mime ?? "image/jpeg",
        mediatype: over.mediatype ?? "BITMAP",
        timestamp: "2024-05-01T10:00:00Z",
        ...(over.duration !== undefined ? { duration: over.duration } : {}),
        extmetadata: meta,
      },
    ],
  };
}

const asset = (p: WikiPage) => {
  const out = normalizePage(p, FETCHED);
  assert.ok("asset" in out, `expected asset, got ${JSON.stringify(out)}`);
  return out.asset;
};
const skip = (p: WikiPage) => {
  const out = normalizePage(p, FETCHED);
  assert.ok("skip" in out, "expected skip");
  return out.skip;
};

test("license mapping: accepted names", () => {
  assert.deepEqual(mapCommonsLicense("CC BY-SA 4.0"), { ok: true, license: "cc-by-sa", version: "4.0" });
  assert.deepEqual(mapCommonsLicense("CC BY 3.0"), { ok: true, license: "cc-by", version: "3.0" });
  assert.deepEqual(mapCommonsLicense("cc-by-sa 2.5"), { ok: true, license: "cc-by-sa", version: "2.5" });
  assert.deepEqual(mapCommonsLicense("CC0"), { ok: true, license: "cc0", version: "1.0" });
  assert.deepEqual(mapCommonsLicense("CC0 1.0 Universal"), { ok: true, license: "cc0", version: "1.0" });
  assert.deepEqual(mapCommonsLicense("Public domain"), { ok: true, license: "cc0" });
  assert.deepEqual(mapCommonsLicense("CC BY-NC 4.0"), { ok: true, license: "non-commercial", version: "4.0" });
});

test("license mapping: BY-SA is never read as BY", () => {
  const m = mapCommonsLicense("CC BY-SA 3.0");
  assert.ok(m.ok && m.license === "cc-by-sa");
});

test("license mapping: unsure cases are rejected, not guessed", () => {
  for (const name of [
    "CC BY-SA 3.0 de",
    "CC BY-SA 3.0 IGO",
    "CC BY-NC-SA 4.0",
    "CC BY-ND 4.0",
    "GFDL",
    "GFDL 1.2 or later",
    "PD-old-70",
    "Attribution",
    "CC BY",
    "FAL",
  ]) {
    const m = mapCommonsLicense(name);
    assert.ok(!m.ok && m.reason === "unmapped_license", name);
  }
  const none = mapCommonsLicense(undefined);
  assert.ok(!none.ok && none.reason === "missing_license");
});

test("htmlToText strips tags and decodes entities", () => {
  assert.equal(htmlToText('<a href="x">Ann &amp; Co</a>'), "Ann & Co");
  assert.equal(htmlToText("Caf&#233; &quot;Noir&quot;<br/>2020"), 'Café "Noir" 2020');
  assert.equal(htmlToText(undefined), "");
});

test("image: maps fields into the Asset shape", () => {
  const a = asset(page({ pageid: 42 }));
  assert.equal(a.id, "commons:42");
  assert.equal(a.source, "commons");
  assert.equal(a.sourceId, "42");
  assert.equal(a.title, "Sunset over bay");
  assert.equal(a.creator, "Ann & Co");
  assert.equal(a.type, "Images");
  assert.equal(a.license, "cc-by-sa");
  assert.equal(a.licenseVersion, "4.0");
  assert.equal(a.sourceUrl, "https://commons.wikimedia.org/wiki/File:F42");
  assert.ok(a.previewUrl?.startsWith("https://upload.wikimedia.org/"));
  assert.deepEqual(a.tags, ["Sunsets", "Bays", "Featured pictures"]);
  assert.equal(a.addedAt, "2024-05-01T10:00:00Z");
  assert.equal(a.fetchedAt, FETCHED);
  assert.equal(a.durationSec, undefined);
});

test("title falls back to the file name", () => {
  const a = asset(page({ title: "File:Old_harbour_1890.png", mime: "image/png", meta: { ObjectName: "__omit__" } }));
  assert.equal(a.title, "Old harbour 1890");
});

test("media types", () => {
  assert.equal(asset(page({ mime: "image/svg+xml", mediatype: "DRAWING" })).type, "Vectors");
  assert.equal(asset(page({ mime: "image/gif" })).type, "GIFs");
  assert.equal(asset(page({ mime: "video/webm", mediatype: "VIDEO", duration: 12.4 })).type, "Stock Footage");

  const music = asset(page({ mime: "audio/ogg", mediatype: "AUDIO", duration: 95.6, meta: { Categories: "Classical music|Piano" } }));
  assert.equal(music.type, "Music");
  assert.equal(music.durationSec, 96);
  assert.match(music.previewUrl!, /upload\.wikimedia\.org\/wikipedia\/commons\/a\/ab\/F1$/); 

  const sfx = asset(page({ mime: "audio/ogg", mediatype: "AUDIO", duration: 3, meta: { Categories: "Sound effects|Doors" } }));
  assert.equal(sfx.type, "Sound Effects");
});

test("skips: audio that is neither clearly music nor SFX", () => {
  const s = skip(page({ mime: "audio/ogg", mediatype: "AUDIO", meta: { Categories: "Spoken Wikipedia|English" } }));
  assert.equal(s.reason, "audio_type_unclear");
});

test("skips: unsupported media types", () => {
  assert.equal(skip(page({ mime: "image/tiff", mediatype: "BITMAP" })).reason, "unsupported_media_type");
  assert.equal(skip(page({ mime: "application/pdf", mediatype: "OFFICE" })).reason, "unsupported_media_type");
});

test("skips: license problems carry the raw license string", () => {
  const s = skip(page({ meta: { LicenseShortName: "GFDL" } }));
  assert.equal(s.reason, "unmapped_license");
  assert.equal(s.detail, "GFDL");
  assert.equal(skip(page({ meta: { LicenseShortName: "__omit__" } })).reason, "missing_license");
});

test("skips: restrictions, missing imageinfo", () => {
  const r = skip(page({ meta: { Restrictions: "trademarked|personality" } }));
  assert.equal(r.reason, "restricted");
  assert.equal(skip(page({ noInfo: true })).reason, "no_imageinfo");
});

test("creator rules: attribution licenses need one, CC0 does not", () => {
  assert.equal(skip(page({ meta: { Artist: "__omit__" } })).reason, "missing_creator");
  assert.equal(skip(page({ meta: { Artist: "Unknown photographer" } })).reason, "missing_creator");
  const pd = asset(page({ meta: { Artist: "__omit__", LicenseShortName: "CC0" } }));
  assert.equal(pd.creator, "Unknown");
  assert.equal(skip(page({ meta: { Artist: "x".repeat(400) } })).reason, "creator_unusable");
});

test("content hash ignores fetchedAt but catches real changes", () => {
  const a = asset(page({}));
  const later = { ...a, fetchedAt: "2027-01-01T00:00:00.000Z" };
  assert.equal(contentHash(a), contentHash(later));
  assert.notEqual(contentHash(a), contentHash({ ...a, license: "cc-by" }));
  assert.notEqual(contentHash(a), contentHash({ ...a, title: "Other" }));
});

test("fetch: paginates serially, dedupes, sends User-Agent + maxlag, honors limit", async () => {
  const calls: { url: string; ua: string | undefined }[] = [];
  const responses = [
    { continue: { gcmcontinue: "next|1", continue: "gcmcontinue||" }, query: { pages: [page({ pageid: 1 }), page({ pageid: 2, meta: { LicenseShortName: "GFDL" } })] } },
    { query: { pages: [page({ pageid: 2 }), page({ pageid: 3 }), page({ pageid: 4 })] } },
  ];
  let i = 0;
  const fetchFn = (async (url: string, init?: { headers?: Record<string, string> }) => {
    calls.push({ url, ua: init?.headers?.["User-Agent"] });
    const body = responses[i++];
    return { ok: true, status: 200, headers: new Headers(), json: async () => body } as unknown as Response;
  }) as unknown as typeof fetch;
  const sleeps: number[] = [];

  const r = await fetchWikimediaAssets({
    userAgent: "Test/1.0 (test@example.com)",
    categories: ["Category:Test"],
    limit: 3,
    fetchFn,
    sleep: async (ms) => void sleeps.push(ms),
    now: () => new Date(FETCHED),
  });

  assert.equal(r.requests, 2);
  assert.deepEqual(r.assets.map((a) => a.sourceId), ["1", "3", "4"]);
  assert.equal(r.skips.length, 1); 
  assert.equal(r.skips[0].reason, "unmapped_license");
  assert.equal(calls[0].ua, "Test/1.0 (test@example.com)");
  assert.match(calls[0].url, /maxlag=5/);
  assert.match(calls[0].url, /gcmtitle=Category%3ATest/);
  assert.match(calls[1].url, /gcmcontinue=next%7C1/); 
  assert.equal(sleeps.length, 1); 
});

test("fetch: retries on maxlag and 429, then succeeds", async () => {
  let n = 0;
  const fetchFn = (async () => {
    n++;
    if (n === 1) return { ok: false, status: 429, headers: new Headers({ "retry-after": "2" }), json: async () => ({}) } as unknown as Response;
    if (n === 2) return { ok: true, status: 200, headers: new Headers(), json: async () => ({ error: { code: "maxlag" } }) } as unknown as Response;
    return { ok: true, status: 200, headers: new Headers(), json: async () => ({ query: { pages: [page({ pageid: 9 })] } }) } as unknown as Response;
  }) as unknown as typeof fetch;
  const sleeps: number[] = [];
  const r = await fetchWikimediaAssets({
    userAgent: "T/1 (x)", categories: ["Category:T"], limit: 5, fetchFn, sleep: async (ms) => void sleeps.push(ms),
  });
  assert.equal(r.assets.length, 1);
  assert.equal(sleeps[0], 2000); 
  assert.ok(sleeps[1] >= 5000); 
});

test("fetch: stops after the request cap when everything is skipped", async () => {
  let n = 0;
  const fetchFn = (async () => {
    n++;
    return { ok: true, status: 200, headers: new Headers(), json: async () => ({ continue: { gcmcontinue: `p${n}` }, query: { pages: [page({ pageid: 1000 + n, meta: { LicenseShortName: "GFDL" } })] } }) } as unknown as Response;
  }) as unknown as typeof fetch;
  const r = await fetchWikimediaAssets({
    userAgent: "T/1 (x)", categories: ["Category:T"], limit: 10, maxRequestsPerCategory: 3, fetchFn, sleep: async () => {},
  });
  assert.equal(r.requests, 3);
  assert.equal(r.assets.length, 0);
  assert.equal(r.skips.length, 3);
});

test("skip summary counts reasons and ranks unmapped licenses", () => {
  const mk = (reason: SkipReason, detail?: string) => ({ source: "commons", sourceId: "1", title: "t", reason, detail });
  const s = summarizeSkips([mk("unmapped_license", "GFDL"), mk("unmapped_license", "GFDL"), mk("unmapped_license", "FAL"), mk("restricted", "trademarked")]);
  assert.equal(s.total, 4);
  assert.equal(s.byReason.unmapped_license, 3);
  assert.equal(s.byReason.restricted, 1);
  assert.deepEqual(s.topUnmappedLicenses[0], { license: "GFDL", count: 2 });
});

test("content hash treats equivalent timestamps as equal (source vs Postgres format)", () => {
  const a = asset(page({}));
  assert.equal(a.addedAt, "2024-05-01T10:00:00Z");
  const fromDb = { ...a, addedAt: new Date(a.addedAt).toISOString() };
  assert.equal(contentHash(a), contentHash(fromDb));
});

test("hidden structured-data markup is dropped from text", () => {
  const html =
    'Scuola di Atene<span style="display:none">title QS:P1476,it:"Scuola di Atene"label QS:Lit</span> (fresco)';
  assert.equal(htmlToText(html), "Scuola di Atene (fresco)");
});

test("titles: junk or language-labelled ObjectName falls back to the file name", () => {
  const junk = asset(page({ title: "File:The_School_of_Athens.jpg", meta: { ObjectName: 'Italian: Scuola di Atene title QS:P1476,it:"x"' } }));
  assert.equal(junk.title, "The School of Athens");
  const labelled = asset(page({ title: "File:Plain_name.jpg", meta: { ObjectName: "Italiano: Una cosa" } }));
  assert.equal(labelled.title, "Plain name");
});

test("titles: long ones are cut at a word boundary with an ellipsis", () => {
  const long = "Photograph made from a flying fortress of the eighth bomber command when they attacked the vital ball-bearing plant and the nearby engine repair depot in Paris";
  const a = asset(page({ meta: { ObjectName: long } }));
  assert.ok(a.title.length <= 121);
  assert.ok(a.title.endsWith("…"));
  assert.ok(long.startsWith(a.title.slice(0, -1)));
});

test("creator that is really a labelled description is skipped", () => {
  const s = skip(page({ meta: { Artist: 'Qajar Persia Gol o bolbol (English:"Rose and Nightingale") motif' } }));
  assert.equal(s.reason, "creator_unusable");
});

test("fetch: an empty category hands its share to the next one", async () => {
  const bodies: Record<string, unknown> = {
    "Category:Empty": { query: { pages: [] } },
    "Category:Full": { query: { pages: Array.from({ length: 10 }, (_, i) => page({ pageid: 500 + i })) } },
  };
  const fetchFn = (async (url: string) => {
    const title = new URL(url).searchParams.get("gcmtitle")!;
    return { ok: true, status: 200, headers: new Headers(), json: async () => bodies[title] } as unknown as Response;
  }) as unknown as typeof fetch;
  const r = await fetchWikimediaAssets({
    userAgent: "T/1 (x)", categories: ["Category:Empty", "Category:Full"], limit: 8, fetchFn, sleep: async () => {},
  });
  assert.equal(r.assets.length, 8);
});

test("derivative-work creator credit loses its File: prefix", () => {
  const a = asset(page({ meta: { Artist: "File:Aurora Australis from ISS 2011 - 2.ogv: Crew Earth Observations team at Johnson Space Center derivative work: Matanya" } }));
  assert.equal(a.creator, "Crew Earth Observations team at Johnson Space Center derivative work: Matanya");
});
