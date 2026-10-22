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
  genre?: string;
  tags: string[];
};

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Seed = {
  title: string;
  license: LicenseId;
  genre?: string;
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

type Row = [title: string, genre: string, tags: string];

const LICENSE_CYCLE: LicenseId[] = [
  "cc0",
  "cc-by",
  "cc-by-sa",
  "cc0",
  "cc-by",
  "non-commercial",
  "cc-by",
  "cc0",
];

function more(rows: Row[], offset: number, dur?: [number, number]): Seed[] {
  return rows.map(([title, genre, tags], i) => ({
    title,
    ...(genre ? { genre } : {}),
    license: LICENSE_CYCLE[(i + offset) % LICENSE_CYCLE.length],
    tags: tags.split(","),
    ...(dur
      ? { durationSec: dur[0] + ((i * 7 + offset * 3) % (dur[1] - dur[0] + 1)) }
      : {}),
  }));
}

const IMAGE_ROWS: Row[] = [
  ["Golden hour skyline", "", "city,sunset,skyline"],
  ["Snowy cabin", "", "snow,cabin,winter"],
  ["Tropical beach palm", "", "beach,palm,tropical"],
  ["Old library shelves", "", "library,books,interior"],
  ["Street market colors", "", "market,street,colorful"],
  ["Misty harbor", "", "harbor,fog,boats"],
  ["Autumn leaves close-up", "", "autumn,leaves,macro"],
  ["Starry night sky", "", "stars,night,sky"],
  ["City bridge at dusk", "", "bridge,city,dusk"],
  ["Vintage typewriter", "", "typewriter,vintage,desk"],
  ["Flower field", "", "flowers,field,spring"],
  ["Concrete wall texture", "", "concrete,wall,texture"],
  ["Highway at night", "", "highway,night,lights"],
  ["Crumpled paper texture", "", "paper,texture,background"],
  ["Waterfall in the jungle", "", "waterfall,jungle,nature"],
  ["Rooftop city view", "", "rooftop,city,view"],
];

const VECTOR_ROWS: Row[] = [
  ["Arrow icon pack", "", "arrows,icons,ui"],
  ["Social media icons", "", "social,icons,logos"],
  ["Weather icon set", "", "weather,icons,sun"],
  ["Hand-drawn doodles", "", "doodle,hand-drawn,sketch"],
  ["Speech bubbles", "", "speech,bubble,comic"],
  ["Camera icon set", "", "camera,icons,photo"],
  ["Retro badges", "", "retro,badge,label"],
  ["Paper plane illustration", "", "paper plane,travel,illustration"],
  ["Leaf pattern", "", "leaf,pattern,nature"],
  ["Gradient blobs", "", "gradient,blob,abstract"],
  ["Map pin icons", "", "map,pin,location"],
  ["Lower third shapes", "", "lower third,shapes,overlay"],
  ["Starburst shapes", "", "starburst,shapes,sale"],
  ["Headphones icon", "", "headphones,icon,audio"],
  ["Music note set", "", "music,notes,icons"],
  ["Film reel illustration", "", "film,reel,illustration"],
  ["Cloud icons", "", "cloud,icons,weather"],
  ["Hexagon pattern", "", "hexagon,pattern,geometric"],
];

const GIF_ROWS: Row[] = [
  ["Heartbeat pulse", "", "heartbeat,pulse,health"],
  ["Sparkle twinkle", "", "sparkle,twinkle,shine"],
  ["Rocket launch", "", "rocket,launch,space"],
  ["Typing keyboard", "", "typing,keyboard,work"],
  ["Snowfall loop", "", "snow,loop,winter"],
  ["Pixel explosion", "", "pixel,explosion,retro"],
  ["Thumbs up bounce", "", "thumbs up,bounce,like"],
  ["Countdown timer", "", "countdown,timer,numbers"],
  ["Lightning flash", "", "lightning,flash,storm"],
  ["Smoke wisp", "", "smoke,wisp,atmosphere"],
  ["Radar sweep", "", "radar,sweep,scan"],
  ["Coin flip", "", "coin,flip,spin"],
  ["Neon sign flicker", "", "neon,sign,flicker"],
  ["Bubbles rising", "", "bubbles,water,loop"],
  ["Arrow bounce", "", "arrow,bounce,pointer"],
  ["Subscribe button click", "", "subscribe,button,click"],
  ["Static noise", "", "static,noise,tv"],
  ["Raindrop ripple", "", "raindrop,ripple,water"],
];

const MUSIC_ROWS: Row[] = [
  ["Sunny ukulele day", "Acoustic", "ukulele,happy,sunny"],
  ["Midnight jazz lounge", "Jazz", "jazz,lounge,night"],
  ["Heroic orchestra rise", "Cinematic", "orchestra,heroic,epic"],
  ["Deep house groove", "Electronic", "house,groove,dance"],
  ["Soft piano reflections", "Piano", "piano,soft,emotional"],
  ["Action rock drive", "Rock", "rock,action,energetic"],
  ["Tropical chill", "Chill", "tropical,chill,summer"],
  ["Documentary underscore", "Corporate", "documentary,underscore,neutral"],
  ["Playful pizzicato", "Comedy", "playful,pizzicato,quirky"],
  ["Ambient space pads", "Ambient", "space,pads,atmospheric"],
  ["Hip-hop boom bap", "Hip-Hop", "hip-hop,boom bap,beat"],
  ["Folk campfire", "Folk", "folk,campfire,guitar"],
  ["Festive holiday bells", "Holiday", "holiday,bells,festive"],
  ["Epic war drums", "Cinematic", "drums,war,epic"],
  ["8-bit adventure", "Chiptune", "8-bit,adventure,game"],
  ["Romantic strings", "Classical", "strings,romantic,wedding"],
  ["Future bass drop", "Electronic", "future bass,drop,festival"],
  ["Western dust", "Country", "western,dust,guitar"],
];

const SFX_ROWS: Row[] = [
  ["Glass shatter", "Impact", "glass,shatter,break"],
  ["Cash register", "Foley", "cash,register,money"],
  ["Button click", "UI", "button,click,interface"],
  ["Wind howl", "Weather", "wind,howl,storm"],
  ["Crowd cheering", "Crowd", "crowd,cheer,stadium"],
  ["Car engine start", "Vehicle", "car,engine,start"],
  ["Distant explosion", "Impact", "explosion,distant,boom"],
  ["Water drip", "Ambience", "water,drip,cave"],
  ["Keyboard typing", "Foley", "keyboard,typing,office"],
  ["Sword unsheath", "Impact", "sword,metal,fantasy"],
  ["Phone notification", "UI", "phone,notification,ping"],
  ["Fire crackle", "Ambience", "fire,crackle,campfire"],
  ["Heartbeat", "Human", "heartbeat,pulse,tension"],
  ["Laser zap", "Sci-Fi", "laser,zap,sci-fi"],
  ["Ocean waves", "Ambience", "ocean,waves,beach"],
  ["Applause", "Crowd", "applause,clapping,audience"],
  ["Bird chirps", "Nature", "birds,chirp,morning"],
  ["Zipper", "Foley", "zipper,cloth,close"],
];

const FOOTAGE_ROWS: Row[] = [
  ["Sunrise over mountains", "Nature", "sunrise,mountains,landscape"],
  ["Busy street crosswalk", "Urban", "street,crosswalk,people"],
  ["Typing on a laptop", "Business", "laptop,typing,work"],
  ["Waterfall aerial", "Nature", "waterfall,aerial,drone"],
  ["Chef chopping vegetables", "Food & Drink", "chef,cooking,kitchen"],
  ["Night city drive", "Urban", "night,drive,city"],
  ["Snow falling in slow motion", "Nature", "snow,slow motion,winter"],
  ["Office meeting", "Business", "office,meeting,team"],
  ["Hands on piano", "Music", "piano,hands,closeup"],
  ["Sunset beach walk", "Travel", "sunset,beach,walk"],
  ["Subway arriving", "Urban", "subway,train,station"],
  ["Campfire burning", "Nature", "campfire,fire,night"],
  ["Pouring tea", "Food & Drink", "tea,pour,cozy"],
  ["Airplane takeoff", "Travel", "airplane,takeoff,airport"],
  ["Runner at dawn", "Sports", "runner,dawn,fitness"],
  ["Rain on a city window", "Urban", "rain,window,city"],
  ["Fireworks display", "Events", "fireworks,celebration,night"],
  ["Skateboard trick", "Sports", "skateboard,trick,action"],
];

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
    ...more(IMAGE_ROWS, 1),
  ]),
  ...build("Vectors", "vec", [
    { title: "Sound wave icon set", license: "cc0", tags: ["audio", "icons", "wave"] },
    { title: "Play button pack", license: "cc-by", tags: ["play", "buttons", "ui"] },
    { title: "Film strip border", license: "cc-by-sa", tags: ["film", "border", "frame"] },
    { title: "Microphone line icon", license: "cc0", tags: ["microphone", "icon", "audio"] },
    { title: "Clapperboard illustration", license: "non-commercial", tags: ["clapperboard", "film", "illustration"] },
    { title: "Geometric shapes set", license: "cc-by", tags: ["shapes", "geometric", "abstract"] },
    ...more(VECTOR_ROWS, 2),
  ]),
  ...build("GIFs", "gif", [
    { title: "Loading spinner", license: "cc0", durationSec: 3, tags: ["loading", "spinner", "ui"] },
    { title: "Confetti burst", license: "cc-by", durationSec: 4, tags: ["confetti", "party", "celebration"] },
    { title: "Glitch transition", license: "cc-by-sa", durationSec: 2, tags: ["glitch", "transition", "digital"] },
    { title: "Fire loop", license: "cc0", durationSec: 5, tags: ["fire", "loop", "flame"] },
    { title: "Typing cursor", license: "non-commercial", durationSec: 3, tags: ["typing", "cursor", "text"] },
    { title: "Rain on glass loop", license: "cc-by", durationSec: 6, tags: ["rain", "glass", "loop"] },
    ...more(GIF_ROWS, 3, [2, 8]),
  ]),
  ...build("Music", "mus", [
    { title: "Uplifting corporate", genre: "Corporate", license: "cc0", durationSec: 142, tags: ["corporate", "upbeat", "background"] },
    { title: "Calm lofi study beat", genre: "Lo-fi", license: "cc-by", durationSec: 96, tags: ["lofi", "chill", "study"] },
    { title: "Epic cinematic trailer", genre: "Cinematic", license: "cc-by-sa", durationSec: 168, tags: ["cinematic", "epic", "trailer"] },
    { title: "Dark suspense drone", genre: "Ambient", license: "non-commercial", durationSec: 75, tags: ["suspense", "dark", "horror"] },
    { title: "Upbeat acoustic vlog", genre: "Acoustic", license: "cc0", durationSec: 121, tags: ["acoustic", "upbeat", "vlog"] },
    { title: "Retro synthwave drive", genre: "Synthwave", license: "cc-by", durationSec: 183, tags: ["synthwave", "retro", "driving"] },
    ...more(MUSIC_ROWS, 4, [60, 210]),
  ]),
  ...build("Sound Effects", "sfx", [
    { title: "Rain on roof", genre: "Ambience", license: "cc0", durationSec: 45, tags: ["rain", "ambience", "weather"] },
    { title: "Door creak", genre: "Foley", license: "cc-by", durationSec: 6, tags: ["door", "horror", "foley"] },
    { title: "Whoosh transition", genre: "Transition", license: "cc0", durationSec: 2, tags: ["whoosh", "transition", "swoosh"] },
    { title: "Camera shutter click", genre: "Foley", license: "cc-by-sa", durationSec: 1, tags: ["camera", "click", "shutter"] },
    { title: "Thunder rumble", genre: "Weather", license: "non-commercial", durationSec: 18, tags: ["thunder", "storm", "weather"] },
    { title: "Footsteps on gravel", genre: "Foley", license: "cc-by", durationSec: 12, tags: ["footsteps", "gravel", "foley"] },
    ...more(SFX_ROWS, 5, [1, 60]),
  ]),
  ...build("Stock Footage", "vid", [
    { title: "Waves crashing, drone shot", genre: "Nature", license: "cc0", durationSec: 24, tags: ["ocean", "drone", "waves"] },
    { title: "City traffic timelapse", genre: "Urban", license: "cc-by", durationSec: 18, tags: ["city", "traffic", "timelapse"] },
    { title: "Rain on leaves, close-up", genre: "Nature", license: "cc-by-sa", durationSec: 12, tags: ["rain", "leaves", "nature"] },
    { title: "Clouds timelapse", genre: "Nature", license: "cc0", durationSec: 30, tags: ["clouds", "sky", "timelapse"] },
    { title: "Coffee pour in slow motion", genre: "Food & Drink", license: "non-commercial", durationSec: 9, tags: ["coffee", "slow motion", "pour"] },
    { title: "Forest in morning mist", genre: "Nature", license: "cc-by", durationSec: 22, tags: ["forest", "mist", "morning"] },
    ...more(FOOTAGE_ROWS, 6, [8, 40]),
  ]),
];

export function matchesQuery(asset: Asset, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [asset.title, asset.creator, asset.type, ...asset.tags]
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}