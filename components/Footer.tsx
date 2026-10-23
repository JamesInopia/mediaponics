import Link from "next/link";
import { REPO_URL } from "@/lib/site";

type FooterLink = { label: string; href?: string; external?: boolean };

const columns = [
  {
    title: "Developers",
    links: [
      { label: "API Docs" },
      { label: "Data Snapshot" },
      { label: "Status" },
      { label: "Source Code", href: REPO_URL, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "License Summary", href: "/licenses" },
      { label: "Terms" },
      { label: "Privacy" },
      { label: "Accessibility" },
      { label: "Report An Issue" },
    ],
  },
];

const linkClass = "text-black/70 hover:text-black hover:underline";

function FooterItem({ label, href, external }: FooterLink) {
  if (!href) {
    return (
      <span className="text-black/60">
        {label} <span className="text-xs">(coming soon)</span>
      </span>
    );
  }
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#FFFAFA] shadow-[0_-4px_6px_-1px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-xl font-bold tracking-tight">Mediaponics</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-black/70">
            An open-source search for free and licensed sound effects, music,
            graphics, and b-roll. We link to the source; we don&apos;t host
            their media.
          </p>
        </div>

        {columns.map(({ title, links }) => (
          <div key={title}>
            <p className="text-sm font-semibold">{title}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {links.map((link) => (
                <li key={link.label}>
                  <FooterItem {...link} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 pb-6 pt-8 text-xs text-black/60 md:flex-row md:justify-between">
        <p>Mediaponics is open source.</p>
        <p>
          Informational only. The source site&apos;s license is the authority.
        </p>
      </div>
    </footer>
  );
}
