import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { MOCK_ASSETS } from "../lib/mock-assets";
import { assets } from "./schema";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL is not set (check .env.local)");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const rows = MOCK_ASSETS.map((a) => ({
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
}));

const CHUNK = 500;

async function main() {
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db
      .insert(assets)
      .values(rows.slice(i, i + CHUNK))
      .onConflictDoUpdate({
        target: [assets.source, assets.sourceId],
        set: {
          title: sql`excluded.title`,
          creator: sql`excluded.creator`,
          type: sql`excluded.type`,
          durationSec: sql`excluded.duration_sec`,
          license: sql`excluded.license`,
          licenseVersion: sql`excluded.license_version`,
          sourceUrl: sql`excluded.source_url`,
          previewUrl: sql`excluded.preview_url`,
          genre: sql`excluded.genre`,
          tags: sql`excluded.tags`,
          addedAt: sql`excluded.added_at`,
          fetchedAt: sql`excluded.fetched_at`,
        },
      });
  }
  console.log(`Seeded ${rows.length} assets.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
