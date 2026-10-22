"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import FilterMenu from "@/components/FilterMenu";
import { AssetCard, AssetRow } from "@/components/AssetViews";
import AssetPanel from "@/components/AssetPanel";
import AssetRail from "@/components/AssetRail";
import {
  ASSET_TYPES,
  MOCK_ASSETS,
  SECTION_ORDER,
  isAudio,
  matchesQuery,
  parseDateRange,
  parseSort,
  sortAssets,
  withinDateRange,
  type Asset,
  type AssetType,
} from "@/lib/assets";

const PATH = "/content";
const PER_SECTION = 4;
const RAIL_MAX = 12;
const gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export default function ContentBrowser() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const type: AssetType | "" = (ASSET_TYPES as readonly string[]).includes(
    typeParam
  )
    ? (typeParam as AssetType)
    : "";
  const sort = parseSort(searchParams.get("sort"));
  const dateRange = parseDateRange(searchParams.get("added"));
  const selectedId = searchParams.get("asset") ?? "";
  const selected = MOCK_ASSETS.find((a) => a.id === selectedId) ?? null;

  function update(
    changes: Record<string, string | null>,
    mode: "push" | "replace" = "push"
  ) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    const url = qs ? `${PATH}?${qs}` : PATH;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  const results = useMemo(
    () =>
      sortAssets(
        MOCK_ASSETS.filter(
          (a) =>
            (!type || a.type === type) &&
            withinDateRange(a, dateRange) &&
            (!q || matchesQuery(a, q))
        ),
        sort
      ),
    [type, dateRange, sort, q]
  );

  const selectAsset = (a: Asset) => update({ asset: a.id });
  const closePanel = () => update({ asset: null });

  const hasSearchOrFilters = Boolean(
    q || sort !== "relevance" || dateRange !== "any"
  );
  const listView = type !== "" && isAudio(type);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(
      new FormData(e.currentTarget).get("q") ?? ""
    ).trim();
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
            placeholder="Search"
            aria-label="Search assets"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
          />
          <FilterMenu
            sort={sort}
            dateRange={dateRange}
            onSortChange={(v) =>
              update({ sort: v === "relevance" ? null : v }, "replace")
            }
            onDateRangeChange={(v) =>
              update({ added: v === "any" ? null : v }, "replace")
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
            {results.length} {results.length === 1 ? "result" : "results"}
            {q ? ` for “${q}”` : ""}
          </p>
          {hasSearchOrFilters && (
            <button
              type="button"
              onClick={() =>
                update({ q: null, sort: null, added: null })
              }
              className="underline hover:no-underline"
            >
              Clear search and filters
            </button>
          )}
        </div>
        {results.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center shadow-md">
            <p className="font-semibold">No assets found</p>
            <p className="mt-1 text-sm text-black/60">
              Try different keywords, another asset type, or a wider date range.
            </p>
          </div>
        ) : type === "" ? (
          <div className="space-y-12">
            {SECTION_ORDER.map((section) => {
              const items = results.filter((a) => a.type === section);
              if (items.length === 0) return null;
              return (
                <section key={section} aria-labelledby={`sec-${section}`}>
                  <div className="mb-4 flex items-baseline justify-between gap-4">
                    <h2
                      id={`sec-${section}`}
                      className="text-xl font-bold"
                    >
                      {section}
                    </h2>
                    {items.length > PER_SECTION && (
                      <button
                        type="button"
                        onClick={() => update({ type: section })}
                        className="text-sm font-semibold underline hover:no-underline"
                      >
                        See all {items.length}
                      </button>
                    )}
                  </div>
                  <AssetRail
                    label={section}
                    viewAll={
                      items.length > RAIL_MAX
                        ? {
                            text: `View all ${items.length} ${section}`,
                            onClick: () => update({ type: section }),
                          }
                        : undefined
                    }
                  >
                    {items.slice(0, RAIL_MAX).map((a) => (
                      <AssetCard
                        key={a.id}
                        asset={a}
                        selected={a.id === selectedId}
                        onSelect={() => selectAsset(a)}
                      />
                    ))}
                  </AssetRail>
                </section>
              );
            })}
          </div>
        ) : listView ? (
          <div className="space-y-4">
            {results.map((a) => (
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
            {results.map((a) => (
              <AssetCard
                        key={a.id}
                        asset={a}
                        selected={a.id === selectedId}
                        onSelect={() => selectAsset(a)}
                      />
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-black/40">
          Sample data for layout preview only.
        </p>
      </section>

      <AssetPanel asset={selected} onClose={closePanel} />
    </>
  );
}