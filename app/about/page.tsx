import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageNav from "@/components/PageNav";
import { SOURCES } from "@/lib/assets";
import { REPO_URL, REPORT_URL } from "@/lib/site";

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
  {
    name: SOURCES.commons.name,
    types: "Images, Vectors, GIFs, Stock Footage, Music, Sound Effects",
    licenses: "CC0 / public domain, CC BY, CC BY-SA, CC BY-NC",
    scope: "Featured media and Featured pictures collections",
    termsUrl: SOURCES.commons.termsUrl,
  },
];

const creators = [
  {
    name: "who?",
    roles: "Project Manager, Fullstack Developer, UI/UX",
    contribution:
      "Created the wireframe and mockup. Implemented the majority of the features and pages.",
    github: "https://github.com/JamesInopia",
  },
  {
    name: "panzerfaust",
    roles: "Fullstack Developer",
    contribution:
      "Implemented the content page and wrote most of the project documentation.",
    github: "https://github.com/VIVII-viix",
  },
];

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
                Records are refreshed from the source on a daily schedule, and
                assets that disappear from the source or change to an
                unsupported license are hidden from search.
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
                  with the asset types we include, the licenses we accept, and
                  a link to the source&apos;s own reuse terms.
                </p>
                <ul className="mt-4 space-y-4 text-sm">
                  {supportedSources.map(
                    ({ name, types, licenses, scope, termsUrl }) => (
                      <li key={name}>
                        <p className="font-semibold">{name}</p>
                        <dl className="mt-1 space-y-1">
                          <div className="flex gap-1">
                            <dt className="shrink-0 font-semibold">
                              Asset types:
                            </dt>
                            <dd className="text-black/80">{types}</dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="shrink-0 font-semibold">
                              Licenses:
                            </dt>
                            <dd className="text-black/80">{licenses}</dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="shrink-0 font-semibold">
                              Collected from:
                            </dt>
                            <dd className="text-black/80">{scope}</dd>
                          </div>
                        </dl>
                        <a
                          href={termsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block font-semibold underline"
                        >
                          Source license terms
                        </a>
                      </li>
                    ),
                  )}
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
                    <Link
                      href={`${REPO_URL}/issues`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      How to contribute (issues and pull requests)
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
              {creators.map(({ name, roles, contribution, github }) => (
                <div key={name} className={cardClass}>
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="mt-3 text-sm text-black/70">
                    <span className="font-semibold">Roles:</span> {roles}
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    <span className="font-semibold">Contribution:</span>{" "}
                    {contribution}
                  </p>
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-semibold underline"
                  >
                    GitHub profile
                  </a>
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
              Questions, corrections or removal requests? Open an issue on our{" "}
              <a
                href={REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                GitHub repository
              </a>{" "}
              (a free GitHub account is needed). Include the asset&apos;s link
              and the reason. A dedicated report form is coming soon.
            </p>
          </Section>
        </div>
      </div>

      <PageNav items={navItems} />
    </main>
  );
}
