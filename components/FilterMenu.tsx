"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { LICENSE_OPTIONS } from "@/lib/assets";

type Props = {
  license: string;
  commercialOnly: boolean;
  onLicenseChange: (value: string) => void;
  onCommercialChange: (value: boolean) => void;
};

export default function FilterMenu({
  license,
  commercialOnly,
  onLicenseChange,
  onCommercialChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeFilters = (license ? 1 : 0) + (commercialOnly ? 1 : 0);

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
        aria-label="More filters"
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
          aria-label="More filters"
          className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-black/10 bg-white p-4 text-left text-sm shadow-lg"
        >
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-black/60">
              License
            </legend>
            <div className="mt-2 space-y-1">
              {LICENSE_OPTIONS.map((l) => (
                <label
                  key={l.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-black/5"
                >
                  <input
                    type="radio"
                    name="license"
                    value={l.value}
                    checked={license === l.value}
                    onChange={() => onLicenseChange(l.value)}
                    className="accent-black"
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-3 flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-black/5">
            <input
              type="checkbox"
              checked={commercialOnly}
              onChange={(e) => onCommercialChange(e.target.checked)}
              className="accent-black"
            />
            Commercial use allowed
          </label>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onLicenseChange("");
                onCommercialChange(false);
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