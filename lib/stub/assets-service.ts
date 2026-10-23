import {
  ASSET_TYPES,
  SECTION_ORDER,
  matchesQuery,
  parseDateRange,
  parseSort,
  sortAssets,
  withinDateRange,
  type Asset,
  type AssetType,
} from "../assets";
import { MOCK_ASSETS } from "@/lib/mock-assets";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  ITEMS_PER_GROUP,
  MAX_LIMIT,
  MAX_QUERY_LENGTH,
  type AssetGroupsResponse,
  type AssetListParams,
  type AssetListResponse,
} from "@/lib/api-types";

function toInt(value: string | null, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

function parseType(value: string | null): AssetType | undefined {
  return ASSET_TYPES.find((t) => t === value);
}

function parseParams(sp: URLSearchParams): AssetListParams {
  return {
    q: sp.get("q")?.trim().slice(0, MAX_QUERY_LENGTH) || undefined,
    type: parseType(sp.get("type")),
    sort: parseSort(sp.get("sort")),
    added: parseDateRange(sp.get("added")),
    page: toInt(sp.get("page"), DEFAULT_PAGE),
    limit: Math.min(toInt(sp.get("limit"), DEFAULT_LIMIT), MAX_LIMIT),
  };
}

function filterAssets(assets: Asset[], params: AssetListParams): Asset[] {
  const { q, added = "any", sort = "relevance" } = params;
  const matches = assets.filter(
    (a) => !q || (matchesQuery(a, q) && withinDateRange(a, added)),
  );

  return sortAssets(matches, sort);
}

export function listAssets(
  sp: URLSearchParams,
): AssetListResponse | AssetGroupsResponse {
  const params = parseParams(sp);
  const matches = filterAssets(MOCK_ASSETS, params);

  if (params.type) {
    const ofType = matches.filter((a) => a.type === params.type);
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const start = (page - 1) * limit;
    return {
      items: ofType.slice(start, start + limit),
      total: ofType.length,
      page,
      limit,
    };
  }

  const groups = SECTION_ORDER.map((type) => {
    const ofType = matches.filter((a) => a.type === type);
    return {
      type,
      items: ofType.slice(0, ITEMS_PER_GROUP),
      total: ofType.length,
    };
  }).filter((g) => g.total > 0);

  return { groups };
}
