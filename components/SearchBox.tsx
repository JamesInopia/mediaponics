"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import FilterMenu from "@/components/FilterMenu";
import { ASSET_TYPES } from "@/lib/assets";

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState(""); // "" = all asset types
  const [license, setLicense] = useState("");
  const [commercialOnly, setCommercialOnly] = useState(false);

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
          {/* Asset type dropdown (like OpenAlex's "works") */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Asset type"
              className="cursor-pointer appearance-none rounded-md bg-transparent py-1.5 pl-2 pr-7 text-sm hover:bg-black/5"
            >
              <option value="">All assets</option>
              {ASSET_TYPES.map((t) => (
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
            <FilterMenu
              license={license}
              commercialOnly={commercialOnly}
              onLicenseChange={setLicense}
              onCommercialChange={setCommercialOnly}
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