import { sql } from "drizzle-orm";
import {
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { ASSET_TYPES } from "../lib/assets";


export const assetTypeEnum = pgEnum("asset_type", ASSET_TYPES);
export const licenseIdEnum = pgEnum("license_id", [
  "cc0",
  "cc-by",
  "cc-by-sa",
  "non-commercial",
]);


const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});


export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(),
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    creator: text("creator").notNull(),
    type: assetTypeEnum("type").notNull(),
    durationSec: integer("duration_sec"),
    license: licenseIdEnum("license").notNull(),
    licenseVersion: text("license_version"),
    sourceUrl: text("source_url").notNull(),
    previewUrl: text("preview_url"),
    genre: text("genre"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    removedAt: timestamp("removed_at", { withTimezone: true }),
    removedReason: text("removed_reason"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    checkFailures: integer("check_failures").notNull().default(0),
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(creator, '')), 'B') || setweight(to_tsvector('english', coalesce(immutable_array_to_string(tags, ' '), '')), 'C')`,
    ),
  },
  (t) => [
    unique("assets_source_source_id_unique").on(t.source, t.sourceId),
    index("assets_search_idx").using("gin", t.search),
    index("assets_type_added_at_idx").on(t.type, t.addedAt.desc()),
    index("assets_live_fetched_at_idx").on(t.source, t.fetchedAt).where(sql`removed_at is null`),
  ],
);

export const ingestionRuns = pgTable(
  "ingestion_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(),
    kind: text("kind").notNull(), // "ingest" | "revalidate"
    status: text("status").notNull(), // "running" | "ok" | "failed"
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    inserted: integer("inserted").notNull().default(0),
    updated: integer("updated").notNull().default(0),
    unchanged: integer("unchanged").notNull().default(0),
    skipped: integer("skipped").notNull().default(0),
    flagged: integer("flagged").notNull().default(0),
    error: text("error"),
  },
  (t) => [index("ingestion_runs_source_finished_idx").on(t.source, t.finishedAt.desc())],
);


export type AssetRow = Omit<typeof assets.$inferSelect, "search" | "removedAt" | "removedReason" | "lastCheckedAt" | "checkFailures">;
export type NewAssetRow = typeof assets.$inferInsert;
