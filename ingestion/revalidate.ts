import { and, asc, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import { createIngestDb, type IngestDb } from "../db/client.ts";
import { assets } from "../db/schema.ts";
import { fetchWikimediaByIds } from "./adapters/wikimedia.ts";
import { checkUrl } from "./linkcheck.ts";
import { failRun, finishRun, startRun } from "./runs.ts";
import { upsertAssets } from "./upsert.ts";

/**
 * Step 3 + 4: refresh the stalest records (by fetched_at), and flag records whose source page is gone.
 *
 *  - exists and still eligible  -> upsert (metadata, license and fetched_at refreshed, flags cleared)
 *  - exists but now ineligible  -> flagged immediately (e.g. license changed; that is a rights issue)
 *  - missing / 404              -> one strike; flagged after --strikes consecutive checks
 *  - network error / 5xx        -> ignored (no strike)
 */
function parseArgs(argv: string[]) {
  const a = { source: "commons", limit: 500, staleDays: 7, strikes: 2, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--dry-run") a.dryRun = true;
    else if (k === "--source") a.source = argv[++i];
    else if (k === "--limit") a.limit = Number(argv[++i]);
    else if (k === "--stale-days") a.staleDays = Number(argv[++i]);
    else if (k === "--strikes") a.strikes = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${k}`);
  }
  for (const n of [a.limit, a.staleDays, a.strikes]) {
    if (!Number.isInteger(n) || n < 1) throw new Error("--limit, --stale-days and --strikes must be positive integers");
  }
  return a;
}

async function strike(db: IngestDb, source: string, ids: string[], strikes: number, reason: string) {
  if (!ids.length) return 0;
  const rows = await db
    .update(assets)
    .set({
      checkFailures: sql`${assets.checkFailures} + 1`,
      lastCheckedAt: new Date(),
      removedAt: sql`case when ${assets.checkFailures} + 1 >= ${strikes} then now() else ${assets.removedAt} end`,
      removedReason: sql`case when ${assets.checkFailures} + 1 >= ${strikes} then ${reason} else ${assets.removedReason} end`,
    })
    .where(and(eq(assets.source, source), inArray(assets.sourceId, ids)))
    .returning({ removedAt: assets.removedAt });
  return rows.filter((r) => r.removedAt !== null).length;
}

async function flagNow(db: IngestDb, source: string, ids: string[], reason: string) {
  if (!ids.length) return 0;
  const rows = await db
    .update(assets)
    .set({ removedAt: new Date(), removedReason: reason, lastCheckedAt: new Date() })
    .where(and(eq(assets.source, source), inArray(assets.sourceId, ids), isNull(assets.removedAt)))
    .returning({ id: assets.id });
  return rows.length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const userAgent = process.env.INGEST_USER_AGENT;
  if (!userAgent || userAgent.startsWith("YourAppName")) throw new Error("Set INGEST_USER_AGENT");

  const { db, close } = createIngestDb();
  const runId = args.dryRun ? null : await startRun(db, args.source, "revalidate");
  try {
    const cutoff = new Date(Date.now() - args.staleDays * 86_400_000);
    const stale = await db
      .select({ sourceId: assets.sourceId, sourceUrl: assets.sourceUrl })
      .from(assets)
      .where(and(eq(assets.source, args.source), isNull(assets.removedAt), lt(assets.fetchedAt, cutoff)))
      .orderBy(asc(assets.fetchedAt))
      .limit(args.limit);
    console.log(`${stale.length} stale ${args.source} records (fetched before ${cutoff.toISOString()})`);

    let flagged = 0;
    let counts = { inserted: 0, updated: 0, unchanged: 0 };
    let skipped = 0;

    if (args.source === "commons") {
      const res = await fetchWikimediaByIds(stale.map((s) => s.sourceId), { userAgent });
      console.log(`requests ${res.requests}, refreshed ${res.assets.length}, ineligible ${res.skips.length}, missing ${res.missing.length}`);
      if (args.dryRun) return;
      counts = await upsertAssets(db, res.assets);
      skipped = res.skips.length;
      flagged += await flagNow(db, args.source, res.skips.map((s) => s.sourceId), "ineligible");
      flagged += await strike(db, args.source, res.missing, args.strikes, "source_missing");
    } else {
      // Generic fallback for future adapters: HEAD each sourceUrl, 5 at a time.
      const gone: string[] = [];
      const ok: string[] = [];
      for (let i = 0; i < stale.length; i += 5) {
        const batch = stale.slice(i, i + 5);
        const results = await Promise.all(batch.map((r) => checkUrl(r.sourceUrl, { userAgent })));
        results.forEach((r, j) => (r === "gone" ? gone : r === "ok" ? ok : []).push(batch[j].sourceId));
        await new Promise((r) => setTimeout(r, 500));
      }
      console.log(`ok ${ok.length}, gone ${gone.length}`);
      if (args.dryRun) return;
      if (ok.length) {
        await db
          .update(assets)
          .set({ fetchedAt: new Date(), lastCheckedAt: new Date(), checkFailures: 0 })
          .where(and(eq(assets.source, args.source), inArray(assets.sourceId, ok)));
      }
      flagged += await strike(db, args.source, gone, args.strikes, "source_missing");
    }

    console.log(`flagged ${flagged}`, counts);
    if (runId) await finishRun(db, runId, { ...counts, skipped, flagged });
  } catch (err) {
    if (runId) await failRun(db, runId, err);
    throw err;
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
