import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SKIP_REASONS } from "./types.ts";
import type { Skip } from "./types.ts";

export type SkipSummary = {
  total: number;
  byReason: Record<string, number>;
  topUnmappedLicenses: { license: string; count: number }[];
};

export function summarizeSkips(skips: Skip[]): SkipSummary {
  const byReason: Record<string, number> = {};
  for (const r of SKIP_REASONS) byReason[r] = 0;
  const lic = new Map<string, number>();
  for (const s of skips) {
    byReason[s.reason] = (byReason[s.reason] ?? 0) + 1;
    if (s.reason === "unmapped_license" && s.detail) lic.set(s.detail, (lic.get(s.detail) ?? 0) + 1);
  }
  const topUnmappedLicenses = [...lic.entries()]
    .map(([license, count]) => ({ license, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  return { total: skips.length, byReason, topUnmappedLicenses };
}

export function writeSkipLog(skips: Skip[], dir: string, runId: string) {
  mkdirSync(dir, { recursive: true });
  const jsonl = join(dir, `skipped-${runId}.jsonl`);
  const summaryPath = join(dir, `summary-${runId}.json`);
  writeFileSync(jsonl, skips.map((s) => JSON.stringify(s)).join("\n") + (skips.length ? "\n" : ""));
  writeFileSync(summaryPath, JSON.stringify(summarizeSkips(skips), null, 2) + "\n");
  return { jsonl, summaryPath };
}
