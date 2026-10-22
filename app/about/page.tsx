import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageNav from "@/components/PageNav";

const navItems = [
  { id: "about", label: "About the Project" },
  { id: "how-it-works", label: "How it works" },
  { id: "sources", label: "Sources" },
  { id: "creators", label: "Creators" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "contact", label: "Contact" },
];

const cardClass = "rounded-xl border border-black/10 bg-white p-6 shadow-md";
const bodyClass = "text-sm leading-7 text-black/70";

const supportedSources = ["Source 1", "Source 2", "Source 3"];

const creators = [{ name: "Creator 1" }, { name: "Creator 2" }];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        icon={<Info size={16} aria-hidden />}
        eyebrow="Know the project"
        title="About"
        subtitle="Behind the scenes: See what this project is all about."
      />

      <div className="lg:pr-[min(21rem,max(0px,calc(1632px_-_100vw)))]">
        <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
          <Section id="about" title="About the Project">
            <p className={bodyClass}>
              Mediaponics is an open-source search for free and licensed assets
              for video editors: sound effects, music, graphics, and b-roll.
              These assets are scattered across dozens of sites, each with its
              own license. Mediaponics brings them into one search and shows
              what you are allowed to do with each one.
            </p>
          </Section>

          <Section id="how-it-works" title="How it works">
            <p className={bodyClass}>
              We index metadata (title, creator, duration, license and link)
              and send you to the official source. We don&apos;t host other
              people&apos;s media, so there are no downloads here: for every
              asset we show the license and attribution you need, and link to
              the official page where you can get the file.
            </p>
          </Section>

          <Section id="sources" title="Sources">
            <div className="grid gap-6 md:grid-cols-2">
              <div className={cardClass}>
                <h3 className="text-xl font-bold">Supported Source</h3>
                <p className={`mt-3 ${bodyClass}`}>
                  Sites whose assets we search and link to. Each one is listed
                  with the asset types it offers and its license.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {supportedSources.map((name) => (
                    <li key={name} className="flex justify-between gap-4">
                      <span className="font-semibold">{name}</span>
                      <span className="text-black/60">Asset types · License</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={cardClass}>
                <h3 className="text-xl font-bold">Open Source</h3>
                <p className={`mt-3 ${bodyClass}`}>
                  Mediaponics is open source. The code and license rules live
                  in a public repository, and anyone can add a source, fix a
                  license entry or report an error.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link href="/" className="font-semibold underline">
                      Repository
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="font-semibold underline">
                      How to contribute
                    </Link>
                  </li>
                  <li className="text-black/60">Project license: to be added</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="creators" title="Creators">
            <div className="grid gap-6 md:grid-cols-2">
              {creators.map(({ name }) => (
                <div key={name} className={cardClass}>
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="mt-3 text-sm text-black/70">Roles:</p>
                  <p className="mt-1 text-sm text-black/70">Contribution:</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="disclaimer" title="Disclaimer">
            <p className={bodyClass}>
              Mediaponics is informational only. The license set by each source
              is the authority, so always check the official page before using
              an asset. License details shown here may be out of date.
            </p>
          </Section>

          <Section id="contact" title="Contact">
            <p className={bodyClass}>
              Questions, corrections or removal requests? Contact details will
              be added here.
            </p>
          </Section>
        </div>
      </div>

      <PageNav items={navItems} />
    </main>
  );
}