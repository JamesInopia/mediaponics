import { desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { assets, ingestionRuns } from "@/db/schema";
import { sourceName } from "@/lib/assets";
import type { SourceStatus, StatusResponse } from "@/lib/api-types";

export async function getStatus(): Promise<StatusResponse> {
  const [counts, runs] = await Promise.all([
    db
      .select({
        source: assets.source,
        records: sql<number>`count(*) filter (where ${assets.removedAt} is null)`.mapWith(Number),
        removed: sql<number>`count(*) filter (where ${assets.removedAt} is not null)`.mapWith(Number),
      })
      .from(assets)
      .groupBy(assets.source),
    // Latest finished run per (source, kind).
    db
      .selectDistinctOn([ingestionRuns.source, ingestionRuns.kind], {
        source: ingestionRuns.source,
        kind: ingestionRuns.kind,
        status: ingestionRuns.status,
        finishedAt: ingestionRuns.finishedAt,
        startedAt: ingestionRuns.startedAt,
      })
      .from(ingestionRuns)
      .orderBy(ingestionRuns.source, ingestionRuns.kind, desc(ingestionRuns.startedAt)),
  ]);

  const sources: SourceStatus[] = counts.map((c) => {
    const ingest = runs.find((r) => r.source === c.source && r.kind === "ingest");
    const reval = runs.find((r) => r.source === c.source && r.kind === "revalidate");
    return {
      source: c.source,
      name: sourceName(c.source),
      records: c.records,
      removed: c.removed,
      lastIngestedAt: (ingest?.finishedAt ?? ingest?.startedAt)?.toISOString() ?? null,
      lastIngestStatus: (ingest?.status as SourceStatus["lastIngestStatus"]) ?? null,
      lastRevalidatedAt: reval?.finishedAt?.toISOString() ?? null,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalRecords: sources.reduce((n, s) => n + s.records, 0),
    sources,
  };
}
