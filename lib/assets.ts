export const ASSET_TYPES = [
  "Images",
  "Vectors",
  "GIFs",
  "Music",
  "Sound Effects",
  "Stock Footage",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const SECTION_ORDER: AssetType[] = [
  "Images",
  "Vectors",
  "GIFs",
  "Stock Footage",
  "Music",
  "Sound Effects",
];

export function isAudio(type: AssetType) {
  return type === "Music" || type === "Sound Effects";
}

export type LicenseId = "cc0" | "cc-by" | "cc-by-sa" | "non-commercial";

export const LICENSES: Record<
  LicenseId,
  { label: string; commercial: boolean; description: string }
> = {
  cc0: {
    label: "CC0",
    commercial: true,
    description: "Public domain. Free for any use, no credit needed.",
  },
  "cc-by": {
    label: "CC BY",
    commercial: true,
    description: "Free to use, including commercially, with credit to the creator.",
  },
  "cc-by-sa": {
    label: "CC BY-SA",
    commercial: true,
    description:
      "Free to use with credit. Adaptations must use the same license.",
  },
  "non-commercial": {
    label: "CC BY-NC",
    commercial: false,
    description: "Free to use with credit, but not for commercial projects.",
  },
};

export const LICENSE_IDS = Object.keys(LICENSES) as LicenseId[];

export function parseLicenses(v: string | null | undefined): LicenseId[] {
  const wanted = new Set((v ?? "").split(",").map((s) => s.trim()));
  const picked = LICENSE_IDS.filter((id) => wanted.has(id));
  return picked.length === LICENSE_IDS.length ? [] : picked;
}

export function toggleLicense(current: LicenseId[], id: LicenseId): LicenseId[] {
  const effective = current.length === 0 ? LICENSE_IDS : current;
  const next = effective.includes(id)
    ? effective.filter((x) => x !== id)
    : [...effective, id];
  if (next.length === 0) return current;
  return parseLicenses(next.join(","));
}

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["value"];

export const DATE_RANGE_OPTIONS = [
  { value: "any", label: "Any time", days: Infinity },
  { value: "week", label: "Past week", days: 7 },
  { value: "month", label: "Past month", days: 30 },
  { value: "year", label: "Past year", days: 365 },
] as const;

export type DateRangeId = (typeof DATE_RANGE_OPTIONS)[number]["value"];

export function parseSort(v: string | null | undefined): SortId {
  return SORT_OPTIONS.some((o) => o.value === v) ? (v as SortId) : "relevance";
}

export function parseDateRange(v: string | null | undefined): DateRangeId {
  return DATE_RANGE_OPTIONS.some((o) => o.value === v)
    ? (v as DateRangeId)
    : "any";
}

const DAY_MS = 86_400_000;

export function withinDateRange(asset: Asset, range: DateRangeId) {
  const days = DATE_RANGE_OPTIONS.find((o) => o.value === range)!.days;
  if (!Number.isFinite(days)) return true;
  return Date.now() - Date.parse(asset.addedAt) <= days * DAY_MS;
}

export function sortAssets(list: Asset[], sort: SortId): Asset[] {
  if (sort === "relevance") return list;
  const copy = [...list];
  if (sort === "newest")
    copy.sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt));
  else if (sort === "oldest")
    copy.sort((a, b) => Date.parse(a.addedAt) - Date.parse(b.addedAt));
  else copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy;
}

export function formatAddedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const SOURCES = {
  commons: {
    name: "Wikimedia Commons",
    termsUrl: "https://commons.wikimedia.org/wiki/Commons:Reuse_of_content_outside_Wikimedia",
  },
  mock: {
    name: "Sample data",
    termsUrl: "",
  },
} as const;

export type SourceId = keyof typeof SOURCES;

export function sourceName(source: string): string {
  return source in SOURCES ? SOURCES[source as SourceId].name : source;
}

export type Asset = {
  id: string;
  source: SourceId;
  sourceId: string;
  title: string;
  creator: string;
  type: AssetType;
  durationSec?: number;
  license: LicenseId;
  licenseVersion?: string;
  sourceUrl: string;
  previewUrl?: string;
  genre?: string;
  tags: string[];
  addedAt: string;
  fetchedAt: string;
};

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function matchesQuery(asset: Asset, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [asset.title, asset.creator, asset.type, ...asset.tags]
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}