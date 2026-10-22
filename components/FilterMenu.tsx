"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import {
  DATE_RANGE_OPTIONS,
  SORT_OPTIONS,
  type DateRangeId,
  type SortId,
} from "@/lib/assets";

type Props = {
  sort: SortId;
  dateRange: DateRangeId;
  onSortChange: (value: SortId) => void;
  onDateRangeChange: (value: DateRangeId) => void;
};

export default function FilterMenu({
  sort,
  dateRange,
  onSortChange,
  onDateRangeChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeFilters =
    (sort !== "relevance" ? 1 : 0) + (dateRange !== "any" ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Sort and filter"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-black/5"
      >
        <EllipsisVertical size={18} />
        {activeFilters > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
            {activeFilters}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Sort and filter"
          className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-black/10 bg-white p-4 text-left text-sm shadow-lg"
        >
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-black/60">
              Sort by
            </legend>
            <div className="mt-2 space-y-1">
              {SORT_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-black/5"
                >
                  <input
                    type="radio"
                    name="sort"
                    value={o.value}
                    checked={sort === o.value}
                    onChange={() => onSortChange(o.value)}
                    className="accent-black"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-xs font-semibold uppercase tracking-wide text-black/60">
              Date added
            </legend>
            <div className="mt-2 space-y-1">
              {DATE_RANGE_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-black/5"
                >
                  <input
                    type="radio"
                    name="date-range"
                    value={o.value}
                    checked={dateRange === o.value}
                    onChange={() => onDateRangeChange(o.value)}
                    className="accent-black"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onSortChange("relevance");
                onDateRangeChange("any");
              }}
              className="text-xs underline hover:no-underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-black px-3 py-1 text-xs font-semibold hover:bg-black hover:text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
