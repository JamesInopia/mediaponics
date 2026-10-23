"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LicenseMenu, SortDateMenu } from "@/components/FilterMenu";
import { MAX_QUERY_LENGTH } from "@/lib/api-types";
import {
  ASSET_TYPES,
  type AssetType,
  type DateRangeId,
  type LicenseId,
  type SortId,
} from "@/lib/assets";

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<AssetType | "">("");
  const [sort, setSort] = useState<SortId>("relevance");
  const [dateRange, setDateRange] = useState<DateRangeId>("any");
  const [licenses, setLicenses] = useState<LicenseId[]>([]);

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim().slice(0, MAX_QUERY_LENGTH);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (sort !== "relevance") params.set("sort", sort);
    if (dateRange !== "any") params.set("added", dateRange);
    if (licenses.length > 0) params.set("license", licenses.join(","));
    const qs = params.toString();
    router.push(qs ? `/content?${qs}` : "/content");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div className="relative rounded-xl border border-black bg-white p-4 shadow-md">
        <input
          type="text"
          value={query}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sound effects, music, graphics..."
          aria-label="Search assets"
          className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
        />

        <div className="mt-4 flex items-center justify-between gap-2">
          <SortDateMenu
            sort={sort}
            dateRange={dateRange}
            onSortChange={setSort}
            onDateRangeChange={setDateRange}
            align="left"
          />

          <div className="flex items-center gap-2">
            <LicenseMenu
              licenses={licenses}
              onChange={setLicenses}
              align="right"
            />
            <button
              type="submit"
              className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-black/80"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {ASSET_TYPES.map((t) => {
          const on = type === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => setType(on ? "" : t)}
              className={`rounded-full border border-black px-4 py-1 text-xs ${
                on ? "bg-black text-white" : "bg-white hover:bg-black/5"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </form>
  );
}
