export const SKIP_REASONS = [
  "no_imageinfo",
  "missing_license",
  "unmapped_license",
  "restricted",
  "missing_creator",
  "creator_unusable",
  "unsupported_media_type",
  "audio_type_unclear",
  "no_preview",
] as const;

export type SkipReason = (typeof SKIP_REASONS)[number];

export type Skip = {
  source: string;
  sourceId: string;
  title: string;
  reason: SkipReason;
  detail?: string;
};
