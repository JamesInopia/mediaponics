"use client";

import { useEffect, useState } from "react";

const COUNT = 3;
const EXT = "jpg";
const INTERVAL_MS = 4000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % COUNT), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none overflow-hidden bg-neutral-100"
    >
      {Array.from({ length: COUNT }, (_, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url("/carousel/${encodeURIComponent(`[${i + 1}]`)}.${EXT}")`,
          }}
        />
      ))}
    </div>
  );
}
