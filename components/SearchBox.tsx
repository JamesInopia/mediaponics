"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, EllipsisVertical } from "lucide-react";

const TYPES = [
  "Images",
  "Vectors",
  "GIFs",
  "Music",
  "Sound Effects",
  "Stock Footage",
];

const LICENSES = [
  { value: "", label: "Any license" },
  { value: "cc0", label: "CC0 / Public domain" },
  { value: "cc-by", label: "CC BY" },
  { value: "cc-by-sa", label: "CC BY-SA" },
  { value: "non-commercial", label: "Non-commercial" },
];

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [license, setLicense] = useState("");
  const [commercialOnly, setCommercialOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeFilters = (license ? 1 : 0) + (commercialOnly ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
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

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type) params.set("type", type);
    if (license) params.set("license", license);
    if (commercialOnly) params.set("commercial", "1");
    const qs = params.toString();
    router.push(qs ? `/content?${qs}` : "/content");
  }

  function clearFilters() {
    setLicense("");
    setCommercialOnly(false);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div className="relative rounded-xl border border-black bg-white p-4 shadow-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sound effects, music, graphics..."
          aria-label="Search assets"
          className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
        />

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Asset type"
              className="cursor-pointer appearance-none rounded-md bg-transparent py-1.5 pl-2 pr-7 text-sm hover:bg-black/5"
            >
              <option value="">All assets</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>

          <div className="flex items-center gap-2">
            <div ref={menuRef}>
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
                  className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-black/10 bg-white p-4 text-sm shadow-lg"
                >
                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-wide text-black/60">
                      License
                    </legend>
                    <div className="mt-2 space-y-1">
                      {LICENSES.map((l) => (
                        <label
                          key={l.value}
                          className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-black/5"
                        >
                          <input
                            type="radio"
                            name="license"
                            value={l.value}
                            checked={license === l.value}
                            onChange={() => setLicense(l.value)}
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
                      onChange={(e) => setCommercialOnly(e.target.checked)}
                      className="accent-black"
                    />
                    Commercial use allowed
                  </label>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={clearFilters}
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
        {TYPES.map((t) => {
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