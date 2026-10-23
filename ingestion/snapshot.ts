import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { and, asc, count, getTableColumns, gt, isNull } from "drizzle-orm";
import { createIngestDb, type IngestDb } from "../db/client.ts";
import { assets } from "../db/schema.ts";

/**
 * Step 7: public data snapshot (only if Step 0 decided on one).
 * Writes dist/snapshot/assets.jsonl.gz (one asset per line) plus manifest.json.
 * Live records only; every line carries license, creator and sourceUrl so attribution travels with the data.
 */
const SCHEMA_VERSION = 1;
const PAGE = 1000;

const { search: _search, removedAt: _r, removedReason: _rr, lastCheckedAt: _l, checkFailures: _c, ...columns } =
  getTableColumns(assets);

async function* lines(db: IngestDb): AsyncGenerator<string> {
  let lastId: string | undefined;
  for (;;) {
    const batch = await db
      .select(columns)
      .from(assets)
      .where(and(isNull(assets.removedAt), lastId ? gt(assets.id, lastId) : undefined))
      .orderBy(asc(assets.id))
      .limit(PAGE);
    if (!batch.length) return;
    for (const r of batch) {
      yield (
        JSON.stringify({
          ...r,
          addedAt: r.addedAt.toISOString(),
          fetchedAt: r.fetchedAt.toISOString(),
        }) + "\n"
      );
    }
    lastId = batch[batch.length - 1].id;
  }
}

async function sha256(path: string): Promise<string> {
  const h = createHash("sha256");
  await pipeline(createReadStream(path), h);
  return h.digest("hex");
}

async function main() {
  const outDir = join(process.cwd(), "dist", "snapshot");
  mkdirSync(outDir, { recursive: true });
  const dataPath = join(outDir, "assets.jsonl.gz");

  const { db, close } = createIngestDb();
  try {
    await pipeline(Readable.from(lines(db)), createGzip({ level: 9 }), createWriteStream(dataPath));
    const [{ total }] = await db.select({ total: count() }).from(assets).where(isNull(assets.removedAt));
    const manifest = {
      schemaVersion: SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      records: total,
      file: "assets.jsonl.gz",
      format: "gzip-compressed JSON Lines, one asset per line",
      bytes: statSync(dataPath).size,
      sha256: await sha256(dataPath),
      notes:
        "Each record keeps its own license, creator and sourceUrl. Follow each record's license terms (credit the creator for anything other than CC0).",
    };
    writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    console.log(`Snapshot: ${total} records, ${manifest.bytes} bytes -> ${dataPath}`);
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
