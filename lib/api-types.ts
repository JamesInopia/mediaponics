import type { Asset, AssetType, DateRangeId, SortId } from "@/lib/assets";

export type AssetListParams = {
  q?: string;
  type?: AssetType;
  sort?: SortId;
  added?: DateRangeId;
  page?: number;
  limit?: number;
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 24;
export const MAX_LIMIT = 60;
export const ITEMS_PER_GROUP = 12;
export const MAX_QUERY_LENGTH = 100;

export type AssetListResponse = {
  items: Asset[];
  total: number;
  page: number;
  limit: number;
};

export type AssetGroupsResponse = {
  groups: { type: AssetType; items: Asset[]; total: number }[];
};

export type ApiErrorCode = "not_found" | "rate_limited" | "internal_error";

export type ApiError = {
  error: { code: ApiErrorCode; message: string };
};
