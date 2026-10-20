"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, ChevronUp } from "lucide-react";

export type PageNavItem = { id: string; label: string };

const SHOW_AFTER = 400;

export default function PageNav({ items }: { items: PageNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const update = () => {
      setVisible(window.scrollY > SHOW_AFTER);
      if (sections.length === 0) return;

      const threshold = window.innerHeight * 0.3;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top - threshold <= 0) {
          current = section.id;
        }
      }
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        current = sections[sections.length - 1].id;
      }
      setActiveId(current);
    };

    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setExpanded(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const activeLabel = items.find((i) => i.id === activeId)?.label ?? "";
  const isExpanded = expanded && visible;

  return (
    <div
      ref={rootRef}
      inert={!visible}
      className={`fixed right-4 top-4 z-50 flex items-start gap-3 transition-opacity duration-300 motion-reduce:transition-none md:right-6 md:top-6 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <nav
        aria-label="Page sections"
        className="w-64 max-w-[calc(100vw-6.5rem)] rounded-xl border border-black/10 bg-white p-4 shadow-lg"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-black/60">
          Current Section:
        </p>

        {isExpanded ? (
          <ul className="mt-2">
            {items.map(({ id, label }, i) => {
              const active = id === activeId;
              return (
                <li key={id} className="flex items-center">
                  <a
                    href={`#${id}`}
                    onClick={() => {
                      setActiveId(id);
                      setExpanded(false);
                    }}
                    aria-current={active ? "location" : undefined}
                    className={`block flex-1 border-l-2 py-1.5 pl-3 text-sm ${
                      active
                        ? "border-black font-semibold text-black"
                        : "border-transparent text-black/60 hover:text-black"
                    }`}
                  >
                    {label}
                  </a>
                  {i === 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded(false)}
                      aria-label="Collapse section list"
                      className="ml-2 rounded p-1 hover:bg-black/5"
                    >
                      <ChevronUp size={18} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-label="Show all sections"
            className="mt-2 flex w-full items-center justify-between gap-2 text-left text-sm font-semibold"
          >
            <span className="truncate">{activeLabel}</span>
            <ChevronDown size={18} className="shrink-0" />
          </button>
        )}
      </nav>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-lg hover:bg-black/5"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}
