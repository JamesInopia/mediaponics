import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { assets, type AssetRow } from "@/db/schema";
import {
  ASSET_TYPES,
  DATE_RANGE_OPTIONS,
  SECTION_ORDER,
  parseDateRange,
  parseLicenses,
  parseSort,
  type Asset,
  type AssetType,
  type SourceId,
} from "@/lib/assets";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  ITEMS_PER_GROUP,
  MAX_LIMIT,
  MAX_QUERY_LENGTH,
  type AssetGroupsResponse,
  type AssetListResponse,
} from "@/lib/api-types";

const MAX_PAGE = 10_000;
const MAX_QUERY_TOKENS = 10;
const DAY_MS = 86_400_000;


const paramsSchema = z.object({
  q: z
    .string()
    .transform((s) => s.trim().slice(0, MAX_QUERY_LENGTH))
    .catch(""),
  type: z.enum(ASSET_TYPES).optional().catch(undefined),
  sort: z.string().transform(parseSort).catch("relevance"),
  added: z.string().transform(parseDateRange).catch("any"),
  license: z.string().transform(parseLicenses).catch([]),
  page: z.coerce.number().int().min(1).max(MAX_PAGE).catch(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .catch(DEFAULT_LIMIT)
    .transform((n) => Math.min(n, MAX_LIMIT)),
});

export type ParsedAssetParams = z.output<typeof paramsSchema>;

export function parseAssetListParams(sp: URLSearchParams): ParsedAssetParams {
  return paramsSchema.parse(Object.fromEntries(sp));
}

function toTsQuery(q: string): string | null {
  const tokens = q
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, MAX_QUERY_TOKENS);
  return tokens.length ? tokens.map((t) => `${t}:*`).join(" & ") : null;
}

function buildWhere(p: ParsedAssetParams, tsq: string | null, withType: boolean) {
  const conds: SQL[] = [];
  if (withType && p.type) conds.push(eq(assets.type, p.type));
  if (p.license.length > 0) conds.push(inArray(assets.license, p.license));

  const days = DATE_RANGE_OPTIONS.find((o) => o.value === p.added)!.days;
  if (Number.isFinite(days)) {
    conds.push(gte(assets.addedAt, new Date(Date.now() - days * DAY_MS)));
  }

  if (tsq) conds.push(sql`${assets.search} @@ to_tsquery('english', ${tsq})`);
  return and(...conds);
}

function buildOrder(p: ParsedAssetParams, tsq: string | null): SQL[] {
  switch (p.sort) {
    case "newest":
      return [desc(assets.addedAt), asc(assets.id)];
    case "oldest":
      return [asc(assets.addedAt), asc(assets.id)];
    case "title":
      return [asc(sql`lower(${assets.title})`), asc(assets.id)];
    default:
      return tsq
        ? [
            sql`ts_rank_cd(${assets.search}, to_tsquery('english', ${tsq})) desc`,
            desc(assets.addedAt),
            asc(assets.id),
          ]
        : [desc(assets.addedAt), asc(assets.id)];
  }
}


const ASSET_COLUMNS = {
  id: assets.id,
  source: assets.source,
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
  fetchedAt: assets.fetchedAt,
};

function toAsset(r: AssetRow): Asset {
  return {
    id: r.id,
    source: r.source as SourceId,
    sourceId: r.sourceId,
    title: r.title,
    creator: r.creator,
    type: r.type,
    license: r.license,
    sourceUrl: r.sourceUrl,
    tags: r.tags,
    addedAt: r.addedAt.toISOString(),
    fetchedAt: r.fetchedAt.toISOString(),
    ...(r.durationSec !== null ? { durationSec: r.durationSec } : {}),
    ...(r.licenseVersion !== null ? { licenseVersion: r.licenseVersion } : {}),
    ...(r.previewUrl !== null ? { previewUrl: r.previewUrl } : {}),
    ...(r.genre !== null ? { genre: r.genre } : {}),
  };
}


export async function listAssets(p: ParsedAssetParams): Promise<AssetListResponse> {
  const tsq = toTsQuery(p.q);
  const where = buildWhere(p, tsq, true);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(ASSET_COLUMNS)
      .from(assets)
      .where(where)
      .orderBy(...buildOrder(p, tsq))
      .limit(p.limit)
      .offset((p.page - 1) * p.limit),
    db.select({ total: count() }).from(assets).where(where),
  ]);

  return { items: rows.map(toAsset), total, page: p.page, limit: p.limit };
}


export async function listAssetGroups(
  p: ParsedAssetParams
): Promise<AssetGroupsResponse> {
  const tsq = toTsQuery(p.q);
  const where = buildWhere(p, tsq, false);
  const order = buildOrder(p, tsq);

  const ranked = db
    .select({
      ...ASSET_COLUMNS,
      rank: sql<number>`row_number() over (partition by ${assets.type} order by ${sql.join(order, sql`, `)})`.as(
        "rank"
      ),
    })
    .from(assets)
    .where(where)
    .as("ranked");

  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(ranked)
      .where(lte(ranked.rank, ITEMS_PER_GROUP))
      .orderBy(ranked.type, ranked.rank),
    db
      .select({ type: assets.type, total: count() })
      .from(assets)
      .where(where)
      .groupBy(assets.type),
  ]);

  const totalByType = new Map<AssetType, number>(
    totals.map((t) => [t.type, t.total])
  );
  const itemsByType = new Map<AssetType, Asset[]>();
  for (const row of rows) {
    const list = itemsByType.get(row.type) ?? [];
    list.push(toAsset(row));
    itemsByType.set(row.type, list);
  }

  return {
    groups: SECTION_ORDER.filter((t) => (totalByType.get(t) ?? 0) > 0).map(
      (type) => ({
        type,
        items: itemsByType.get(type) ?? [],
        total: totalByType.get(type)!,
      })
    ),
  };
}

export async function getAsset(id: string): Promise<Asset | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [row] = await db
    .select(ASSET_COLUMNS)
    .from(assets)
    .where(eq(assets.id, id))
    .limit(1);
  return row ? toAsset(row) : null;
}
