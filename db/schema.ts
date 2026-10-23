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
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(creator, '')), 'B') || setweight(to_tsvector('english', coalesce(immutable_array_to_string(tags, ' '), '')), 'C')`,
    ),
  },
  (t) => [
    unique("assets_source_source_id_unique").on(t.source, t.sourceId),
    index("assets_search_idx").using("gin", t.search),
    index("assets_type_added_at_idx").on(t.type, t.addedAt.desc()),
  ],
);


export type AssetRow = Omit<typeof assets.$inferSelect, "search">;
export type NewAssetRow = typeof assets.$inferInsert;
