"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

type Item = { id: string; label: string };

export default function OnThisPage({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lockRef = useRef<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (lockRef.current) return;
      const atBottom =
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(items[items.length - 1].id);
        return;
      }
      let current = items[0].id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };

    const syncFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (items.some((i) => i.id === hash)) {
        lockRef.current = hash;
        setActive(hash);
      } else {
        update();
      }
    };

    const release = () => {
      lockRef.current = null;
    };

    syncFromHash();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("mousedown", release);
    window.addEventListener("keydown", release);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("mousedown", release);
      window.removeEventListener("keydown", release);
    };
  }, [items]);

  function choose(id: string) {
    lockRef.current = id;
    setActive(id);
  }

  return (
    <>
      <div className="rounded-xl border border-black/10 bg-white shadow-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <FileText size={16} /> On this page
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileOpen && (
          <ul className="border-t border-black/10 px-4 py-2">
            {items.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => {
                    choose(id);
                    setMobileOpen(false);
                  }}
                  className="block py-2 text-sm text-black/70 hover:text-black"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <nav
        aria-label="On this page"
        className="sticky top-8 hidden lg:block"
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-black/60">
          <FileText size={16} /> On this page
        </p>
        <ul className="mt-4 border-l border-black/10">
          {items.map(({ id, label }) => {
            const on = id === active;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => choose(id)}
                  aria-current={on ? "location" : undefined}
                  className={`-ml-px block border-l-2 py-2 pl-4 text-sm transition-colors ${
                    on
                      ? "border-black font-semibold text-black"
                      : "border-transparent text-black/60 hover:text-black"
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}