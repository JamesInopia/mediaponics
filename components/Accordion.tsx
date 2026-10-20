"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionItem = {
  question: string;
  answer: string[];
};

export default function Accordion({
  items,
  defaultOpen = null,
  idPrefix,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
  idPrefix: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="rounded-xl border border-black/10 bg-white px-6 shadow-md md:px-8">
      {items.map(({ question, answer }, i) => {
        const isOpen = open === i;
        const panelId = `${idPrefix}-panel-${i}`;
        const buttonId = `${idPrefix}-button-${i}`;
        return (
          <div
            key={question}
            className={i > 0 ? "border-t border-black/10" : undefined}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-bold"
              >
                {question}
                <ChevronDown
                  size={18}
                  className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 pb-6 text-sm leading-7 text-black/70">
                  {answer.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
