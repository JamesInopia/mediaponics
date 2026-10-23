import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageNav from "@/components/PageNav";
import { REPO_URL } from "@/lib/site";

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

const supportedSources = [
  { name: "Wikimedia Commons", detail: "Asset types · License" },
]; // placeholder

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

      <div className="lg:pr-[min(21rem,max(0px,calc(1632px-100vw)))]">
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

          <Section id="how-it-works" title="How It Works">
            <div className="space-y-4">
              <p className={bodyClass}>
                Mediaponics collects information about assets from public
                sources: the title, creator, type, duration, license and a link
                back to the original page. We don&apos;t copy or host the media
                itself, so there are no downloads here.
              </p>
              <p className={bodyClass}>
                When you find something, the details panel explains its license
                in plain language, tells you whether commercial use is allowed,
                and has a Go to source button. The file and the full license
                text come from the source, so you always get the current terms
                from whoever publishes the asset.
              </p>
              <p className={bodyClass}>
                If the license asks for credit, you give it when you publish
                your project. The{" "}
                <Link
                  href="/faq#attribution"
                  className="font-semibold underline"
                >
                  FAQ
                </Link>{" "}
                explains what a credit line should include.
              </p>
            </div>
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
                  {supportedSources.map(({ name, detail }) => (
                    <li key={name} className="flex justify-between gap-4">
                      <span className="font-semibold">{name}</span>
                      <span className="text-black/60">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={cardClass}>
                <h3 className="text-xl font-bold">Open Source</h3>
                <p className={`mt-3 ${bodyClass}`}>
                  Mediaponics is open source. The code and license rules live in
                  a public repository, and anyone can add a source, fix a
                  license entry or report an error.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link
                      href={REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      Repository
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="font-semibold underline">
                      How to contribute
                    </Link>
                  </li>
                  <li className="text-black/60">
                    Project license: to be added
                  </li>
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
