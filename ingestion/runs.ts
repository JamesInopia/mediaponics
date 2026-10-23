import { eq } from "drizzle-orm";
import type { IngestDb } from "../db/client";
import { ingestionRuns } from "../db/schema";

export type RunKind = "ingest" | "revalidate";
export type RunStats = {
  inserted?: number;
  updated?: number;
  unchanged?: number;
  skipped?: number;
  flagged?: number;
};

export async function startRun(db: IngestDb, source: string, kind: RunKind): Promise<string> {
  const [row] = await db
    .insert(ingestionRuns)
    .values({ source, kind, status: "running" })
    .returning({ id: ingestionRuns.id });
  return row.id;
}

export async function finishRun(db: IngestDb, id: string, stats: RunStats) {
  await db
    .update(ingestionRuns)
    .set({ status: "ok", finishedAt: new Date(), ...stats })
    .where(eq(ingestionRuns.id, id));
}

export async function failRun(db: IngestDb, id: string, err: unknown) {
  const message = (err instanceof Error ? err.message : String(err)).slice(0, 500);
  await db
    .update(ingestionRuns)
    .set({ status: "failed", finishedAt: new Date(), error: message })
    .where(eq(ingestionRuns.id, id));
}
