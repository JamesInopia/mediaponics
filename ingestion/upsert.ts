import { and, eq, inArray } from "drizzle-orm";
import type { Asset } from "@/lib/assets";
import { assets } from "../db/schema";
import type { NewAssetRow } from "../db/schema";
import type { IngestDb } from "../db/client";
import { contentHash } from "./hash.ts";

export type UpsertCounts = { inserted: number; updated: number; unchanged: number };


function toRow(a: Asset): NewAssetRow {
  return {
    source: a.source,
    sourceId: a.sourceId,
    title: a.title,
    creator: a.creator,
    type: a.type,
    durationSec: a.durationSec ?? null,
    license: a.license,
    licenseVersion: a.licenseVersion ?? null,
    sourceUrl: a.sourceUrl,
    previewUrl: a.previewUrl ?? null,
    genre: a.genre ?? null,
    tags: a.tags,
    addedAt: new Date(a.addedAt),
    fetchedAt: new Date(a.fetchedAt),
    removedAt: null,
    removedReason: null,
    checkFailures: 0,
    lastCheckedAt: new Date(a.fetchedAt),
  };
}

const CHUNK = 200;


export async function upsertAssets(db: IngestDb, list: Asset[]): Promise<UpsertCounts> {
  const counts: UpsertCounts = { inserted: 0, updated: 0, unchanged: 0 };

  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    const source = chunk[0].source;

    const existing = await db
      .select({
        sourceId: assets.sourceId,
        title: assets.title,
        creator: assets.creator,
        type: assets.type,
        durationSec: assets.durationSec,
        license: assets.license,
        licenseVersion: assets.licenseVersion,
        sourceUrl: assets.sourceUrl,
        previewUrl: assets.previewUrl,
        genre: assets.genre,
        tags: assets.tags,
        addedAt: assets.addedAt,
      })
      .from(assets)
      .where(and(eq(assets.source, source), inArray(assets.sourceId, chunk.map((a) => a.sourceId))));

    const storedHash = new Map(
      existing.map((r) => [
        r.sourceId,
        contentHash({
          id: "",
          source: source,
          sourceId: r.sourceId,
          title: r.title,
          creator: r.creator,
          type: r.type,
          ...(r.durationSec !== null ? { durationSec: r.durationSec } : {}),
          license: r.license,
          ...(r.licenseVersion !== null ? { licenseVersion: r.licenseVersion } : {}),
          sourceUrl: r.sourceUrl,
          ...(r.previewUrl !== null ? { previewUrl: r.previewUrl } : {}),
          ...(r.genre !== null ? { genre: r.genre } : {}),
          tags: r.tags,
          addedAt: r.addedAt.toISOString(),
          fetchedAt: "",
        }),
      ]),
    );

    const toInsert: NewAssetRow[] = [];
    const toUpdate: NewAssetRow[] = [];
    const unchangedIds: string[] = [];
    let fetchedAt = chunk[0].fetchedAt;

    for (const a of chunk) {
      const prev = storedHash.get(a.sourceId);
      if (prev === undefined) toInsert.push(toRow(a));
      else if (prev !== contentHash(a)) toUpdate.push(toRow(a));
      else unchangedIds.push(a.sourceId);
      fetchedAt = a.fetchedAt;
    }

    await db.transaction(async (tx) => {
      if (toInsert.length) {
        await tx.insert(assets).values(toInsert).onConflictDoNothing({
          target: [assets.source, assets.sourceId],
        });
      }
      for (const row of toUpdate) {
        const { source: _s, sourceId: _sid, ...changes } = row;
        await tx
          .update(assets)
          .set(changes)
          .where(and(eq(assets.source, row.source), eq(assets.sourceId, row.sourceId)));
      }
      if (unchangedIds.length) {
        await tx
          .update(assets)
          .set({
            fetchedAt: new Date(fetchedAt),
            lastCheckedAt: new Date(fetchedAt),
            removedAt: null,
            removedReason: null,
            checkFailures: 0,
          })
          .where(and(eq(assets.source, source), inArray(assets.sourceId, unchangedIds)));
      }
    });

    counts.inserted += toInsert.length;
    counts.updated += toUpdate.length;
    counts.unchanged += unchangedIds.length;
  }
  return counts;
}
