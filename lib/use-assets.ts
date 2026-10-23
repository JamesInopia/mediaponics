"use client";

import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { getAssetList, getAssetGroups } from "./api";
import type { AssetType } from "./assets";
import type { AssetListParams } from "./api-types";

type ListParams = AssetListParams & { type: AssetType };
type GroupParams = AssetListParams & { type?: undefined };
type ListKey = readonly ["assets", ListParams, number];

export function useAssetList(params: ListParams | null) {
  const { data, error, size, setSize, mutate } = useSWRInfinite(
    (index) => (params ? (["assets", params, index + 1] as const) : null),
    (key: ListKey) => getAssetList({ ...key[1], page: key[2] }),
    { revalidateFirstPage: false },
  );

  const items = data?.flatMap((page) => page.items) ?? [];
  const total = data?.[data.length - 1]?.total ?? 0;
  const isLoadingMore =
    !error && size > 0 && !!data && typeof data[size - 1] === "undefined";

  return {
    data,
    error,
    items,
    total,
    hasMore: items.length < total,
    isLoadingMore,
    loadMore: () => setSize(size + 1),
    retry: () => void mutate(),
  };
}

export function useAssetGroups(params: GroupParams | null) {
  return useSWR(
    params ? (["assets", params] as const) : null,
    () => getAssetGroups(params!),
    {
      keepPreviousData: true,
    },
  );
}
