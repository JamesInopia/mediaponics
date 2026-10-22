"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ExternalLink, Pause, Play } from "lucide-react";
import {
  LICENSES,
  formatDuration,
  isAudio,
  sourceName,
  type Asset,
} from "@/lib/assets";

export const CLIP_SECONDS = 5;

export function seedOf(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function useFakePlayback(durationSec: number) {
  const clip = Math.max(1, Math.min(durationSec, CLIP_SECONDS));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const startedAt = performance.now() - progressRef.current * clip * 1000;
    const id = setInterval(() => {
      const p = (performance.now() - startedAt) / (clip * 1000);
      if (p >= 1) {
        progressRef.current = 0;
        setProgress(0);
        setPlaying(false);
        return;
      }
      progressRef.current = p;
      setProgress(p);
    }, 100);
    return () => clearInterval(id);
  }, [playing, clip]);

  return { playing, progress, toggle: () => setPlaying((p) => !p) };
}

export function Waveform({
  seed,
  progress,
  bars = 36,
  className = "",
}: {
  seed: number;
  progress: number;
  bars?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={`flex items-center gap-[3px] ${className}`}>
      {Array.from({ length: bars }, (_, i) => {
        const h = 25 + (((seed >>> (i % 16)) * (i + 7) * 13) % 70);
        const played = (i + 1) / bars <= progress;
        return (
          <span
            key={i}
            className={`w-[3px] rounded-full ${played ? "bg-black" : "bg-black/20"}`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

export function PlayButton({
  playing,
  onClick,
  title,
  large = false,
}: {
  playing: boolean;
  onClick: () => void;
  title: string;
  large?: boolean;
}) {
  const Icon = playing ? Pause : Play;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={playing}
      aria-label={`${playing ? "Pause" : "Play"} preview of ${title}`}
      className={`flex shrink-0 items-center justify-center rounded-full bg-black text-white hover:bg-black/80 ${
        large ? "h-14 w-14" : "h-11 w-11"
      }`}
    >
      <Icon
        size={large ? 22 : 18}
        fill="currentColor"
        className={playing ? "" : "ml-0.5"}
      />
    </button>
  );
}

export function LicenseBadge({ asset }: { asset: Asset }) {
  const license = LICENSES[asset.license];
  const open = asset.license === "cc0";
  return (
    <span
      title={license.description}
      className={`inline-flex min-w-[5.5rem] shrink-0 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        open ? "border-black bg-black text-white" : "border-black/30"
      }`}
    >
      {license.label}
    </span>
  );
}

function AssetAction({ asset }: { asset: Asset }) {
  return (
    <a
      href={asset.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-[7.5rem] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-black px-3 py-1.5 text-xs font-semibold hover:bg-black hover:text-white"
    >
      <ExternalLink size={14} /> Go to source
    </a>
  );
}

type ViewProps = {
  asset: Asset;
  selected?: boolean;
  onSelect: () => void;
};

function openUnlessInteractive(e: MouseEvent, onSelect: () => void) {
  if ((e.target as HTMLElement).closest("a, button")) return;
  onSelect();
}

export const LIFT_HOVER =
  "transition duration-200 hover:scale-105 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:scale-100";
export const GRAY_HOVER =
  "transition-colors duration-200 hover:bg-neutral-100 motion-reduce:transition-none";

const titleButtonClass =
  "block w-full truncate text-left font-semibold hover:underline";

export function AssetCard({ asset, selected = false, onSelect }: ViewProps) {
  const audio = isAudio(asset.type);
  const seed = seedOf(asset.id);
  const duration = asset.durationSec ?? 0;
  const { playing, progress, toggle } = useFakePlayback(duration);

  return (
    <article
      onClick={(e) => openUnlessInteractive(e, onSelect)}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-md ${LIFT_HOVER} ${selected ? "border-black ring-1 ring-black" : "border-black/10"}`}
    >
      {audio ? (
        <div className="relative flex aspect-video flex-col items-center justify-center gap-4 bg-neutral-50">
          <PlayButton
            playing={playing}
            onClick={toggle}
            title={asset.title}
            large
          />
          <Waveform
            seed={seed}
            progress={progress}
            bars={32}
            className="h-8 justify-center"
          />
          {duration > CLIP_SECONDS && (
            <span className="absolute bottom-2 left-3 text-[11px] text-black/50">
              {CLIP_SECONDS}s preview
            </span>
          )}
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            {formatDuration(duration)}
          </span>
        </div>
      ) : (
        <div
          className="relative flex aspect-video items-center justify-center"
          style={{ backgroundColor: `hsl(0 0% ${92 - (seed % 5) * 4}%)` }}
        >
          <span className="text-xs font-semibold tracking-[0.3em] text-black/40">
            PREVIEW
          </span>
          {asset.durationSec !== undefined && (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              {formatDuration(asset.durationSec)}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 title={asset.title}>
            <button
              type="button"
              onClick={onSelect}
              aria-haspopup="dialog"
              className={titleButtonClass}
            >
              {asset.title}
            </button>
          </h3>
          <p className="truncate text-sm text-black/60">
            by {asset.creator} · {sourceName(asset.source)}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <LicenseBadge asset={asset} />
          <AssetAction asset={asset} />
        </div>
      </div>
    </article>
  );
}

export function AssetRow({ asset, selected = false, onSelect }: ViewProps) {
  const seed = seedOf(asset.id);
  const duration = asset.durationSec ?? 0;
  const { playing, progress, toggle } = useFakePlayback(duration);

  return (
    <article
      onClick={(e) => openUnlessInteractive(e, onSelect)}
      className={`flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-white p-4 shadow-md ${GRAY_HOVER} ${
        selected ? "border-black ring-1 ring-black" : "border-black/10"
      }`}
    >
      <PlayButton playing={playing} onClick={toggle} title={asset.title} />
      <div className="min-w-0 flex-1 basis-44">
        <h3 title={asset.title}>
          <button
            type="button"
            onClick={onSelect}
            aria-haspopup="dialog"
            className={titleButtonClass}
          >
            {asset.title}
          </button>
        </h3>
        <p className="truncate text-sm text-black/60">
          by {asset.creator} · {sourceName(asset.source)}
        </p>
      </div>
      <Waveform
        seed={seed}
        progress={progress}
        bars={40}
        className="hidden h-8 w-48 md:flex lg:w-80 xl:w-[28rem]"
      />
      <span
        className="w-10 shrink-0 text-right text-sm tabular-nums text-black/70"
        title={
          duration > CLIP_SECONDS ? `${CLIP_SECONDS}s preview` : undefined
        }
      >
        {formatDuration(duration)}
      </span>
      <LicenseBadge asset={asset} />
      <AssetAction asset={asset} />
    </article>
  );
}