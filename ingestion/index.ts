import { join } from "node:path";
import { createIngestDb } from "../db/client.ts";
import { fetchWikimediaAssets } from "./adapters/wikimedia.ts";
import { writeSkipLog, summarizeSkips } from "./skip-log.ts";
import { upsertAssets } from "./upsert.ts";

function parseArgs(argv: string[]) {
  const args = {
    limit: 300,
    dryRun: false,
    audioOnly: false,
    maxRequests: undefined as number | undefined,
    categories: [] as string[],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--limit") args.limit = Number(argv[++i]);
    else if (a === "--category") args.categories.push(argv[++i]);
    else if (a === "--audio-only") args.audioOnly = true;
    else if (a === "--max-requests") args.maxRequests = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!Number.isInteger(args.limit) || args.limit < 1) throw new Error("--limit must be a positive integer");
  if (args.maxRequests !== undefined && (!Number.isInteger(args.maxRequests) || args.maxRequests < 1)) {
    throw new Error("--max-requests must be a positive integer");
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const userAgent = process.env.INGEST_USER_AGENT;
  if (!userAgent || userAgent.startsWith("YourAppName")) {
    throw new Error("Set INGEST_USER_AGENT in .env (AppName/version plus a contact URL or email). Wikimedia requires it.");
  }

  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  console.log(`Fetching up to ${args.limit} records from Wikimedia Commons...`);
  const fetched = await fetchWikimediaAssets({
    userAgent,
    limit: args.limit,
    maxRequestsPerCategory: args.maxRequests,
    categories: args.categories,
    onProgress: (m) => console.log("  " + m),
  });
  const { skips, requests, perCategory } = fetched;
  // --audio-only drops photos, diagrams and videos that happen to sit in an audio category.
  const assets = args.audioOnly
    ? fetched.assets.filter((a) => a.type === "Music" || a.type === "Sound Effects")
    : fetched.assets;

  const log = writeSkipLog(skips, join(import.meta.dirname, "logs"), runId);
  const summary = summarizeSkips(skips);

  console.log(`\nAPI requests: ${requests}`);
  console.log(`Accepted: ${assets.length}   Skipped: ${summary.total}`);
  for (const [cat, s] of Object.entries(perCategory)) {
    console.log(`  ${cat}: seen ${s.seen}, accepted ${s.accepted}`);
  }
  const tally = (key: "type" | "license") => {
    const out: Record<string, number> = {};
    for (const a of assets) out[a[key]] = (out[a[key]] ?? 0) + 1;
    return out;
  };
  console.log("Accepted by type:", tally("type"));
  console.log("Accepted by license:", tally("license"));
  console.log("Skipped by reason:", summary.byReason);
  if (summary.topUnmappedLicenses.length) {
    console.log("Top unmapped licenses:", summary.topUnmappedLicenses);
  }
  console.log(`Skip log: ${log.jsonl}`);

  if (args.dryRun) {
    console.log("\n--dry-run: nothing written. Sample:");
    console.log(JSON.stringify(assets.slice(0, 3), null, 2));
    return;
  }

  const { db, close } = createIngestDb();
  try {
    const counts = await upsertAssets(db, assets);
    console.log("\nUpsert:", counts);
  } finally {
    await close();
  }
}

function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const lines = [err.message.split("\n")[0].slice(0, 200)];
  let cause: unknown = (err as { cause?: unknown }).cause;
  for (let i = 0; cause instanceof Error && i < 4; i++) {
    const code = (cause as { code?: string }).code;
    lines.push(`Caused by: ${code ? `[${code}] ` : ""}${cause.message.slice(0, 300)}`);
    cause = (cause as { cause?: unknown }).cause;
  }
  return lines.join("\n");
}

main().catch((err) => {
  console.error("\n" + describeError(err));
  process.exit(1);
});