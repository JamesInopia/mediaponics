import type { LicenseId } from "@/lib/assets";

export type LicenseMatch =
  | { ok: true; license: LicenseId; version?: string }
  | { ok: false; reason: "missing_license" | "unmapped_license"; detail?: string };

export function mapCommonsLicense(shortName: string | undefined): LicenseMatch {
  const raw = (shortName ?? "").trim().replace(/\s+/g, " ");
  if (!raw) return { ok: false, reason: "missing_license" };

  if (/^CC0(?: 1\.0)?(?: Universal)?$/i.test(raw)) {
    return { ok: true, license: "cc0", version: "1.0" };
  }

  if (/^public domain$/i.test(raw)) {
    return { ok: true, license: "cc0" };
  }

  let m = /^CC[ -]BY[ -]SA (\d\.\d)$/i.exec(raw);
  if (m) return { ok: true, license: "cc-by-sa", version: m[1] };

  m = /^CC[ -]BY (\d\.\d)$/i.exec(raw);
  if (m) return { ok: true, license: "cc-by", version: m[1] };

  m = /^CC[ -]BY[ -]NC (\d\.\d)$/i.exec(raw);
  if (m) return { ok: true, license: "non-commercial", version: m[1] };

  return { ok: false, reason: "unmapped_license", detail: raw };
}

export function requiresAttribution(license: LicenseId): boolean {
  return license !== "cc0";
}
