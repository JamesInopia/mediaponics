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

const creators = [
  { name: "Name 1", role: "Roles" },
  { name: "Name 2", role: "Roles" },
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

        <div className="mt-6 grid gap-6 md:grid-cols-[3fr_2fr]">
          <Link
            href="/"
            className="min-h-64 rounded-xl border border-black/10 bg-white p-6 shadow-md transition hover:shadow-lg"
          >
            <h3 className="text-xl font-bold">Link to repository</h3>
          </Link>

          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-md">
            <h3 className="text-xl font-bold">Check out the Creators</h3>
            <ul className="mt-4 space-y-3">
              {creators.map(({ name, role }) => (
                <li
                  key={name}
                  className="flex items-center gap-4 rounded-lg border border-black/10 bg-white p-3 shadow-md"
                >
                  <div className="h-14 w-14 shrink-0 rounded-full border border-black/10 bg-neutral-100" />
                  <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-sm font-semibold">{role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
