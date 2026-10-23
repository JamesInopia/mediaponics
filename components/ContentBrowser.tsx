"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { LicenseMenu, SortDateMenu } from "@/components/FilterMenu";
import { AssetCard, AssetRow } from "@/components/AssetViews";
import AssetPanel from "@/components/AssetPanel";
import AssetRail from "@/components/AssetRail";
import {
  ASSET_TYPES,
  isAudio,
  parseDateRange,
  parseLicenses,
  parseSort,
  type Asset,
  type AssetType,
} from "@/lib/assets";
import { useAsset, useAssetGroups, useAssetList } from "@/lib/use-assets";
import {
  ErrorState,
  LoadMore,
  ResultsSkeleton,
} from "@/components/ResultStates";
import { ITEMS_PER_GROUP, MAX_QUERY_LENGTH } from "@/lib/api-types";

const PATH = "/content";
const PER_SECTION = 4;
const gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export default function ContentBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
  const typeParam = searchParams.get("type") ?? "";
  const type: AssetType | "" = (ASSET_TYPES as readonly string[]).includes(
    typeParam,
  )
    ? (typeParam as AssetType)
    : "";
  const sort = parseSort(searchParams.get("sort"));
  const dateRange = parseDateRange(searchParams.get("added"));
  const licenses = parseLicenses(searchParams.get("license"));
  const selectedId = searchParams.get("asset") ?? "";

  function update(
    changes: Record<string, string | null>,
    mode: "push" | "replace" = "push",
  ) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    const url = qs ? `${PATH}?${qs}` : PATH;
    if (mode === "push") router.push(url, { scroll: false });
    else router.replace(url, { scroll: false });
  }

  const filters = { q, sort, added: dateRange, licenses };

  const groupQuery = useAssetGroups(type ? null : filters);
  const list = useAssetList(type ? { ...filters, type } : null);

  const groups = groupQuery.data?.groups ?? [];
  const listItems = list.items;

  const error = type ? list.error : groupQuery.error;
  const hasData = type ? Boolean(list.data) : Boolean(groupQuery.data);
  const showError = Boolean(error) && !hasData;
  const isInitialLoading = !hasData && !error;
  const isRefreshing = !type && hasData && groupQuery.isValidating;
  const total = type ? list.total : groups.reduce((n, g) => n + g.total, 0);
  const retry = type ? list.retry : () => void groupQuery.mutate();

  const loaded =
    [...groups.flatMap((g) => g.items), ...listItems].find(
      (a) => a.id === selectedId,
    ) ?? null;
  const detail = useAsset(selectedId || null);
  const selected = selectedId ? (detail.data ?? loaded) : null;

  useEffect(() => {
    if (selectedId && detail.error && !loaded) update({ asset: null }, "replace");
  }, [selectedId, detail.error, loaded]);

  const selectAsset = (a: Asset) => update({ asset: a.id });
  const closePanel = () => update({ asset: null });

  const hasSearchOrFilters = Boolean(
    q || sort !== "relevance" || dateRange !== "any" || licenses.length > 0,
  );
  const listView = type !== "" && isAudio(type);

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("q") ?? "")
      .trim()
      .slice(0, MAX_QUERY_LENGTH);
    update({ q: value || null, asset: null });
  }

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-10 text-center">
        <h1 className="text-xl font-bold md:text-2xl">
          Every asset. Every license. One search.
        </h1>

        <div
          role="group"
          aria-label="Asset type"
          className="mt-4 flex flex-wrap justify-center gap-2"
        >
          {(["", ...ASSET_TYPES] as const).map((t) => {
            const on = type === t;
            return (
              <button
                key={t || "all"}
                type="button"
                aria-pressed={on}
                onClick={() => update({ type: t || null })}
                className={`rounded-full border border-black px-4 py-1 text-xs ${
                  on ? "bg-black text-white" : "bg-white hover:bg-black/5"
                }`}
              >
                {t || "All"}
              </button>
            );
          })}
        </div>
        <form
          key={q}
          onSubmit={onSubmit}
          role="search"
          className="relative mt-4 flex items-center rounded-full border border-black bg-white py-1.5 pl-5 pr-2 shadow-md"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Search"
            aria-label="Search assets"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
          />
          <SortDateMenu
            sort={sort}
            dateRange={dateRange}
            align="right"
            compact
            onSortChange={(v) =>
              update({ sort: v === "relevance" ? null : v }, "replace")
            }
            onDateRangeChange={(v) =>
              update({ added: v === "any" ? null : v }, "replace")
            }
          />
          <LicenseMenu
            licenses={licenses}
            align="right"
            onChange={(next) =>
              update(
                { license: next.length > 0 ? next.join(",") : null },
                "replace",
              )
            }
          />
          <button
            type="submit"
            aria-label="Search"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white hover:bg-black/80"
          >
            <Search size={16} />
          </button>
        </form>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4 text-sm text-black/60">
          <p aria-live="polite">
            {isInitialLoading
              ? "Loading..."
              : showError
                ? ""
                : `${total} ${total === 1 ? "result" : "results"}${q ? ` for “${q}”` : ""}`}
          </p>
          {hasSearchOrFilters && (
            <button
              type="button"
              onClick={() =>
                update({ q: null, sort: null, added: null, license: null })
              }
              className="underline hover:no-underline"
            >
              Clear search and filters
            </button>
          )}
        </div>
        {showError ? (
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={retry}
          />
        ) : isInitialLoading ? (
          <ResultsSkeleton variant={listView ? "rows" : "grid"} />
        ) : total === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center shadow-md">
            <p className="font-semibold">No assets found</p>
            <p className="mt-1 text-sm text-black/60">
              Try different keywords, another asset type, or a wider date range.
            </p>
          </div>
        ) : type === "" ? (
          <div
            className={`space-y-12 transition-opacity ${isRefreshing ? "opacity-60" : ""}`}
          >
            {groups.map((group) => (
              <section key={group.type} aria-labelledby={`sec-${group.type}`}>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 id={`sec-${group.type}`} className="text-xl font-bold">
                    {group.type}
                  </h2>
                  {group.total > PER_SECTION && (
                    <button
                      type="button"
                      onClick={() => update({ type: group.type })}
                      className="text-sm font-semibold underline hover:no-underline"
                    >
                      See all {group.total}
                    </button>
                  )}
                </div>
                <AssetRail
                  label={group.type}
                  viewAll={
                    group.total > ITEMS_PER_GROUP
                      ? {
                          text: `View all ${group.total} ${group.type}`,
                          onClick: () => update({ type: group.type }),
                        }
                      : undefined
                  }
                >
                  {group.items.map((a) => (
                    <AssetCard
                      key={a.id}
                      asset={a}
                      selected={a.id === selectedId}
                      onSelect={() => selectAsset(a)}
                    />
                  ))}
                </AssetRail>
              </section>
            ))}
          </div>
        ) : listView ? (
          <div className="space-y-4">
            {listItems.map((a) => (
              <AssetRow
                key={a.id}
                asset={a}
                selected={a.id === selectedId}
                onSelect={() => selectAsset(a)}
              />
            ))}
          </div>
        ) : (
          <div className={gridClass}>
            {listItems.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                selected={a.id === selectedId}
                onSelect={() => selectAsset(a)}
              />
            ))}
          </div>
        )}

        {type !== "" && !showError && total > 0 && (
          <LoadMore
            shown={listItems.length}
            total={total}
            hasMore={list.hasMore}
            loading={list.isLoadingMore}
            failed={Boolean(list.error)}
            onClick={list.error ? list.retry : list.loadMore}
          />
        )}

      </section>

      <AssetPanel asset={selected} onClose={closePanel} />
    </>
  );
}
