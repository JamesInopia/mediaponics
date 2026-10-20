import type { ReactNode } from "react";
import { Info } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageNav from "@/components/PageNav";

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const sources = [
  { title: "Supported Source", text: LOREM },
  { title: "Open Source", text: LOREM },
];

const creators = [
  { name: "Creator 1", roles: "", contribution: "" },
  { name: "Creator 2", roles: "", contribution: "" },
];

const navItems = [
  { id: "about-the-project", label: "About the Project" },
  { id: "how-it-works", label: "How it works" },
  { id: "sources", label: "Sources" },
  { id: "creators", label: "Creators" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "contact", label: "Contact" },
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

const cardClass =
  "rounded-xl border border-black/10 bg-white p-6 shadow-md";

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
          <Section id="about-the-project" title="About the Project">
            <p className="text-sm leading-7 text-black/70">{LOREM}</p>
          </Section>

          <Section id="how-it-works" title="How it works">
            <p className="text-sm leading-7 text-black/70">{LOREM}</p>
          </Section>

          <Section id="sources" title="Sources">
            <div className="grid gap-6 md:grid-cols-2">
              {sources.map(({ title, text }) => (
                <article key={title} className={cardClass}>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-black/70">{text}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section id="creators" title="Creators">
            <div className="grid gap-6 md:grid-cols-2">
              {creators.map(({ name, roles, contribution }) => (
                <article key={name} className={cardClass}>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-full border border-black/10 bg-neutral-100" />
                    <h3 className="text-xl font-bold">{name}</h3>
                  </div>
                  <dl className="mt-4 space-y-1 text-sm">
                    <div className="flex gap-1">
                      <dt className="font-semibold">Roles:</dt>
                      <dd className="text-black/70">{roles}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="font-semibold">Contribution:</dt>
                      <dd className="text-black/70">{contribution}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </Section>

          <Section id="disclaimer" title="Disclaimer">
            <p className="text-sm leading-7 text-black/70">{LOREM}</p>
          </Section>

          <Section id="contact" title="Contact">
            <p className="text-sm leading-7 text-black/70">{LOREM}</p>
          </Section>
        </div>
      </div>

      <PageNav items={navItems} />
    </main>
  );
}
