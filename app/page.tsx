import Link from "next/link";
import { ChevronDown, CircleHelp, FilePenLine, Info } from "lucide-react";
import SearchBox from "@/components/SearchBox";
import HeroCarousel from "@/components/HeroCarousel";

const cards = [
  {
    href: "/content",
    title: "View our Content",
    Icon: FilePenLine,
    text: "Want to check out everything we have to offer? Click here to browse through our content!",
  },
  {
    href: "/about",
    title: "About",
    Icon: Info,
    text: "Want to know more about what our site is about? Click here and learn more about the site in the About section!",
  },
  {
    href: "/faq",
    title: "FAQ",
    Icon: CircleHelp,
    text: "Still have questions about our site? Click here and visit the FAQ section!",
  },
];

const REPO_URL = "https://github.com/JamesInopia/mediaponics";
function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const creators = [
  { name: "James Angelo Inopia", role: "Project Manager, Fullstack Developer" },
  { name: "Harvey Tyson Ablen", role: "Back-end Developer" },
];

export default function Home() {
  return (
    <main>
      <section className="grid border-b border-black/10 md:min-h-[calc(100vh-4rem-3.5rem)] md:grid-cols-2">
        <div className="flex items-center px-6 py-16 md:px-16">
          <div className="w-full">
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Every asset. Every license. One search.
            </h1>
            <p className="mt-4 max-w-md text-sm text-black/70">
              We index free and licensed sound effects, music, graphics, and{" "}
              <span className="whitespace-nowrap">b-roll</span> from across the
              web, and show exactly what you can do with each one.
            </p>
            <div className="mt-8">
              <SearchBox />
            </div>
          </div>
        </div>

        <div className="relative min-h-[320px] border-black/10 md:border-l">
          <HeroCarousel />
        </div>
      </section>

      <a
        href="#explore"
        className="flex h-14 items-center justify-center gap-1 border-b border-black/10 text-sm hover:bg-black/5"
      >
        Learn More <ChevronDown size={16} />
      </a>

      <section id="explore" className="mx-auto max-w-7xl scroll-mt-4 px-6 py-12">
        <h2 className="text-2xl font-bold">More to explore</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {cards.map(({ href, title, Icon, text }) => (
            <Link
              key={title}
              href={href}
              className="flex flex-col items-center gap-4 rounded-xl border border-black/10 bg-white p-8 text-center shadow-md transition duration-200 hover:scale-105 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:scale-100"            >
              <Icon size={28} strokeWidth={1.75} />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-sm text-black/70">{text}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold">Link to Repository</h2>
        <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-[#444c56] bg-[#22272e] p-6 text-[#cdd9e5] shadow-lg md:flex-row md:items-center md:gap-8 md:px-10 md:py-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#444c56] bg-[#2d333b]">
            <GithubMark className="h-9 w-9" />
          </div>
          <p className="min-w-0 text-sm leading-7 text-[#adbac7] md:max-w-xl md:text-base md:leading-8">
            Mediaponics is open source. Browse the code, report an issue, or
            help us add a new source or fix a license entry.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#347d39] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#46954a] md:ml-auto"
          >
            <GithubMark className="h-4 w-4" /> View on GitHub
          </a>
        </div>

        <h2 className="mt-12 text-2xl font-bold">Check out the Creators</h2>
        <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 shadow-md">
          <ul className="grid gap-4 md:grid-cols-2">
            {creators.map(({ name, role }) => (
              <li
                key={name}
                className="flex items-center gap-6 rounded-lg border border-black/10 bg-white p-3 shadow-md"
              >
                <div className="h-20 w-20 shrink-0 rounded-full border border-black/10 bg-neutral-100 shadow-md" />
                <div>
                  <p className="text-xl font-bold">{name}</p>
                  <p className="mt-1 text-sm font-semibold">{role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
