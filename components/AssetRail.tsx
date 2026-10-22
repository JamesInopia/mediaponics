"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { GRAY_HOVER, LIFT_HOVER } from "@/components/AssetViews";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/** Width of one item so that 1 / 2 / 3 / 4 fit per view, matching the grid breakpoints. */
const itemClass =
  "shrink-0 snap-start basis-full sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]";

/**
 * Horizontally scrolling row with left/right arrows.
 * Pass the items as children; optionally add a final "View all" tile.
 */
export default function AssetRail({
  label,
  children,
  viewAll,
  hover = "lift",
}: {
  label: string;
  children: ReactNode[];
  viewAll?: { text: string; onClick: () => void };
  /** Hover style of the View all tile, matching the cards in this row. */
  hover?: "lift" | "gray";
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const frame = requestAnimationFrame(measure);
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, children.length]);

  function scrollByPage(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  const arrowClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white shadow-md transition-opacity duration-200 hover:bg-black/5 motion-reduce:transition-none";

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label={`${label} row`}
    >
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label={`Scroll ${label} left`}
        disabled={!canLeft}
        tabIndex={canLeft ? 0 : -1}
        className={`${arrowClass} ${
          canLeft ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Arrows sit in their own side columns, never over the cards.
          Padding/negative margin keeps card shadows and selection rings from being clipped. */}
      <ul
        ref={scroller}
        className="-mx-3 -my-4 flex min-w-0 flex-1 scroll-px-3 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-3 py-4 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <li key={i} className={`${itemClass} flex`}>
            <div className="w-full [&>*]:h-full">{child}</div>
          </li>
        ))}
        {viewAll && (
          <li className={`${itemClass} flex`}>
            <button
              type="button"
              onClick={viewAll.onClick}
              className={`flex min-h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-black/10 bg-white p-6 text-center font-semibold shadow-md ${
                hover === "gray" ? GRAY_HOVER : LIFT_HOVER
              }`}
            >
              {viewAll.text}
              <ArrowRight size={20} />
            </button>
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label={`Scroll ${label} right`}
        disabled={!canRight}
        tabIndex={canRight ? 0 : -1}
        className={`${arrowClass} ${
          canRight ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
