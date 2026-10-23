import type { AssetType } from "@/lib/assets";
import type {
  ApiError,
  AssetGroupsResponse,
  AssetListParams,
  AssetListResponse,
} from "./api-types";

function buildQuery(filters: AssetListParams): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

async function request<T>(params: AssetListParams): Promise<T> {
  const query = buildQuery(params);
  const res = await fetch(`/api/v1/assets${query ? `?${query}` : ""}`);
  if (!res.ok) {
    let message = `Failed to load assets (${res.status})`;
    try {
      const body = (await res.json()) as ApiError;
      message = body.error.message;
    } catch {
      // message is already thrown, so there's nothing else to do
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function getAssetList(
  params: AssetListParams & { type: AssetType },
): Promise<AssetListResponse> {
  return request<AssetListResponse>(params);
}

export function getAssetGroups(
  params: AssetListParams = {},
): Promise<AssetGroupsResponse> {
  return request<AssetGroupsResponse>({ ...params, type: undefined });
}
