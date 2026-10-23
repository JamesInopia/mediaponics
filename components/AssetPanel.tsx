"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsRight, ExternalLink } from "lucide-react";
import {
  CLIP_SECONDS,
  LicenseBadge,
  PlayButton,
  PreviewImage,
  Waveform,
  seedOf,
  useAudioPreview,
} from "@/components/AssetViews";
import {
  LICENSES,
  formatAddedDate,
  formatDuration,
  isAudio,
  sourceName,
  type Asset,
} from "@/lib/assets";

export default function AssetPanel({
  asset,
  onClose,
}: {
  asset: Asset | null;
  onClose: () => void;
}) {
  const [shown, setShown] = useState<Asset | null>(asset);
  if (asset && asset !== shown) setShown(asset);

  const open = asset !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open, asset?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!shown) return null;

  return (
    <aside
      role="dialog"
      aria-label={`Details for ${shown.title}`}
      inert={!open}
      className={`fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-black/10 bg-white shadow-xl transition-transform duration-300 motion-reduce:transition-none sm:w-104 md:w-120 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="rounded-md p-1.5 hover:bg-black/5"
        >
          <ChevronsRight size={20} />
        </button>
        <p className="text-xs font-semibold uppercase tracking-wider text-black/60">
          {shown.type}
        </p>
      </div>

      <PanelBody key={`${shown.id}-${open}`} asset={shown} />
    </aside>
  );
}

function PanelBody({ asset }: { asset: Asset }) {
  const license = LICENSES[asset.license];
  const audio = isAudio(asset.type);
  const duration = asset.durationSec ?? 0;
  const seed = seedOf(asset.id);
  const { playing, progress, toggle, failed, audioEl } = useAudioPreview(
    asset.previewUrl,
  );

  const actionBase =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold";

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8">
      <a
        href={asset.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${actionBase} w-full bg-black text-white hover:bg-black/80`}
      >
        <ExternalLink size={16} /> Go to source
      </a>
      <p className="mt-2 text-xs text-black/60">
        Files are hosted by the source. Get this one, with its terms, there.
      </p>

      <hr className="my-6 border-black/10" />

      {audio ? (
        <div className="relative flex flex-col items-center gap-4 rounded-xl bg-neutral-50 px-4 py-8">
          {audioEl}
          <PlayButton
            playing={playing}
            onClick={toggle}
            title={asset.title}
            large
          />
          <Waveform
            seed={seed}
            progress={progress}
            bars={40}
            className="h-10 justify-center"
          />
          {(failed || duration > CLIP_SECONDS) && (
            <span className="text-xs text-black/50">
              {failed ? "Preview unavailable" : `${CLIP_SECONDS}s preview`}
            </span>
          )}
        </div>
      ) : (
        <PreviewImage asset={asset} className="aspect-video rounded-xl" />
      )}

      <h2 className="mt-6 text-2xl font-bold leading-snug">{asset.title}</h2>
      <p className="mt-1 text-sm text-black/60">by {asset.creator}</p>

      <dl className="mt-4 space-y-1.5 text-sm">
        {asset.durationSec !== undefined && (
          <Row label="Duration" value={formatDuration(asset.durationSec)} />
        )}
        {asset.genre && <Row label="Genre" value={asset.genre} />}
        <Row label="Type" value={asset.type} />
        <Row label="Source" value={sourceName(asset.source)} />
        <Row label="Added" value={formatAddedDate(asset.addedAt)} />
      </dl>

      {asset.tags && asset.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
          {asset.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-black/20 px-3 py-0.5 text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <hr className="my-6 border-black/10" />
      <div className="flex items-center gap-3">
        <LicenseBadge asset={asset} />
        <p className="text-sm font-semibold">
          {license.commercial ? "Commercial use allowed" : "No commercial use"}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-black/70">
        {license.description}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1">
      <dt className="font-semibold">{label}:</dt>
      <dd className="text-black/80">{value}</dd>
    </div>
  );
}
