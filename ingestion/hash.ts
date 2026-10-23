import { createHash } from "node:crypto";
import type { Asset } from "@/lib/assets";

export function contentHash(a: Asset): string {
  const stable = {
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
    addedAt: new Date(a.addedAt).toISOString(),
  };
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}
