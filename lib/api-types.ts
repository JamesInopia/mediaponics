import type { Asset, AssetType, DateRangeId, SortId } from "@/lib/assets";

/**
 * API contract for /api/v1. FROZEN after Step 0.
 * Branch A implements it. Branch B builds against it. Change it on master first.
 */

/** Query params accepted by GET /api/v1/assets. Bad values fall back to defaults. */
export type AssetListParams = {
  q?: string;
  /** Omit for "All" mode, which returns AssetGroupsResponse. */
  type?: AssetType;
  sort?: SortId;
  added?: DateRangeId;
  page?: number;
  limit?: number;
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 24;
export const MAX_LIMIT = 60;
/** Items per type in "All" mode. Matches RAIL_MAX in ContentBrowser. */
export const ITEMS_PER_GROUP = 12;
export const MAX_QUERY_LENGTH = 100;

/** Returned when `type` is set. */
export type AssetListResponse = {
  items: Asset[];
  total: number;
  page: number;
  limit: number;
};

/** Returned when `type` is omitted. Groups follow SECTION_ORDER; empty types are left out. */
export type AssetGroupsResponse = {
  groups: { type: AssetType; items: Asset[]; total: number }[];
};

/** GET /api/v1/assets/:id returns an Asset, or ApiError with status 404. */
export type ApiErrorCode = "not_found" | "rate_limited" | "internal_error";

export type ApiError = {
  error: { code: ApiErrorCode; message: string };
};
