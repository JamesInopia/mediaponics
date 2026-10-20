import Link from "next/link";

const columns = [
  {
    title: "Developers",
    links: ["API docs", "Data snapshot", "Status", "Source code"],
  },
  {
    title: "Legal",
    links: [
      "License summary",
      "Terms",
      "Privacy",
      "Accessibility",
      "Report content",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[2fr_1fr_1fr]">
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
              {links.map((label) => (
                <li key={label}>
                  <Link
                    href="/"
                    className="text-black/70 hover:text-black hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-black/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-5 text-xs text-black/60 md:flex-row md:justify-between">
          <p>Mediaponics is open source.</p>
          <p>Informational only. The source site&apos;s license is the authority.</p>
        </div>
      </div>
    </footer>
  );
}