"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, EllipsisVertical } from "lucide-react";
import {
  DATE_RANGE_OPTIONS,
  LICENSES,
  LICENSE_IDS,
  SORT_OPTIONS,
  toggleLicense,
  type DateRangeId,
  type LicenseId,
  type SortId,
} from "@/lib/assets";

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return { open, setOpen, ref };
}

const legendClass =
  "text-xs font-semibold uppercase tracking-wide text-black/60";
const optionClass =
  "flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-black/5";
const badgeClass =
  "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white";

function popoverClass(align: "left" | "right") {
  return `absolute ${align === "right" ? "right-0" : "left-0"} top-full z-20 mt-2 w-64 rounded-xl border border-black/10 bg-white p-4 text-left text-sm shadow-lg`;
}

/* ---------------------------------------------------------------- Sort and date */

type SortDateProps = {
  sort: SortId;
  dateRange: DateRangeId;
  onSortChange: (value: SortId) => void;
  onDateRangeChange: (value: DateRangeId) => void;
  align?: "left" | "right";
  /** Hide the "Sort & date" text on small screens (chevron only). */
  compact?: boolean;
};

export function SortDateMenu({
  sort,
  dateRange,
  onSortChange,
  onDateRangeChange,
  align = "left",
  compact = false,
}: SortDateProps) {
  const { open, setOpen, ref } = usePopover();
  const active = (sort !== "relevance" ? 1 : 0) + (dateRange !== "any" ? 1 : 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Sort and date added"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-9 items-center gap-1.5 rounded-md px-2 text-sm hover:bg-black/5"
      >
        <span className={compact ? "hidden sm:inline" : ""}>Sort &amp; date</span>
        <ChevronDown size={14} />
        {active > 0 && <span className={badgeClass}>{active}</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Sort and date added"
          className={popoverClass(align)}
        >
          <fieldset>
            <legend className={legendClass}>Sort by</legend>
            <div className="mt-2 space-y-1">
              {SORT_OPTIONS.map((o) => (
                <label key={o.value} className={optionClass}>
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
            <legend className={legendClass}>Date added</legend>
            <div className="mt-2 space-y-1">
              {DATE_RANGE_OPTIONS.map((o) => (
                <label key={o.value} className={optionClass}>
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

/* --------------------------------------------------------------------- License */

type LicenseProps = {
  /** Selected licenses. [] means "All". */
  licenses: LicenseId[];
  onChange: (next: LicenseId[]) => void;
  align?: "left" | "right";
};

export function LicenseMenu({
  licenses,
  onChange,
  align = "right",
}: LicenseProps) {
  const { open, setOpen, ref } = usePopover();
  const all = licenses.length === 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter by license"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-black/5"
      >
        <EllipsisVertical size={18} />
        {!all && <span className={badgeClass}>{licenses.length}</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Filter by license"
          className={popoverClass(align)}
        >
          <fieldset>
            <legend className={legendClass}>License</legend>
            <div className="mt-2 space-y-1">
              {/* Checking All clears the filter. Unchecking it does nothing: pick a license instead. */}
              <label className={`${optionClass} font-semibold`}>
                <input
                  type="checkbox"
                  checked={all}
                  onChange={() => {
                    if (!all) onChange([]);
                  }}
                  className="accent-black"
                />
                All
              </label>
              {LICENSE_IDS.map((id) => (
                <label key={id} className={optionClass}>
                  <input
                    type="checkbox"
                    checked={all || licenses.includes(id)}
                    onChange={() => onChange(toggleLicense(licenses, id))}
                    className="accent-black"
                  />
                  {LICENSES[id].label}
                  {!LICENSES[id].commercial && (
                    <span className="text-xs text-black/50">
                      (no commercial use)
                    </span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onChange([])}
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
