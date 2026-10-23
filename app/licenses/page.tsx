import Link from "next/link";
import { Scale } from "lucide-react";
import LegalPage, { bodyClass, cardClass } from "@/components/LegalPage";
import { LICENSES, type LicenseId } from "@/lib/assets";

// Typed as Record<LicenseId, ...> so TypeScript flags this file
// if a new license is ever added to LICENSES.
const details: Record<LicenseId, { credit: string; adaptations: string }> = {
  cc0: {
    credit: "Not required",
    adaptations: "Allowed",
  },
  "cc-by": {
    credit: "Required",
    adaptations: "Allowed",
  },
  "cc-by-sa": {
    credit: "Required",
    adaptations: "Allowed, but your adapted version must use the same license",
  },
  "non-commercial": {
    credit: "Required",
    adaptations: "Allowed, for non-commercial use only",
  },
};

const licenseIds = Object.keys(LICENSES) as LicenseId[];

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1">
      <dt className="shrink-0 font-semibold">{label}:</dt>
      <dd className="text-black/80">{value}</dd>
    </div>
  );
}

export default function LicensesPage() {
  return (
    <LegalPage
      icon={<Scale size={16} aria-hidden />}
      eyebrow="Before you use an asset"
      title="License summary"
      subtitle="What each license on Mediaponics lets you do, in plain language."
      sections={[
        {
          id: "licenses",
          title: "The Licenses We Show",
          content: (
            <div className="grid gap-6 md:grid-cols-2">
              {licenseIds.map((id) => {
                const license = LICENSES[id];
                const d = details[id];
                return (
                  <div key={id} className={cardClass}>
                    <h3 className="text-xl font-bold">{license.label}</h3>
                    <p className={`mt-3 ${bodyClass}`}>{license.description}</p>
                    <dl className="mt-4 space-y-1.5 text-sm">
                      <Fact
                        label="Commercial use"
                        value={license.commercial ? "Allowed" : "Not allowed"}
                      />
                      <Fact label="Credit" value={d.credit} />
                      <Fact label="Adaptations" value={d.adaptations} />
                    </dl>
                  </div>
                );
              })}
            </div>
          ),
        },
        {
          id: "credit",
          title: "Giving Credit",
          content: (
            <div className="space-y-4">
              <p className={bodyClass}>
                When a license asks for credit, include the title, the creator,
                where you found it, and the license name, with links where you
                can. If you changed the asset, say so. The{" "}
                <Link
                  href="/faq#attribution"
                  className="font-semibold underline"
                >
                  FAQ
                </Link>{" "}
                has an example.
              </p>
              <p className={bodyClass}>
                To read more about Creative Commons licenses, see the{" "}
                <a
                  href="https://creativecommons.org/share-your-work/cclicenses/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  Creative Commons guide
                </a>
                .
              </p>
            </div>
          ),
        },
        {
          id: "before-you-use",
          title: "Before You Use An Asset",
          content: (
            <ul className={`list-disc space-y-2 pl-5 ${bodyClass}`}>
              <li>
                Open the asset&apos;s source page and read the license there.
                Creators can change or remove an asset at any time.
              </li>
              <li>
                Check the license version. Terms can differ between versions of
                the same license.
              </li>
              <li>
                A license covers the creator&apos;s copyright. It may not cover
                other rights, such as trademarks or the likeness of people who
                appear in the asset.
              </li>
            </ul>
          ),
        },
        {
          id: "disclaimer",
          title: "Disclaimer",
          content: (
            <p className={bodyClass}>
              License information on Mediaponics is informational only and is
              not legal advice. It is a plain-language summary, and it may be
              incomplete or out of date. The license published by the source
              site is the authority. If the source and Mediaponics disagree,
              follow the source, and check the official page before you use any
              asset.
            </p>
          ),
        },
      ]}
    />
  );
}
