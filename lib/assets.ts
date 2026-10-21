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

export const LICENSE_OPTIONS = [
  { value: "", label: "Any license" },
  { value: "cc0", label: "CC0 / Public domain" },
  { value: "cc-by", label: "CC BY" },
  { value: "cc-by-sa", label: "CC BY-SA" },
  { value: "non-commercial", label: "Non-commercial" },
];

export type Asset = {
  id: string;
  title: string;
  creator: string;
  type: AssetType;
  durationSec?: number;
  license: LicenseId;
  source: string;
  sourceUrl: string;
  tags: string[];
};

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ---------------- Mock data (fictional, for layout only) ---------------- */

type Seed = {
  title: string;
  license: LicenseId;
  tags: string[];
  durationSec?: number;
};

const CREATORS = [
  "Alex Rivera",
  "Mina Cho",
  "J. Okafor",
  "Studio Lumen",
  "Pia Santos",
  "Tomas Berg",
  "Nova Audio",
  "Kei Tanaka",
];
const SOURCES = ["Source A", "Source B", "Source C"];

function build(type: AssetType, prefix: string, seeds: Seed[]): Asset[] {
  return seeds.map((s, i) => ({
    id: `${prefix}-${i + 1}`,
    type,
    creator: CREATORS[(i * 3 + prefix.length) % CREATORS.length],
    source: SOURCES[i % SOURCES.length],
    sourceUrl: `https://example.com/${prefix}/${i + 1}`,
    ...s,
  }));
}

export const MOCK_ASSETS: Asset[] = [
  ...build("Images", "img", [
    { title: "Neon city at night", license: "cc0", tags: ["city", "night", "neon"] },
    { title: "Mountain lake at sunrise", license: "cc-by", tags: ["nature", "mountain", "lake"] },
    { title: "Rain on a window", license: "cc-by-sa", tags: ["rain", "window", "moody"] },
    { title: "Foggy forest path", license: "cc0", tags: ["forest", "fog", "nature"] },
    { title: "Desert dunes", license: "cc-by", tags: ["desert", "sand", "landscape"] },
    { title: "Abstract ink swirls", license: "non-commercial", tags: ["abstract", "ink", "texture"] },
    { title: "Film grain texture", license: "cc0", tags: ["film", "grain", "texture"] },
    { title: "Coffee shop interior", license: "cc-by", tags: ["cafe", "interior", "coffee"] },
  ]),
  ...build("Vectors", "vec", [
    { title: "Sound wave icon set", license: "cc0", tags: ["audio", "icons", "wave"] },
    { title: "Play button pack", license: "cc-by", tags: ["play", "buttons", "ui"] },
    { title: "Film strip border", license: "cc-by-sa", tags: ["film", "border", "frame"] },
    { title: "Microphone line icon", license: "cc0", tags: ["microphone", "icon", "audio"] },
    { title: "Clapperboard illustration", license: "non-commercial", tags: ["clapperboard", "film", "illustration"] },
    { title: "Geometric shapes set", license: "cc-by", tags: ["shapes", "geometric", "abstract"] },
  ]),
  ...build("GIFs", "gif", [
    { title: "Loading spinner", license: "cc0", durationSec: 3, tags: ["loading", "spinner", "ui"] },
    { title: "Confetti burst", license: "cc-by", durationSec: 4, tags: ["confetti", "party", "celebration"] },
    { title: "Glitch transition", license: "cc-by-sa", durationSec: 2, tags: ["glitch", "transition", "digital"] },
    { title: "Fire loop", license: "cc0", durationSec: 5, tags: ["fire", "loop", "flame"] },
    { title: "Typing cursor", license: "non-commercial", durationSec: 3, tags: ["typing", "cursor", "text"] },
    { title: "Rain on glass loop", license: "cc-by", durationSec: 6, tags: ["rain", "glass", "loop"] },
  ]),
  ...build("Music", "mus", [
    { title: "Uplifting corporate", license: "cc0", durationSec: 142, tags: ["corporate", "upbeat", "background"] },
    { title: "Calm lofi study beat", license: "cc-by", durationSec: 96, tags: ["lofi", "chill", "study"] },
    { title: "Epic cinematic trailer", license: "cc-by-sa", durationSec: 168, tags: ["cinematic", "epic", "trailer"] },
    { title: "Dark suspense drone", license: "non-commercial", durationSec: 75, tags: ["suspense", "dark", "horror"] },
    { title: "Upbeat acoustic vlog", license: "cc0", durationSec: 121, tags: ["acoustic", "upbeat", "vlog"] },
    { title: "Retro synthwave drive", license: "cc-by", durationSec: 183, tags: ["synthwave", "retro", "driving"] },
  ]),
  ...build("Sound Effects", "sfx", [
    { title: "Rain on roof", license: "cc0", durationSec: 45, tags: ["rain", "ambience", "weather"] },
    { title: "Door creak", license: "cc-by", durationSec: 6, tags: ["door", "horror", "foley"] },
    { title: "Whoosh transition", license: "cc0", durationSec: 2, tags: ["whoosh", "transition", "swoosh"] },
    { title: "Camera shutter click", license: "cc-by-sa", durationSec: 1, tags: ["camera", "click", "shutter"] },
    { title: "Thunder rumble", license: "non-commercial", durationSec: 18, tags: ["thunder", "storm", "weather"] },
    { title: "Footsteps on gravel", license: "cc-by", durationSec: 12, tags: ["footsteps", "gravel", "foley"] },
  ]),
  ...build("Stock Footage", "vid", [
    { title: "Waves crashing, drone shot", license: "cc0", durationSec: 24, tags: ["ocean", "drone", "waves"] },
    { title: "City traffic timelapse", license: "cc-by", durationSec: 18, tags: ["city", "traffic", "timelapse"] },
    { title: "Rain on leaves, close-up", license: "cc-by-sa", durationSec: 12, tags: ["rain", "leaves", "nature"] },
    { title: "Clouds timelapse", license: "cc0", durationSec: 30, tags: ["clouds", "sky", "timelapse"] },
    { title: "Coffee pour in slow motion", license: "non-commercial", durationSec: 9, tags: ["coffee", "slow motion", "pour"] },
    { title: "Forest in morning mist", license: "cc-by", durationSec: 22, tags: ["forest", "mist", "morning"] },
  ]),
];

export function matchesQuery(asset: Asset, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [asset.title, asset.creator, asset.type, ...asset.tags]
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}